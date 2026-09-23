/**
 * FarmLink India - End-to-End Automated Verification Test Suite
 * Tests all required business logic, atomic reservation, smart matching, and mandatory test cases.
 */

const assert = require('assert');
const path = require('path');

// Ensure DB_PATH points to a clean test database for isolation
process.env.DB_PATH = 'farmlink_test.db';
const { initDatabase, db, get, query, run } = require('./backend/src/config/database');
const matchingEngine = require('./backend/src/services/matchingEngine');
const reservationService = require('./backend/src/services/reservationService');
const marketPriceService = require('./backend/src/services/marketPriceService');
const aiAssistantService = require('./backend/src/services/aiAssistantService');

console.log('🌾 ========================================================');
console.log('🌾 FARMLINK INDIA - AUTOMATED TEST SUITE');
console.log('🌾 ========================================================\n');

function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}`);
      console.error(`   Error: ${err.message}\n`);
      failed++;
    }
  }

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}`);
      console.error(`   Error: ${err.message}\n`);
      failed++;
    }
  }

  // 1. Initialize Database
  test('Database Initialization & Seed Integrity', () => {
    initDatabase();
    const userCount = get('SELECT COUNT(*) as count FROM users').count;
    const statesCount = get('SELECT COUNT(*) as count FROM states').count;
    const cropsCount = get('SELECT COUNT(*) as count FROM crops').count;
    const mandiPricesCount = get('SELECT COUNT(*) as count FROM market_prices').count;

    assert(userCount >= 6, `Expected at least 6 users, found ${userCount}`);
    assert(statesCount >= 10, `Expected at least 10 states, found ${statesCount}`);
    assert(cropsCount >= 15, `Expected at least 15 crops, found ${cropsCount}`);
    assert(mandiPricesCount >= 5, `Expected mandi prices seeded, found ${mandiPricesCount}`);
  });

  // 2. MANDATORY TEST CASE 1: Multi-Farmer Partial Supply Aggregation
  // Farmer A: Tomato 700 kg, Farmer B: Tomato 800 kg, Farmer C: Tomato 500 kg -> Buyer needs 2,000 kg
  // Expected: 700 + 800 + 500 = 2,000 kg
  test('Mandatory Scenario 1: Multi-Farmer Partial Supply Aggregation (700 + 800 + 500 = 2,000 kg)', () => {
    // Find requirement for 2,000 kg Tomato
    const tomatoReq = get("SELECT * FROM requirements WHERE LOWER(crop_name) = 'tomato' AND quantity_required = 2000");
    assert(tomatoReq, 'Requirement for 2,000 kg Tomato must exist');

    const result = matchingEngine.getMatchesForRequirement(tomatoReq.id);
    assert(result.matches.length >= 3, `Expected at least 3 matching farmer listings, got ${result.matches.length}`);

    // Verify partial supply combination
    const agg = result.aggregation;
    console.log(`   -> Aggregation result: Required ${agg.quantityRequired} kg, Matched ${agg.totalAvailableMatched} kg`);
    console.log(`   -> Participating Farmers: ${agg.participatingFarmersCount}`);
    
    assert.strictEqual(agg.quantityRequired, 2000, 'Required quantity must be 2000');
    assert.strictEqual(agg.totalAvailableMatched, 2000, 'Matched total must equal 2000 kg');
    assert.strictEqual(agg.remainingShortfall, 0, 'Shortfall must be 0 kg');
    assert.strictEqual(agg.fulfilledPercentage, 100, 'Fulfillment percentage must be 100%');

    // Verify individual allocations
    const allocations = agg.suggestedCombination.map(c => ({
      farmer: c.farmerName,
      qty: c.allocatedQty
    }));
    console.log('   -> Allocations:', JSON.stringify(allocations));

    const totalAllocated = agg.suggestedCombination.reduce((sum, c) => sum + c.allocatedQty, 0);
    assert.strictEqual(totalAllocated, 2000, 'Sum of partial allocations must equal 2,000 kg');
  });

  // 3. MANDATORY TEST CASE 2: Double-Selling Prevention & Transactional Quantity Reservation
  // Farmer has 1,000 kg. Buyer A offers 800 kg. Accept & reserve -> Total = 1,000, Reserved = 800, Available = 200.
  // Buyer B must NOT be able to reserve another 800 kg!
  test('Mandatory Scenario 2: Double-Selling Prevention & Transactional Quantity Reservation', () => {
    // Create new listing for Farmer A with 1,000 kg
    const farmer = get("SELECT id FROM users WHERE role = 'farmer' LIMIT 1");
    const buyerA = get("SELECT id FROM users WHERE role = 'buyer' LIMIT 1");
    const buyerB = get("SELECT id FROM users WHERE role = 'buyer' AND id != ? LIMIT 1", [buyerA.id]);

    const listingRes = run(`
      INSERT INTO listings (
        farmer_id, crop_name, category_name, variety,
        total_qty, available_qty, reserved_qty, confirmed_qty,
        unit, quality, expected_price, state, district, market_apmc, status
      ) VALUES (?, 'Potato', 'Vegetables', 'Kufri Jyoti', 1000, 1000, 0, 0, 'kg', 'Grade A', 20, 'Telangana', 'Hyderabad', 'Bowenpally APMC Market', 'ACTIVE')
    `, [farmer.id]);
    const listingId = listingRes.lastInsertRowid;

    // Buyer A creates offer for 800 kg
    const offerARes = run(`
      INSERT INTO offers (listing_id, farmer_id, buyer_id, quantity, unit, price_per_unit, total_amount, status)
      VALUES (?, ?, ?, 800, 'kg', 20, 16000, 'PENDING')
    `, [listingId, farmer.id, buyerA.id]);
    const offerAId = offerARes.lastInsertRowid;

    // Farmer accepts Buyer A's offer -> Reserve 800 kg
    const reservationA = reservationService.reserveQuantity(listingId, buyerA.id, offerAId, 800);
    assert(reservationA.success, 'Reservation A must succeed');

    // Check listing state: Total = 1,000, Reserved = 800, Available = 200
    const stateAfterA = reservationService.getAvailableQuantity(listingId);
    console.log(`   -> After Buyer A reservation: Total=${stateAfterA.total}, Reserved=${stateAfterA.reserved}, Available=${stateAfterA.available}`);
    assert.strictEqual(stateAfterA.total, 1000, 'Total must remain 1,000');
    assert.strictEqual(stateAfterA.reserved, 800, 'Reserved must be 800');
    assert.strictEqual(stateAfterA.available, 200, 'Available must be 200');

    // Buyer B attempts to reserve 800 kg -> MUST FAIL & throw Insufficient available quantity error
    const offerBRes = run(`
      INSERT INTO offers (listing_id, farmer_id, buyer_id, quantity, unit, price_per_unit, total_amount, status)
      VALUES (?, ?, ?, 800, 'kg', 20, 16000, 'PENDING')
    `, [listingId, farmer.id, buyerB.id]);
    const offerBId = offerBRes.lastInsertRowid;

    let errorThrown = false;
    try {
      reservationService.reserveQuantity(listingId, buyerB.id, offerBId, 800);
    } catch (err) {
      errorThrown = true;
      console.log(`   -> Successfully prevented double-sell: "${err.message}"`);
      assert(err.message.includes('Insufficient available quantity'), 'Error must specify insufficient available quantity');
    }
    assert(errorThrown, 'Double-selling was NOT prevented! System allowed over-reservation.');

    // Buyer B CAN however reserve 200 kg (the exact remaining available)
    const reservationBPartial = reservationService.reserveQuantity(listingId, buyerB.id, offerBId, 200);
    assert(reservationBPartial.success, 'Buyer B reserving exactly remaining 200 kg should succeed');
    const stateAfterB = reservationService.getAvailableQuantity(listingId);
    assert.strictEqual(stateAfterB.available, 0, 'Available must now be 0');
    assert.strictEqual(stateAfterB.reserved, 1000, 'Total reserved must now be 1,000');
  });

  // 4. Order Confirmation Lifecycle
  // Reserved -> Confirmed -> Order Created -> Invariant Preserved
  test('Order Confirmation Lifecycle & Quantity Accounting', () => {
    const farmer = get("SELECT id FROM users WHERE role = 'farmer' LIMIT 1");
    const buyer = get("SELECT id FROM users WHERE role = 'buyer' LIMIT 1");

    const listingRes = run(`
      INSERT INTO listings (
        farmer_id, crop_name, category_name, variety,
        total_qty, available_qty, reserved_qty, confirmed_qty,
        unit, quality, expected_price, state, district, market_apmc, status
      ) VALUES (?, 'Wheat', 'Cereals', 'Sharbati', 500, 500, 0, 0, 'quintal', 'Grade A', 2600, 'Punjab', 'Ludhiana', 'Khanna Grain Mandi', 'ACTIVE')
    `, [farmer.id]);
    const listingId = listingRes.lastInsertRowid;

    const offerRes = run(`
      INSERT INTO offers (listing_id, farmer_id, buyer_id, quantity, unit, price_per_unit, total_amount, status)
      VALUES (?, ?, ?, 300, 'quintal', 2600, 780000, 'PENDING')
    `, [listingId, farmer.id, buyer.id]);
    const offerId = offerRes.lastInsertRowid;

    // Reserve 300 quintal
    reservationService.reserveQuantity(listingId, buyer.id, offerId, 300);

    // Confirm reservation
    const confirmResult = reservationService.confirmReservation(offerId);
    assert(confirmResult.success, 'Confirm reservation must succeed');

    const state = reservationService.getAvailableQuantity(listingId);
    console.log(`   -> Confirmed order state: Total=${state.total}, Reserved=${state.reserved}, Confirmed=${state.confirmed}, Available=${state.available}`);
    assert.strictEqual(state.confirmed, 300, 'Confirmed quantity must be 300');
    assert.strictEqual(state.reserved, 0, 'Reserved quantity must return to 0');
    assert.strictEqual(state.available, 200, 'Available quantity must be 200');
    assert(state.reserved + state.confirmed <= state.total, 'Invariant total >= reserved + confirmed violated!');
  });

  // 5. Smart Matching Engine Factor Calculation
  test('Smart Matching Factor Score & Classification', () => {
    const listing = {
      crop_name: 'Tomato',
      quality: 'Grade A',
      market_apmc: 'Bowenpally APMC Market',
      district: 'Hyderabad',
      state: 'Telangana',
      expected_price: 24,
      unit: 'kg',
      available_until: '2026-10-10'
    };

    const requirement = {
      crop_name: 'Tomato',
      required_quality: 'Grade A',
      location: 'Bowenpally APMC Market',
      district: 'Hyderabad',
      state: 'Telangana',
      max_target_price: 26,
      unit: 'kg',
      required_date: '2026-10-05'
    };

    const result = matchingEngine.calculateMatchScore(listing, requirement);
    console.log(`   -> Match Score: ${result.score}%, Classification: ${result.classification}`);
    assert(result.score >= 90, `Expected score >= 90%, got ${result.score}%`);
    assert.strictEqual(result.classification, 'Excellent Match');
    assert(result.reasons.length >= 4, 'Expected detailed reasons breakdown');
  });

  // 6. Market Price Benchmark Query & Disclaimer
  test('Market Price Service & Demo Labeling Integrity', async () => {
    const prices = await marketPriceService.getMarketPrices({ crop: 'Tomato', state: 'Telangana' });
    assert.strictEqual(prices.source, 'Sample/Demo Data', 'Demo data must be explicitly labeled');
    assert.strictEqual(prices.isLive, false, 'isLive must be false when using sample data');
    assert(prices.notice.includes('Live data unavailable'), 'Must have clear live data unavailable notice');
    assert(prices.data.length > 0, 'Must return seeded benchmark mandi prices');
    console.log(`   -> Fetched ${prices.data.length} benchmark prices for Tomato in Telangana`);
  });

  // 7. FarmLink AI Assistant Context & Marketplace Query
  test('AI Assistant Context Awareness & Database Lookup', async () => {
    const response = await aiAssistantService.processMessage({
      message: 'Who is buying tomatoes near Hyderabad?',
      userContext: { state: 'Telangana', district: 'Hyderabad', role: 'farmer' }
    });

    console.log('   -> AI Assistant Response Snippet:', response.reply.slice(0, 100) + '...');
    assert.strictEqual(response.assistantType, 'Rule-Based FarmLink Assistant', 'Must clearly label rule-based assistant');
    assert(response.reply.includes('Ravi Agro Foods'), 'Response must identify real buyer from marketplace DB');
    assert(response.reply.includes('2000') || response.reply.includes('2,000'), 'Response must specify actual demand quantity');
  });

  console.log('\n🌾 ========================================================');
  console.log(`🌾 TEST RUN COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('🌾 ========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
