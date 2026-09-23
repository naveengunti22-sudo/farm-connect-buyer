const { db, get, query, run, transaction } = require('../config/database');

class ReservationService {
  /**
   * Calculate and fetch up-to-date quantity state for a listing.
   * Invariant: available = total - reserved - confirmed
   */
  getAvailableQuantity(listingId) {
    const listing = get(`
      SELECT id, total_qty, available_qty, reserved_qty, confirmed_qty, unit, status
      FROM listings 
      WHERE id = ?
    `, [listingId]);

    if (!listing) {
      throw new Error(`Listing #${listingId} not found.`);
    }

    const calculatedAvailable = Number(
      Math.max(0, listing.total_qty - (listing.reserved_qty + listing.confirmed_qty)).toFixed(2)
    );

    return {
      listingId: listing.id,
      total: Number(listing.total_qty.toFixed(2)),
      reserved: Number(listing.reserved_qty.toFixed(2)),
      confirmed: Number(listing.confirmed_qty.toFixed(2)),
      available: calculatedAvailable,
      unit: listing.unit,
      status: listing.status
    };
  }

  /**
   * Atomically reserve quantity when a farmer accepts an offer.
   * Prevents double-selling.
   */
  reserveQuantity(listingId, buyerId, offerId, requestedQty, expiryMinutes = 1440) {
    return transaction(() => {
      // 1. Fetch current listing with row lock logic
      const listing = get(`
        SELECT id, farmer_id, crop_name, total_qty, available_qty, reserved_qty, confirmed_qty, unit, status
        FROM listings 
        WHERE id = ?
      `, [listingId]);

      if (!listing) {
        const error = new Error(`Listing #${listingId} not found.`);
        error.statusCode = 404;
        throw error;
      }

      if (listing.status === 'INACTIVE' || listing.status === 'SOLD_OUT') {
        const error = new Error(`Listing #${listingId} is not active (Status: ${listing.status}).`);
        error.statusCode = 400;
        throw error;
      }

      const currentAvailable = Number(
        (listing.total_qty - (listing.reserved_qty + listing.confirmed_qty)).toFixed(2)
      );

      if (requestedQty > currentAvailable) {
        const error = new Error(
          `Insufficient available quantity. Only ${currentAvailable} ${listing.unit} available ` +
          `(${listing.reserved_qty} ${listing.unit} currently reserved, ${listing.confirmed_qty} ${listing.unit} confirmed). ` +
          `Requested: ${requestedQty} ${listing.unit}.`
        );
        error.statusCode = 400;
        throw error;
      }

      // Check if reservation already exists for this offer
      const existingRes = get('SELECT id, status FROM reservations WHERE offer_id = ?', [offerId]);
      if (existingRes && existingRes.status === 'ACTIVE') {
        return existingRes;
      }

      // 2. Calculate updated quantities
      const newReserved = Number((listing.reserved_qty + requestedQty).toFixed(2));
      const newAvailable = Number((currentAvailable - requestedQty).toFixed(2));
      const newStatus = newAvailable <= 0 ? 'PARTIALLY_RESERVED' : listing.status;

      // 3. Update listing
      run(`
        UPDATE listings 
        SET reserved_qty = ?, available_qty = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [newReserved, newAvailable, newStatus, listingId]);

      // 4. Calculate expiration timestamp
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();

      // 5. Create or update reservation record
      let reservationId;
      if (existingRes) {
        run(`
          UPDATE reservations 
          SET reserved_qty = ?, unit = ?, status = 'ACTIVE', expires_at = ?, created_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [requestedQty, listing.unit, expiresAt, existingRes.id]);
        reservationId = existingRes.id;
      } else {
        const resResult = run(`
          INSERT INTO reservations (listing_id, buyer_id, offer_id, reserved_qty, unit, status, expires_at)
          VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?)
        `, [listingId, buyerId, offerId, requestedQty, listing.unit, expiresAt]);
        reservationId = resResult.lastInsertRowid;
      }

      // 6. Update Offer status to RESERVED
      run(`
        UPDATE offers 
        SET status = 'RESERVED', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [offerId]);

      return {
        success: true,
        reservationId,
        listingId,
        offerId,
        reservedQty: requestedQty,
        availableRemaining: newAvailable,
        expiresAt
      };
    });
  }

  /**
   * Release reserved quantity back to available pool (e.g. rejection, cancellation, or expiry).
   */
  releaseReservation(offerId, reason = 'cancelled') {
    return transaction(() => {
      const reservation = get(`
        SELECT id, listing_id, reserved_qty, unit, status 
        FROM reservations 
        WHERE offer_id = ?
      `, [offerId]);

      if (!reservation || reservation.status !== 'ACTIVE') {
        return { released: false, message: 'No active reservation to release.' };
      }

      const listing = get(`
        SELECT id, total_qty, available_qty, reserved_qty, confirmed_qty, status 
        FROM listings 
        WHERE id = ?
      `, [reservation.listing_id]);

      if (listing) {
        const newReserved = Math.max(0, Number((listing.reserved_qty - reservation.reserved_qty).toFixed(2)));
        const newAvailable = Number((listing.total_qty - (newReserved + listing.confirmed_qty)).toFixed(2));
        const newStatus = listing.status === 'PARTIALLY_RESERVED' && newAvailable > 0 ? 'ACTIVE' : (listing.status || 'ACTIVE');

        run(`
          UPDATE listings 
          SET reserved_qty = ?, available_qty = ?, status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [newReserved, newAvailable, newStatus, listing.id]);
      }

      const targetStatus = reason === 'expired' ? 'EXPIRED' : 'RELEASED';
      run(`
        UPDATE reservations 
        SET status = ?
        WHERE id = ?
      `, [targetStatus, reservation.id]);

      return { released: true, releasedQty: reservation.reserved_qty };
    });
  }

  /**
   * Confirm reservation into a finalized confirmed order.
   * Reserved decreases, Confirmed increases. Double-selling permanently prevented.
   */
  confirmReservation(offerId) {
    return transaction(() => {
      const reservation = get(`
        SELECT id, listing_id, buyer_id, reserved_qty, unit, status 
        FROM reservations 
        WHERE offer_id = ?
      `, [offerId]);

      if (!reservation || reservation.status !== 'ACTIVE') {
        const error = new Error('No active reservation found for this offer.');
        error.statusCode = 400;
        throw error;
      }

      const listing = get(`
        SELECT id, farmer_id, total_qty, available_qty, reserved_qty, confirmed_qty, status 
        FROM listings 
        WHERE id = ?
      `, [reservation.listing_id]);

      if (!listing) {
        const error = new Error('Associated listing not found.');
        error.statusCode = 404;
        throw error;
      }

      const confirmedDelta = reservation.reserved_qty;
      const newReserved = Math.max(0, Number((listing.reserved_qty - confirmedDelta).toFixed(2)));
      const newConfirmed = Number((listing.confirmed_qty + confirmedDelta).toFixed(2));
      const newAvailable = Math.max(0, Number((listing.total_qty - (newReserved + newConfirmed)).toFixed(2)));

      let newStatus = listing.status || 'ACTIVE';
      if (newAvailable === 0 && newReserved === 0) {
        newStatus = 'SOLD_OUT';
      } else if (newAvailable === 0 && newReserved > 0) {
        newStatus = 'PARTIALLY_RESERVED';
      }

      // Update Listing
      run(`
        UPDATE listings 
        SET reserved_qty = ?, confirmed_qty = ?, available_qty = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [newReserved, newConfirmed, newAvailable, newStatus, listing.id]);

      // Update Reservation
      run(`
        UPDATE reservations 
        SET status = 'CONFIRMED' 
        WHERE id = ?
      `, [reservation.id]);

      // Update Offer
      run(`
        UPDATE offers 
        SET status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [offerId]);

      return {
        success: true,
        confirmedQty: confirmedDelta,
        remainingAvailable: newAvailable,
        totalSold: newConfirmed
      };
    });
  }

  /**
   * Periodic or on-demand sweeper to expire overdue reservations.
   */
  expireOverdueReservations() {
    const expiredList = query(`
      SELECT r.id, r.offer_id, r.listing_id, r.reserved_qty, r.unit
      FROM reservations r
      WHERE r.status = 'ACTIVE' AND r.expires_at < CURRENT_TIMESTAMP
    `);

    let expiredCount = 0;
    for (const res of expiredList) {
      try {
        this.releaseReservation(res.offer_id, 'expired');
        run(`
          UPDATE offers 
          SET status = 'EXPIRED', updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [res.offer_id]);

        run(`
          INSERT INTO offer_history (offer_id, actor_id, actor_role, action, price_per_unit, quantity, notes)
          SELECT id, farmer_id, 'system', 'EXPIRED', price_per_unit, quantity, 'Reservation expired after timeout'
          FROM offers WHERE id = ?
        `, [res.offer_id]);

        expiredCount++;
      } catch (err) {
        console.error(`Failed to expire reservation #${res.id}:`, err);
      }
    }

    return { expiredCount };
  }
}

module.exports = new ReservationService();
