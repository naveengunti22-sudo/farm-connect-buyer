import React, { useState, useEffect } from 'react';
import {
  MessageSquareQuote,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  ShieldCheck,
  Send,
  History,
  Lock,
  ArrowRight
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AudioSpeaker from '../components/AudioSpeaker';

export default function OffersNegotiationPage() {
  const { user, isFarmer, isBuyer, isAdmin } = useAuth();
  const { lang, t } = useLanguage();

  const [offers, setOffers] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Counter Modal State
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterQty, setCounterQty] = useState('');
  const [counterNotes, setCounterNotes] = useState('');

  const loadOffers = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get('/offers');
      setOffers(res.offers || []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load offers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadOffers();
  }, [user]);

  const handleAction = async (offerId, action, extraPayload = {}) => {
    try {
      setActionLoading(true);
      await api.patch(`/offers/${offerId}`, { action, ...extraPayload });
      await loadOffers();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const openCounterModal = (offer) => {
    setSelectedOffer(offer);
    setCounterPrice((offer.counter_price || offer.price_per_unit).toString());
    setCounterQty((offer.counter_qty || offer.quantity).toString());
    setCounterNotes('');
    setCounterModalOpen(true);
  };

  const submitCounter = async (e) => {
    e.preventDefault();
    if (!counterPrice || isNaN(counterPrice)) {
      alert('Please enter a valid counter price.');
      return;
    }
    await handleAction(selectedOffer.id, 'counter', {
      counter_price: parseFloat(counterPrice),
      counter_qty: parseFloat(counterQty),
      notes: counterNotes
    });
    setCounterModalOpen(false);
  };

  const filteredOffers = offers.filter(o => {
    if (activeTab === 'ALL') return true;
    return o.status === activeTab;
  });

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <MessageSquareQuote size={24} color="#1b4332" />
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1b4332' }}>
                Offers & Negotiation Hub
              </h1>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Real-time multi-round price bargaining with atomic quantity reservation & double-sell protection
            </p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1.75rem',
          backgroundColor: '#f1f5f9',
          padding: '0.35rem',
          borderRadius: '12px'
        }}>
          {['ALL', 'PENDING', 'COUNTERED', 'RESERVED', 'CONFIRMED', 'REJECTED', 'CANCELLED'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                backgroundColor: activeTab === tab ? '#ffffff' : 'transparent',
                color: activeTab === tab ? '#1b4332' : '#64748b',
                boxShadow: activeTab === tab ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer'
              }}
            >
              {tab} ({tab === 'ALL' ? offers.length : offers.filter(o => o.status === tab).length})
            </button>
          ))}
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '8px', color: '#dc2626', marginBottom: '1.5rem' }}>
            {errorMsg}
          </div>
        )}

        {/* Offers List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading offers...
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
            <span style={{ fontSize: '2.5rem' }}>💬</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginTop: '0.5rem' }}>
              No Offers Found in '{activeTab}'
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Incoming bids or sent procurement offers will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredOffers.map(o => {
              const isFarmerUser = user.id === o.farmer_id;
              const isBuyerUser = user.id === o.buyer_id;

              return (
                <div key={o.id} className="card" style={{ padding: '1.75rem' }}>
                  {/* Offer Top Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontSize: '1.4rem' }}>🌾</span>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e293b' }}>
                          Offer #{o.id}: {o.crop_name}
                        </h3>
                        <span className={`badge badge-${o.status.toLowerCase()}`}>
                          {o.status}
                        </span>
                      </div>

                      <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                        Farmer: <strong>{o.farmer_name}</strong> ({o.market_apmc}, {o.farmer_district}) • Buyer: <strong>{o.buyer_name}</strong>
                      </div>
                    </div>

                    {/* Agreed / Current Value */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#15803d' }}>
                        ₹{o.price_per_unit} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ {o.unit}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                        Total Value: <strong>₹{o.total_amount.toLocaleString()}</strong> ({o.quantity} {o.unit})
                      </div>
                    </div>
                  </div>

                  {/* Reservation Lock Active Notice */}
                  {o.status === 'RESERVED' && (
                    <div style={{
                      backgroundColor: '#fef3c7',
                      border: '1.5px solid #fde68a',
                      borderRadius: '10px',
                      padding: '0.85rem 1.25rem',
                      margin: '1.25rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: '#92400e'
                    }}>
                      <Lock size={20} color="#b45309" />
                      <div>
                        <strong>Atomic Quantity Locked:</strong> {o.quantity} {o.unit} is strictly reserved for this transaction. Other buyers cannot purchase this stock.
                        {o.reservation_expires_at && (
                          <span style={{ display: 'block', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                            Reservation Guarantee active until: {new Date(o.reservation_expires_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Counter Offer Info */}
                  {o.status === 'COUNTERED' && (
                    <div style={{
                      backgroundColor: '#f3e8ff',
                      border: '1px solid #d8b4fe',
                      borderRadius: '10px',
                      padding: '0.85rem 1.25rem',
                      margin: '1.25rem 0',
                      color: '#6b21a8'
                    }}>
                      <strong>Active Counter-Offer proposed by {o.counter_by === 'farmer' ? 'Farmer' : 'Buyer'}:</strong>
                      <div style={{ fontSize: '0.95rem', marginTop: '0.2rem' }}>
                        Proposed Rate: <strong>₹{o.counter_price}/{o.unit}</strong> for <strong>{o.counter_qty || o.quantity} {o.unit}</strong>
                        {o.notes && <span style={{ fontStyle: 'italic', marginLeft: '0.5rem' }}>("{o.notes}")</span>}
                      </div>
                    </div>
                  )}

                  {/* Audit Trail Timeline (Requirement 10) */}
                  {o.history && o.history.length > 0 && (
                    <div style={{ margin: '1.25rem 0', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.6rem' }}>
                        <History size={14} /> Negotiation Audit History:
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                        {o.history.map((h) => (
                          <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#475569' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: h.action === 'ACCEPTED' ? '#16a34a' : h.action === 'CONFIRMED' ? '#2563eb' : h.action === 'COUNTERED' ? '#7e22ce' : '#94a3b8' }} />
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{h.actor_name} ({h.actor_role})</span>
                            <span className={`badge badge-${h.action.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>{h.action}</span>
                            <span>₹{h.price_per_unit}/{o.unit} ({h.quantity} {o.unit})</span>
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginLeft: 'auto' }}>
                              {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Actions Bar */}
                  <div style={{
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}>
                    <AudioSpeaker
                      text={`Offer #${o.id} for ${o.crop_name}. Quantity: ${o.quantity} ${o.unit} at ${o.price_per_unit} rupees per ${o.unit}. Status is ${o.status}.`}
                      lang={lang}
                      label="Listen"
                    />

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {/* Farmer Actions on PENDING */}
                      {isFarmerUser && (o.status === 'PENDING' || (o.status === 'COUNTERED' && o.counter_by === 'buyer')) && (
                        <>
                          <button
                            onClick={() => handleAction(o.id, 'accept')}
                            disabled={actionLoading}
                            className="btn btn-success"
                          >
                            <CheckCircle size={16} />
                            Accept & Reserve Quantity
                          </button>
                          <button
                            onClick={() => openCounterModal(o)}
                            disabled={actionLoading}
                            className="btn btn-accent"
                          >
                            Counter Offer
                          </button>
                          <button
                            onClick={() => handleAction(o.id, 'reject')}
                            disabled={actionLoading}
                            className="btn btn-danger"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {/* Buyer Actions on COUNTERED */}
                      {isBuyerUser && o.status === 'COUNTERED' && o.counter_by === 'farmer' && (
                        <>
                          <button
                            onClick={() => handleAction(o.id, 'accept')}
                            disabled={actionLoading}
                            className="btn btn-success"
                          >
                            <CheckCircle size={16} />
                            Accept Counter & Reserve
                          </button>
                          <button
                            onClick={() => openCounterModal(o)}
                            disabled={actionLoading}
                            className="btn btn-accent"
                          >
                            Counter Again
                          </button>
                          <button
                            onClick={() => handleAction(o.id, 'reject')}
                            disabled={actionLoading}
                            className="btn btn-danger"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {/* Final Order Confirmation (Buyer or Farmer when RESERVED) */}
                      {o.status === 'RESERVED' && (
                        <>
                          <button
                            onClick={() => handleAction(o.id, 'confirm')}
                            disabled={actionLoading}
                            className="btn btn-primary"
                            style={{ backgroundColor: '#2563eb', fontWeight: 800 }}
                          >
                            <ShieldCheck size={18} />
                            Confirm Order Final
                          </button>
                          <button
                            onClick={() => handleAction(o.id, 'cancel')}
                            disabled={actionLoading}
                            className="btn btn-danger"
                          >
                            Release / Cancel
                          </button>
                        </>
                      )}

                      {/* Link to Orders if confirmed */}
                      {o.status === 'CONFIRMED' && (
                        <Link to="/orders" className="btn btn-secondary">
                          Track Order in Orders Tab <ArrowRight size={15} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Counter Offer Modal */}
        {counterModalOpen && selectedOffer && (
          <div className="modal-overlay" onClick={() => setCounterModalOpen(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                Propose Counter-Offer
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Crop: <strong>{selectedOffer.crop_name}</strong> • Current Rate: ₹{selectedOffer.price_per_unit}/{selectedOffer.unit}
              </p>

              <form onSubmit={submitCounter}>
                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">New Counter Price (₹ per {selectedOffer.unit}) *</label>
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
                    <label className="form-label">Quantity ({selectedOffer.unit}) *</label>
                    <input
                      type="number"
                      step="1"
                      className="form-input"
                      value={counterQty}
                      onChange={e => setCounterQty(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Justification / Quality Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Higher grade selection, ready for immediate truck loading"
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
                    {actionLoading ? 'Submitting...' : 'Submit Counter Offer'}
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
