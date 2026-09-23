import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  Package,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  RefreshCw,
  PhoneCall
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AudioSpeaker from '../components/AudioSpeaker';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();

  const [listings, setListings] = useState([]);
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Counter Modal State
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterQty, setCounterQty] = useState('');
  const [counterNotes, setCounterNotes] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [listRes, offRes, ordRes, matchRes] = await Promise.all([
        api.get(`/listings?farmer_id=${user.id}`),
        api.get('/offers'),
        api.get('/orders'),
        api.get('/matches')
      ]);

      setListings(listRes.listings || []);
      setOffers(offRes.offers || []);
      setOrders(ordRes.orders || []);
      setMatches(matchRes.matches || []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  // Aggregate quantity metrics
  const totals = listings.reduce((acc, l) => {
    acc.total += l.total_qty || 0;
    acc.available += l.available_qty || 0;
    acc.reserved += l.reserved_qty || 0;
    acc.confirmed += l.confirmed_qty || 0;
    return acc;
  }, { total: 0, available: 0, reserved: 0, confirmed: 0 });

  const pendingOffers = offers.filter(o => o.status === 'PENDING' || (o.status === 'COUNTERED' && o.counter_by === 'buyer'));

  const handleAcceptOffer = async (offerId) => {
    if (!window.confirm('Accept this offer? This will atomically reserve the requested harvest quantity for 24 hours.')) {
      return;
    }
    try {
      setActionLoading(true);
      await api.patch(`/offers/${offerId}`, { action: 'accept' });
      await loadData();
    } catch (err) {
      alert(`Accept failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOffer = async (offerId) => {
    if (!window.confirm('Decline this offer?')) return;
    try {
      setActionLoading(true);
      await api.patch(`/offers/${offerId}`, { action: 'reject' });
      await loadData();
    } catch (err) {
      alert(`Reject failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const openCounterModal = (offer) => {
    setSelectedOffer(offer);
    setCounterPrice(offer.price_per_unit);
    setCounterQty(offer.quantity);
    setCounterNotes('');
    setCounterModalOpen(true);
  };

  const submitCounter = async (e) => {
    e.preventDefault();
    if (!counterPrice || isNaN(counterPrice)) {
      alert('Please enter a valid counter price.');
      return;
    }
    try {
      setActionLoading(true);
      await api.patch(`/offers/${selectedOffer.id}`, {
        action: 'counter',
        counter_price: parseFloat(counterPrice),
        counter_qty: parseFloat(counterQty),
        notes: counterNotes
      });
      setCounterModalOpen(false);
      await loadData();
    } catch (err) {
      alert(`Counter failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        {/* Welcome Banner */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '1.75rem' }}>👨‍🌾</span>
              <div>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1b4332' }}>
                  Namaste, {user?.name}
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Farmer Dashboard • {user?.profile?.market_apmc || 'Bowenpally APMC'}, {user?.profile?.district || 'Hyderabad'}, {user?.profile?.state || 'Telangana'}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AudioSpeaker
              text={`Namaste ${user?.name}. You have ${listings.length} active crop listings. Available quantity is ${totals.available.toFixed(0)} kilograms. ${totals.reserved.toFixed(0)} kilograms are reserved, and ${totals.confirmed.toFixed(0)} kilograms confirmed.`}
              lang={lang}
              label="Listen to Summary"
            />
            <Link to="/produce" className="btn btn-primary" style={{ fontWeight: 700 }}>
              <PlusCircle size={18} />
              + Publish Produce
            </Link>
          </div>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '8px', color: '#dc2626', marginBottom: '1.5rem' }}>
            {errorMsg}
          </div>
        )}

        {/* 4 Quantitative Status Cards (Requirement 5 & 17) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {/* Card 1: Total Produce */}
          <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Total Harvest Listed
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e293b', marginTop: '0.35rem' }}>
              {totals.total.toLocaleString()} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>kg</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '0.35rem', fontWeight: 600 }}>
              Across {listings.length} active listings
            </p>
          </div>

          {/* Card 2: Available Quantity */}
          <div className="card" style={{ borderLeft: '4px solid #22c55e' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Available for Sale
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#15803d', marginTop: '0.35rem' }}>
              {totals.available.toLocaleString()} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>kg</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
              Uncommitted stock ready for buyers
            </p>
          </div>

          {/* Card 3: Reserved Quantity (Atomic Lock) */}
          <div className="card" style={{ borderLeft: '4px solid #d97706' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Locked / Reserved
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#b45309', marginTop: '0.35rem' }}>
              {totals.reserved.toLocaleString()} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>kg</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '0.35rem', fontWeight: 600 }}>
              24h Atomic Reservation active
            </p>
          </div>

          {/* Card 4: Confirmed Quantity */}
          <div className="card" style={{ borderLeft: '4px solid #2563eb' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Confirmed Orders (Sold)
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1d4ed8', marginTop: '0.35rem' }}>
              {totals.confirmed.toLocaleString()} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>kg</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#2563eb', marginTop: '0.35rem', fontWeight: 600 }}>
              {orders.length} orders in progress
            </p>
          </div>
        </div>

        {/* Pending Offers Alert Section */}
        {pendingOffers.length > 0 && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '2px solid #fde68a',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} color="#b45309" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#92400e' }}>
                  Action Needed: {pendingOffers.length} Pending Buyer Offer(s)
                </h3>
              </div>
              <Link to="/offers" style={{ color: '#b45309', fontWeight: 700, fontSize: '0.85rem' }}>
                View all in Offers tab →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {pendingOffers.map(o => (
                <div key={o.id} style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  border: '1px solid #fcd34d'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '1rem', color: '#1e293b' }}>{o.crop_name}</strong>
                      <span className="badge badge-active">{o.quantity} {o.unit}</span>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>from <strong>{o.buyer_name}</strong></span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>
                      Offered Price: <strong style={{ color: '#15803d' }}>₹{o.price_per_unit}/{o.unit}</strong> • Total: ₹{o.total_amount.toLocaleString()}
                      {o.notes && <span style={{ fontStyle: 'italic', marginLeft: '0.5rem' }}>("{o.notes}")</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleAcceptOffer(o.id)}
                      disabled={actionLoading}
                      className="btn btn-sm btn-success"
                    >
                      <CheckCircle size={15} />
                      Accept & Reserve
                    </button>
                    <button
                      onClick={() => openCounterModal(o)}
                      disabled={actionLoading}
                      className="btn btn-sm btn-accent"
                    >
                      Counter
                    </button>
                    <button
                      onClick={() => handleRejectOffer(o.id)}
                      disabled={actionLoading}
                      className="btn btn-sm btn-danger"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Produce Listings */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e293b' }}>
              My Active Produce Listings ({listings.length})
            </h2>
            <Link to="/produce" className="btn btn-sm btn-secondary">
              Manage Produce →
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <span style={{ fontSize: '2.5rem' }}>🌾</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginTop: '0.5rem' }}>
                No active produce listings yet
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.5rem 0 1.25rem 0' }}>
                List your tomato, onion, wheat, or other harvests to start receiving direct buyer offers.
              </p>
              <Link to="/produce" className="btn btn-primary">
                + Publish Your First Produce
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {listings.map(l => (
                <div key={l.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>
                        {l.crop_name}
                      </h3>
                      <p style={{ color: '#64748b', fontSize: '0.8rem' }}>{l.variety} • {l.quality}</p>
                    </div>
                    <span className={`badge badge-${l.status === 'ACTIVE' ? 'active' : l.status === 'PARTIALLY_RESERVED' ? 'reserved' : 'soldout'}`}>
                      {l.status}
                    </span>
                  </div>

                  {/* Quantity Breakdown Bar */}
                  <div style={{ margin: '1rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: '#15803d', fontWeight: 700 }}>Available: {l.available_qty} {l.unit}</span>
                      <span style={{ color: '#64748b' }}>Total: {l.total_qty} {l.unit}</span>
                    </div>

                    <div className="qty-bar">
                      <div
                        className="qty-bar-avail"
                        style={{ width: `${(l.available_qty / l.total_qty) * 100}%` }}
                        title={`Available: ${l.available_qty} ${l.unit}`}
                      />
                      <div
                        className="qty-bar-res"
                        style={{ width: `${(l.reserved_qty / l.total_qty) * 100}%` }}
                        title={`Reserved: ${l.reserved_qty} ${l.unit}`}
                      />
                      <div
                        className="qty-bar-conf"
                        style={{ width: `${(l.confirmed_qty / l.total_qty) * 100}%` }}
                        title={`Confirmed Sold: ${l.confirmed_qty} ${l.unit}`}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>
                      <span>🟡 Reserved: <strong>{l.reserved_qty} {l.unit}</strong></span>
                      <span>🔵 Sold: <strong>{l.confirmed_qty} {l.unit}</strong></span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1b4332' }}>
                      ₹{l.expected_price} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>/ {l.unit}</span>
                    </div>
                    <Link
                      to={`/matches?listingId=${l.id}`}
                      className="btn btn-sm btn-secondary"
                      style={{ fontSize: '0.8rem' }}
                    >
                      <Sparkles size={14} color="#d97706" />
                      View Matches
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Counter Offer Modal */}
        {counterModalOpen && (
          <div className="modal-overlay" onClick={() => setCounterModalOpen(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                Counter Offer to {selectedOffer?.buyer_name}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Crop: <strong>{selectedOffer?.crop_name}</strong> • Current Offer: ₹{selectedOffer?.price_per_unit}/{selectedOffer?.unit} for {selectedOffer?.quantity} {selectedOffer?.unit}
              </p>

              <form onSubmit={submitCounter}>
                <div className="form-group">
                  <label className="form-label">Your Counter Price (₹ per {selectedOffer?.unit}) *</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={counterPrice}
                    onChange={e => setCounterPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity ({selectedOffer?.unit}) *</label>
                  <input
                    type="number"
                    step="1"
                    className="form-input"
                    value={counterQty}
                    onChange={e => setCounterQty(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes / Reasons for Counter</label>
                  <input
                    type="text"
                    placeholder="e.g., Grade A premium sorting, direct APMC yard pickup available"
                    className="form-input"
                    value={counterNotes}
                    onChange={e => setCounterNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button type="button" onClick={() => setCounterModalOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={actionLoading} className="btn btn-accent">
                    {actionLoading ? 'Sending...' : 'Send Counter Offer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
