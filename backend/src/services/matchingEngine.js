const { query, get } = require('../config/database');

class MatchingEngine {
  /**
   * Calculate detailed match breakdown between a listing and a requirement
   */
  calculateMatchScore(listing, requirement) {
    const reasons = [];

    // 1. Crop Match (Weight: 35%)
    let cropScore = 0;
    if (listing.crop_name.toLowerCase().trim() === requirement.crop_name.toLowerCase().trim()) {
      cropScore = 100;
      reasons.push(`Exact crop match: ${listing.crop_name}`);
    } else {
      reasons.push(`Crop mismatch: ${listing.crop_name} vs ${requirement.crop_name}`);
      return {
        score: 0,
        classification: 'No Match',
        breakdown: { crop: 0, quality: 0, location: 0, price: 0, date: 0 },
        reasons
      };
    }

    // 2. Quality Match (Weight: 10%)
    let qualityScore = 70;
    const lQuality = (listing.quality || '').toLowerCase();
    const rQuality = (requirement.required_quality || '').toLowerCase();
    if (lQuality === rQuality) {
      qualityScore = 100;
      reasons.push(`Exact quality grade match: ${listing.quality}`);
    } else if (lQuality.includes('grade a') && !rQuality.includes('grade a')) {
      qualityScore = 95; // Premium quality offered for lower demand
      reasons.push(`Higher quality offered (${listing.quality}) than requested (${requirement.required_quality})`);
    } else if (!lQuality.includes('grade a') && rQuality.includes('grade a')) {
      qualityScore = 60;
      reasons.push(`Quality grade is ${listing.quality}, buyer requested ${requirement.required_quality}`);
    } else {
      reasons.push(`Quality standard compatible: ${listing.quality}`);
    }

    // 3. Location Match (Weight: 20%)
    let locationScore = 50;
    if (
      listing.market_apmc && requirement.location &&
      listing.market_apmc.toLowerCase().trim() === requirement.location.toLowerCase().trim()
    ) {
      locationScore = 100;
      reasons.push(`Same APMC market: ${listing.market_apmc}`);
    } else if (listing.district.toLowerCase() === requirement.district.toLowerCase()) {
      locationScore = 90;
      reasons.push(`Same district: ${listing.district}`);
    } else if (listing.state.toLowerCase() === requirement.state.toLowerCase()) {
      locationScore = 75;
      reasons.push(`Same state: ${listing.state}`);
    } else {
      locationScore = 55;
      reasons.push(`Interstate match: ${listing.state} to ${requirement.state}`);
    }

    // 4. Price Alignment (Weight: 25%)
    let priceScore = 100;
    const expected = listing.expected_price;
    const target = requirement.max_target_price;
    if (expected <= target) {
      priceScore = 100;
      reasons.push(`Price favorable: ₹${expected}/${listing.unit} is within buyer target (₹${target}/${requirement.unit})`);
    } else {
      const diffPct = ((expected - target) / target) * 100;
      priceScore = Math.max(20, Math.round(100 - diffPct * 2.5));
      reasons.push(`Farmer price ₹${expected}/${listing.unit} is ${diffPct.toFixed(1)}% above buyer target ₹${target}`);
    }

    // 5. Date Alignment (Weight: 10%)
    let dateScore = 80;
    if (listing.available_until && requirement.required_date) {
      const listingUntil = new Date(listing.available_until).getTime();
      const requiredDate = new Date(requirement.required_date).getTime();
      if (listingUntil >= requiredDate) {
        dateScore = 100;
        reasons.push('Supply available on or beyond required date');
      } else {
        const daysDiff = Math.round((requiredDate - listingUntil) / (1000 * 60 * 60 * 24));
        dateScore = Math.max(30, 100 - daysDiff * 10);
        reasons.push(`Listing ends ${daysDiff} day(s) before target date`);
      }
    } else {
      reasons.push('Immediate availability specified');
    }

    // Overall Weighted Score
    const totalScore = Math.round(
      0.35 * cropScore +
      0.25 * priceScore +
      0.20 * locationScore +
      0.10 * qualityScore +
      0.10 * dateScore
    );

    let classification = 'Low Match';
    if (totalScore >= 80) {
      classification = 'Excellent Match';
    } else if (totalScore >= 60) {
      classification = 'Good Match';
    }

    return {
      score: totalScore,
      classification,
      breakdown: {
        crop: cropScore,
        price: priceScore,
        location: locationScore,
        quality: qualityScore,
        date: dateScore
      },
      reasons
    };
  }

  /**
   * Smart matches for a buyer requirement, including multi-farmer partial supply aggregation
   */
  getMatchesForRequirement(requirementId) {
    const requirement = get(`
      SELECT r.*, u.name as buyer_name, u.phone as buyer_phone
      FROM requirements r
      JOIN users u ON r.buyer_id = u.id
      WHERE r.id = ?
    `, [requirementId]);

    if (!requirement) {
      throw new Error(`Requirement #${requirementId} not found.`);
    }

    // Active listings with available quantity > 0
    const listings = query(`
      SELECT l.*, u.name as farmer_name, u.phone as farmer_phone
      FROM listings l
      JOIN users u ON l.farmer_id = u.id
      WHERE l.status IN ('ACTIVE', 'PARTIALLY_RESERVED')
        AND l.available_qty > 0
        AND LOWER(l.crop_name) = LOWER(?)
      ORDER BY l.expected_price ASC, l.available_qty DESC
    `, [requirement.crop_name]);

    const scoredMatches = [];
    for (const listing of listings) {
      const matchResult = this.calculateMatchScore(listing, requirement);
      if (matchResult.score > 0) {
        scoredMatches.push({
          listingId: listing.id,
          farmerId: listing.farmer_id,
          farmerName: listing.farmer_name,
          crop: listing.crop_name,
          variety: listing.variety,
          totalQty: listing.total_qty,
          availableQty: listing.available_qty,
          reservedQty: listing.reserved_qty,
          confirmedQty: listing.confirmed_qty,
          unit: listing.unit,
          expectedPrice: listing.expected_price,
          targetPrice: requirement.max_target_price,
          quality: listing.quality,
          location: `${listing.market_apmc}, ${listing.district}, ${listing.state}`,
          availableUntil: listing.available_until,
          matchScore: matchResult.score,
          classification: matchResult.classification,
          breakdown: matchResult.breakdown,
          reasons: matchResult.reasons
        });
      }
    }

    // Sort by match score descending
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    // Multi-Farmer Supply Aggregation Calculation
    // Greedily combine available quantities to fulfill requirement
    let remainingNeeded = requirement.quantity_required;
    const suggestedCombination = [];
    let totalCombinedQty = 0;
    let totalCost = 0;

    for (const match of scoredMatches) {
      if (remainingNeeded <= 0) break;
      const allocatable = Math.min(match.availableQty, remainingNeeded);
      if (allocatable > 0) {
        suggestedCombination.push({
          listingId: match.listingId,
          farmerId: match.farmerId,
          farmerName: match.farmerName,
          availableQty: match.availableQty,
          allocatedQty: Number(allocatable.toFixed(2)),
          unit: match.unit,
          pricePerUnit: match.expectedPrice,
          subtotal: Number((allocatable * match.expectedPrice).toFixed(2)),
          location: match.location,
          matchScore: match.matchScore
        });
        totalCombinedQty += allocatable;
        totalCost += (allocatable * match.expectedPrice);
        remainingNeeded -= allocatable;
      }
    }

    const fulfilledPercentage = Number(
      Math.min(100, (totalCombinedQty / requirement.quantity_required) * 100).toFixed(1)
    );
    const averagePrice = totalCombinedQty > 0 
      ? Number((totalCost / totalCombinedQty).toFixed(2)) 
      : 0;

    return {
      requirement: {
        id: requirement.id,
        crop: requirement.crop_name,
        quantityRequired: requirement.quantity_required,
        unit: requirement.unit,
        maxTargetPrice: requirement.max_target_price,
        location: `${requirement.district}, ${requirement.state}`,
        status: requirement.status
      },
      matches: scoredMatches,
      aggregation: {
        quantityRequired: requirement.quantity_required,
        totalAvailableMatched: Number(totalCombinedQty.toFixed(2)),
        remainingShortfall: Number(Math.max(0, requirement.quantity_required - totalCombinedQty).toFixed(2)),
        fulfilledPercentage,
        averagePrice,
        participatingFarmersCount: suggestedCombination.length,
        suggestedCombination
      }
    };
  }

  /**
   * Smart matches for a farmer's produce listing
   */
  getMatchesForListing(listingId) {
    const listing = get(`
      SELECT l.*, u.name as farmer_name, u.phone as farmer_phone
      FROM listings l
      JOIN users u ON l.farmer_id = u.id
      WHERE l.id = ?
    `, [listingId]);

    if (!listing) {
      throw new Error(`Listing #${listingId} not found.`);
    }

    const requirements = query(`
      SELECT r.*, u.name as buyer_name, u.phone as buyer_phone
      FROM requirements r
      JOIN users u ON r.buyer_id = u.id
      WHERE r.status IN ('OPEN', 'PARTIALLY_FULFILLED')
        AND LOWER(r.crop_name) = LOWER(?)
      ORDER BY r.max_target_price DESC
    `, [listing.crop_name]);

    const scoredMatches = [];
    for (const req of requirements) {
      const matchResult = this.calculateMatchScore(listing, req);
      if (matchResult.score > 0) {
        scoredMatches.push({
          requirementId: req.id,
          buyerId: req.buyer_id,
          buyerName: req.buyer_name,
          buyerPhone: req.buyer_phone,
          crop: req.crop_name,
          quantityRequired: req.quantity_required,
          unit: req.unit,
          targetPrice: req.max_target_price,
          farmerExpectedPrice: listing.expected_price,
          requiredQuality: req.required_quality,
          location: `${req.location || ''}, ${req.district}, ${req.state}`,
          requiredDate: req.required_date,
          matchScore: matchResult.score,
          classification: matchResult.classification,
          breakdown: matchResult.breakdown,
          reasons: matchResult.reasons
        });
      }
    }

    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    return {
      listing: {
        id: listing.id,
        crop: listing.crop_name,
        availableQty: listing.available_qty,
        totalQty: listing.total_qty,
        unit: listing.unit,
        expectedPrice: listing.expected_price,
        location: `${listing.market_apmc}, ${listing.district}, ${listing.state}`
      },
      matches: scoredMatches
    };
  }

  /**
   * Global multi-match endpoint returning matches across active listings & requirements
   */
  getAllMatches(userId = null, userRole = null) {
    if (userRole === 'buyer' && userId) {
      const userReqs = query('SELECT id FROM requirements WHERE buyer_id = ? AND status != "CLOSED"', [userId]);
      return userReqs.map(r => this.getMatchesForRequirement(r.id));
    }

    if (userRole === 'farmer' && userId) {
      const userListings = query('SELECT id FROM listings WHERE farmer_id = ? AND status != "INACTIVE"', [userId]);
      return userListings.map(l => this.getMatchesForListing(l.id));
    }

    // Default: return top matches for all open requirements
    const openReqs = query('SELECT id FROM requirements WHERE status = "OPEN" LIMIT 10');
    return openReqs.map(r => this.getMatchesForRequirement(r.id));
  }
}

module.exports = new MatchingEngine();
