import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  MapPin,
  TrendingUp,
  Send,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Info
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AudioSpeaker from '../components/AudioSpeaker';

export default function SmartMatchesPage() {
  const { user, isBuyer, isFarmer, isAdmin } = useAuth();
  const { lang, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const reqIdParam = searchParams.get('requirementId');
  const listingIdParam = searchParams.get('listingId');

  const [requirements, setRequirements] = useState([]);
  const [selectedReqId, setSelectedReqId] = useState(reqIdParam || '');
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Batch Offer Dispatch State
  const [batchDispatching, setBatchDispatching] = useState(false);
  const [batchSuccessMsg, setBatchSuccessMsg] = useState('');

  // Individual Offer Modal
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [targetMatch, setTargetMatch] = useState(null);
  const [offerQty, setOfferQty] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerNotes, setOfferNotes] = useState('');
  const [sendingSingle, setSendingSingle] = useState(false);

  // Load active requirements for dropdown
  useEffect(() => {
    api.get('/requirements')
      .then(res => {
        const reqs = res.requirements || [];
        setRequirements(reqs);
        if (!selectedReqId && reqs.length > 0) {
          setSelectedReqId(reqs[0].id.toString());
        }
      })
      .catch(() => {});
  }, []);

  // Fetch matches whenever selected requirement changes
  useEffect(() => {
    if (selectedReqId) {
      fetchMatches(selectedReqId);
    }
  }, [selectedReqId]);

  const fetchMatches = async (reqId) => {
    try {
      setLoading(true);
      setErrorMsg('');
      setBatchSuccessMsg('');
      const res = await api.get(`/matches?requirementId=${reqId}`);
      setMatchData(res);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to calculate smart matches.');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSendOffers = async () => {
    if (!matchData?.aggregation?.suggestedCombination?.length) return;

    if (!user) {
      alert('Please log in as a Buyer to dispatch offers.');
      return;
    }

    const confirmMsg = `Dispatch offers to all ${matchData.aggregation.participatingFarmersCount} matching farmers for a total of ${matchData.aggregation.totalAvailableMatched} ${matchData.requirement.unit} at an average price of ₹${matchData.aggregation.averagePrice}/${matchData.requirement.unit}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setBatchDispatching(true);
      const comb = matchData.aggregation.suggestedCombination;

      for (const item of comb) {
        await api.post('/offers', {
          requirement_id: matchData.requirement.id,
          listing_id: item.listingId,
          quantity: item.allocatedQty,
          price_per_unit: item.pricePerUnit,
          notes: `Multi-farmer supply batch offer: allocated ${item.allocatedQty} ${item.unit} for requirement #${matchData.requirement.id}`
        });
      }

      setBatchSuccessMsg(`Success! Coordinated offers dispatched to ${comb.length} farmers. Track them in the Offers & Negotiation tab.`);
      fetchMatches(selectedReqId);
    } catch (err) {
      alert(`Batch dispatch failed: ${err.message}`);
    } finally {
      setBatchDispatching(false);
    }
  };

  const openSingleOffer = (match) => {
    setTargetMatch(match);
    setOfferQty(match.availableQty.toString());
    setOfferPrice(match.expectedPrice.toString());
    setOfferNotes('');
    setOfferModalOpen(true);
  };

  const handleSendSingleOffer = async (e) => {
    e.preventDefault();
    try {
      setSendingSingle(true);
      await api.post('/offers', {
        requirement_id: matchData?.requirement?.id || null,
        listing_id: targetMatch.listingId,
        quantity: parseFloat(offerQty),
        price_per_unit: parseFloat(offerPrice),
        notes: offerNotes
      });
      alert(`Offer of ₹${offerPrice} for ${offerQty} ${targetMatch.unit} submitted to ${targetMatch.farmerName}!`);
      setOfferModalOpen(false);
      fetchMatches(selectedReqId);
    } catch (err) {
      alert(`Offer failed: ${err.message}`);
    } finally {
      setSendingSingle(false);
    }
  };

  const req = matchData?.requirement;
  const agg = matchData?.aggregation;
  const matches = matchData?.matches || [];

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Sparkles size={24} color="#d97706" />
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1b4332' }}>
                Smart Matching & Supply Aggregation Engine
              </h1>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Real-time multi-factor algorithmic scoring and multi-farmer partial quantity combination
            </p>
          </div>

          {/* Select Demand Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#334155' }}>
              Select Demand:
            </label>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '280px', fontWeight: 600 }}
              value={selectedReqId}
              onChange={e => {
                setSelectedReqId(e.target.value);
                setSearchParams({ requirementId: e.target.value });
              }}
            >
              {requirements.map(r => (
                <option key={r.id} value={r.id}>
                  #{r.id} - {r.crop_name} ({r.quantity_required} {r.unit} @ ₹{r.max_target_price}) - {r.buyer_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '8px', color: '#dc2626', marginBottom: '1.5rem' }}>
            {errorMsg}
          </div>
        )}

        {batchSuccessMsg && (
          <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', padding: '1rem', borderRadius: '8px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>
            <CheckCircle2 size={20} />
            <span>{batchSuccessMsg}</span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
            Running matching algorithms and aggregating supply...
          </div>
        ) : !req ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>No requirements available for matching.</h3>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
              Publish a buyer demand first to see matching farmer supply.
            </p>
            <Link to="/demand" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Publish Demand
            </Link>
          </div>
        ) : (
          <div>
            {/* PARTIAL QUANTITY SUPPLY AGGREGATOR BANNER (Scenario 1 Fulfillment) */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '2px solid #86efac',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 4px 15px rgba(22, 163, 74, 0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <span className="badge badge-active" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                    Multi-Farmer Partial Supply Aggregator
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1b4332', marginTop: '0.5rem' }}>
                    Fulfilling {req.quantityRequired} {req.unit} of {req.crop}
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    Target Budget: <strong>₹{req.maxTargetPrice}/{req.unit}</strong> • Delivery Point: <strong>{req.location}</strong>
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: agg.fulfilledPercentage >= 100 ? '#15803d' : '#b45309' }}>
                    {agg.fulfilledPercentage}% Fulfillable
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                    {agg.totalAvailableMatched} / {agg.quantityRequired} {req.unit} matched
                  </span>
                </div>
              </div>

              {/* Mathematical Supply Breakdown Table */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Layers size={18} color="#15803d" />
                  Engine Supply Combination (Partial Allocations):
                </h4>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#475569' }}>
                        <th style={{ padding: '0.5rem' }}>Farmer</th>
                        <th style={{ padding: '0.5rem' }}>Location / APMC</th>
                        <th style={{ padding: '0.5rem' }}>Available Stock</th>
                        <th style={{ padding: '0.5rem', color: '#15803d' }}>Allocated Qty</th>
                        <th style={{ padding: '0.5rem' }}>Price / Unit</th>
                        <th style={{ padding: '0.5rem' }}>Subtotal</th>
                        <th style={{ padding: '0.5rem' }}>Match Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agg.suggestedCombination.map((c) => (
                        <tr key={c.listingId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: '#1e293b' }}>
                            {c.farmerName}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', color: '#64748b' }}>
                            {c.location}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', color: '#64748b' }}>
                            {c.availableQty} {c.unit}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: 800, color: '#15803d', fontSize: '1rem' }}>
                            {c.allocatedQty} {c.unit}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            ₹{c.pricePerUnit}/{c.unit}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>
                            ₹{c.subtotal.toLocaleString()}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <span className="match-score-badge match-score-excellent" style={{ fontSize: '0.75rem' }}>
                              {c.matchScore}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: '2px solid #cbd5e1', fontWeight: 800, fontSize: '0.95rem' }}>
                        <td colSpan={3} style={{ padding: '0.75rem 0.5rem' }}>Total Combined Fulfill</td>
                        <td style={{ padding: '0.75rem 0.5rem', color: '#15803d', fontSize: '1.1rem' }}>
                          {agg.totalAvailableMatched} {req.unit}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: '#15803d' }}>
                          Avg ₹{agg.averagePrice}/{req.unit}
                        </td>
                        <td colSpan={2} style={{ padding: '0.75rem 0.5rem' }}>
                          {agg.remainingShortfall > 0 ? (
                            <span style={{ color: '#dc2626' }}>Shortfall: {agg.remainingShortfall} {req.unit}</span>
                          ) : (
                            <span style={{ color: '#15803d' }}>100% Demand Satisfied</span>
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Batch Offer Dispatch Button */}
              {isBuyer && agg.suggestedCombination.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Lock supply across all {agg.participatingFarmersCount} farmers at once:
                  </span>
                  <button
                    onClick={handleBatchSendOffers}
                    disabled={batchDispatching}
                    className="btn btn-primary btn-lg"
                    style={{ fontWeight: 800, backgroundColor: '#2563eb' }}
                  >
                    <Send size={18} />
                    {batchDispatching ? 'Dispatching Bids...' : `Dispatch Batch Offers (${agg.totalAvailableMatched} ${req.unit})`}
                  </button>
                </div>
              )}
            </div>

            {/* Individual Matches List with Factor Breakdown (Requirement 7) */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.25rem' }}>
                All Matching Farmer Listings ({matches.length})
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {matches.map(m => (
                  <div key={m.listingId} className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>
                            {m.farmerName}
                          </h3>
                          <span className={`match-score-badge match-score-${m.matchScore >= 80 ? 'excellent' : m.matchScore >= 60 ? 'good' : 'low'}`}>
                            ★ {m.matchScore}% - {m.classification}
                          </span>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                          <MapPin size={14} style={{ display: 'inline', verticalAlign: '-2px', color: '#16a34a' }} /> {m.location}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d' }}>
                          ₹{m.expectedPrice} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/ {m.unit}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Available: <strong>{m.availableQty} {m.unit}</strong> (Total: {m.totalQty} {m.unit})
                        </span>
                      </div>
                    </div>

                    {/* Algorithmic Scoring Breakdown Bars */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '0.75rem',
                      margin: '1.25rem 0',
                      padding: '0.85rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569' }}>
                          <span>Crop (35%)</span>
                          <strong>{m.breakdown.crop}%</strong>
                        </div>
                        <div style={{ height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', marginTop: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${m.breakdown.crop}%`, height: '100%', backgroundColor: '#16a34a' }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569' }}>
                          <span>Price (25%)</span>
                          <strong>{m.breakdown.price}%</strong>
                        </div>
                        <div style={{ height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', marginTop: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${m.breakdown.price}%`, height: '100%', backgroundColor: '#2563eb' }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569' }}>
                          <span>Location (20%)</span>
                          <strong>{m.breakdown.location}%</strong>
                        </div>
                        <div style={{ height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', marginTop: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${m.breakdown.location}%`, height: '100%', backgroundColor: '#d97706' }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569' }}>
                          <span>Quality (10%)</span>
                          <strong>{m.breakdown.quality}%</strong>
                        </div>
                        <div style={{ height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', marginTop: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${m.breakdown.quality}%`, height: '100%', backgroundColor: '#7c3aed' }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569' }}>
                          <span>Date (10%)</span>
                          <strong>{m.breakdown.date}%</strong>
                        </div>
                        <div style={{ height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', marginTop: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${m.breakdown.date}%`, height: '100%', backgroundColor: '#059669' }} />
                        </div>
                      </div>
                    </div>

                    {/* Explanatory Reasons List (Requirement 7) */}
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                        Why this matched:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {m.reasons.map((r, i) => (
                          <span key={i} style={{
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.75rem',
                            color: '#334155'
                          }}>
                            ✓ {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem' }}>
                      <AudioSpeaker
                        text={`Match score is ${m.matchScore} percent. ${m.farmerName} has ${m.availableQty} ${m.unit} of ${m.crop} at ${m.location}. Price is ${m.expectedPrice} rupees per ${m.unit}.`}
                        lang={lang}
                        label="Listen"
                      />

                      {isBuyer && m.availableQty > 0 && (
                        <button
                          onClick={() => openSingleOffer(m)}
                          className="btn btn-sm btn-primary"
                          style={{ backgroundColor: '#2563eb' }}
                        >
                          <Send size={15} />
                          Send Individual Offer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Individual Offer Modal */}
        {offerModalOpen && targetMatch && (
          <div className="modal-overlay" onClick={() => setOfferModalOpen(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.5rem' }}>
                Submit Offer to {targetMatch.farmerName}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Produce: <strong>{targetMatch.crop}</strong> • Available Stock: <strong>{targetMatch.availableQty} {targetMatch.unit}</strong>
              </p>

              <form onSubmit={handleSendSingleOffer}>
                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Quantity ({targetMatch.unit}) *</label>
                    <input
                      type="number"
                      max={targetMatch.availableQty}
                      className="form-input"
                      value={offerQty}
                      onChange={e => setOfferQty(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price per Unit (₹) *</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-input"
                      value={offerPrice}
                      onChange={e => setOfferPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Need delivery at Hyderabad warehouse"
                    className="form-input"
                    value={offerNotes}
                    onChange={e => setOfferNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button type="button" onClick={() => setOfferModalOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={sendingSingle} className="btn btn-primary" style={{ backgroundColor: '#2563eb' }}>
                    {sendingSingle ? 'Sending...' : 'Send Offer'}
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
