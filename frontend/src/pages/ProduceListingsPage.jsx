import React, { useState, useEffect } from 'react';
import {
  Sprout,
  PlusCircle,
  Search,
  Filter,
  MapPin,
  Calendar,
  Send,
  CheckCircle,
  Volume2,
  X
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AudioSpeaker from '../components/AudioSpeaker';

export default function ProduceListingsPage() {
  const { user, isFarmer, isBuyer, isAdmin } = useAuth();
  const { lang, t } = useLanguage();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [referenceData, setReferenceData] = useState(null);

  // Filters
  const [searchCrop, setSearchCrop] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');

  // Publish Produce Modal State
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishForm, setPublishForm] = useState({
    crop_name: 'Tomato',
    category_name: 'Vegetables',
    variety: 'Hybrid (Sahu / Shivam)',
    total_qty: '',
    unit: 'kg',
    quality: 'Grade A',
    expected_price: '',
    state: user?.profile?.state || 'Telangana',
    district: user?.profile?.district || 'Hyderabad',
    market_apmc: user?.profile?.market_apmc || 'Bowenpally APMC Market',
    harvest_date: new Date().toISOString().split('T')[0],
    available_until: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Send Offer Modal State
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [targetListing, setTargetListing] = useState(null);
  const [offerQty, setOfferQty] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerNotes, setOfferNotes] = useState('');
  const [sendingOffer, setSendingOffer] = useState(false);
  const [offerSuccessMsg, setOfferSuccessMsg] = useState('');

  const loadListings = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      let url = '/listings?';
      if (searchCrop) url += `crop=${encodeURIComponent(searchCrop)}&`;
      if (filterState) url += `state=${encodeURIComponent(filterState)}&`;
      if (filterDistrict) url += `district=${encodeURIComponent(filterDistrict)}&`;

      const res = await api.get(url);
      setListings(res.listings || []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load produce listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
    api.get('/metadata/reference')
      .then(res => {
        if (res.referenceData) setReferenceData(res.referenceData);
      })
      .catch(() => {});
  }, [searchCrop, filterState, filterDistrict]);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!publishForm.crop_name || !publishForm.total_qty || !publishForm.expected_price) {
      alert('Please fill in Crop, Total Quantity, and Expected Price.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/listings', publishForm);
      setPublishModalOpen(false);
      // Reset form
      setPublishForm({
        ...publishForm,
        total_qty: '',
        expected_price: '',
        description: ''
      });
      await loadListings();
      alert('Harvest listed successfully! The smart matching engine is now pairing your stock with buyers.');
    } catch (err) {
      alert(`Listing failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const openOfferModal = (listing) => {
    setTargetListing(listing);
    setOfferQty(listing.available_qty.toString());
    setOfferPrice(listing.expected_price.toString());
    setOfferNotes('');
    setOfferSuccessMsg('');
    setOfferModalOpen(true);
  };

  const handleSendOffer = async (e) => {
    e.preventDefault();
    if (!offerQty || !offerPrice || parseFloat(offerQty) <= 0 || parseFloat(offerPrice) <= 0) {
      alert('Please enter valid quantity and price per unit.');
      return;
    }

    if (parseFloat(offerQty) > targetListing.available_qty) {
      alert(`Requested quantity cannot exceed available stock (${targetListing.available_qty} ${targetListing.unit}).`);
      return;
    }

    try {
      setSendingOffer(true);
      await api.post('/offers', {
        listing_id: targetListing.id,
        quantity: parseFloat(offerQty),
        price_per_unit: parseFloat(offerPrice),
        notes: offerNotes
      });

      setOfferSuccessMsg(`Offer sent to ${targetListing.farmer_name}! The farmer will review and accept or counter.`);
      setTimeout(() => {
        setOfferModalOpen(false);
        loadListings();
      }, 1500);
    } catch (err) {
      alert(`Offer failed: ${err.message}`);
    } finally {
      setSendingOffer(false);
    }
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1b4332' }}>
              All-India Produce Listings
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Verified farmer harvests available across Indian regional mandis
            </p>
          </div>

          {(isFarmer || isAdmin) && (
            <button
              onClick={() => setPublishModalOpen(true)}
              className="btn btn-primary btn-lg"
              style={{ fontWeight: 800 }}
            >
              <PlusCircle size={20} />
              + Publish Produce
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            <div>
              <label className="form-label">Search Crop</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="e.g. Tomato, Onion, Wheat..."
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  value={searchCrop}
                  onChange={e => setSearchCrop(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="form-label">State</label>
              <select
                className="form-select"
                value={filterState}
                onChange={e => {
                  setFilterState(e.target.value);
                  setFilterDistrict('');
                }}
              >
                <option value="">All Indian States</option>
                {referenceData?.states?.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">District</label>
              <select
                className="form-select"
                value={filterDistrict}
                onChange={e => setFilterDistrict(e.target.value)}
              >
                <option value="">All Districts</option>
                {referenceData?.districts?.filter(d => {
                  if (!filterState) return true;
                  const st = referenceData?.states?.find(s => s.name === filterState);
                  return st ? d.state_id === st.id : true;
                }).map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="button"
                onClick={() => { setSearchCrop(''); setFilterState(''); setFilterDistrict(''); }}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '8px', color: '#dc2626', marginBottom: '1.5rem' }}>
            {errorMsg}
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading produce listings...
          </div>
        ) : listings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
            <span style={{ fontSize: '3rem' }}>🌾</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginTop: '0.5rem' }}>
              No Produce Listings Found
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Try adjusting your crop or location filters.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.5rem' }}>
            {listings.map(l => (
              <div key={l.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="badge badge-active" style={{ marginBottom: '0.35rem' }}>{l.category_name}</span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1b4332' }}>
                      {l.crop_name}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {l.variety} • <span style={{ fontWeight: 600, color: '#15803d' }}>{l.quality}</span>
                    </p>
                  </div>

                  <span className={`badge badge-${l.status === 'ACTIVE' ? 'active' : l.status === 'PARTIALLY_RESERVED' ? 'reserved' : 'soldout'}`}>
                    {l.status}
                  </span>
                </div>

                {/* Farmer & Location details */}
                <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={15} color="#16a34a" />
                    <span><strong>{l.market_apmc}</strong>, {l.district}, {l.state}</span>
                  </div>
                  <div>
                    Farmer: <strong>{l.farmer_name}</strong>
                  </div>
                </div>

                {/* Quantitative Inventory Breakdown */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  margin: '1rem 0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                    <span style={{ color: '#15803d', fontWeight: 700 }}>Available: {l.available_qty} {l.unit}</span>
                    <span style={{ color: '#64748b' }}>Total: {l.total_qty} {l.unit}</span>
                  </div>

                  <div className="qty-bar">
                    <div className="qty-bar-avail" style={{ width: `${(l.available_qty / l.total_qty) * 100}%` }} />
                    <div className="qty-bar-res" style={{ width: `${(l.reserved_qty / l.total_qty) * 100}%` }} />
                    <div className="qty-bar-conf" style={{ width: `${(l.confirmed_qty / l.total_qty) * 100}%` }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>
                    <span>Reserved: <strong>{l.reserved_qty} {l.unit}</strong></span>
                    <span>Sold: <strong>{l.confirmed_qty} {l.unit}</strong></span>
                  </div>
                </div>

                {l.description && (
                  <p style={{ fontSize: '0.825rem', color: '#64748b', fontStyle: 'italic', marginBottom: '1rem' }}>
                    "{l.description}"
                  </p>
                )}

                {/* Price & Actions */}
                <div style={{
                  marginTop: 'auto',
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1b4332' }}>
                      ₹{l.expected_price} <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>/ {l.unit}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <AudioSpeaker
                      text={`${l.crop_name}, ${l.variety}. Available quantity: ${l.available_qty} ${l.unit}. Expected price: ₹${l.expected_price} per ${l.unit}. Located at ${l.market_apmc}, ${l.district}.`}
                      lang={lang}
                      label="Listen"
                    />

                    {isBuyer && l.available_qty > 0 && (
                      <button
                        onClick={() => openOfferModal(l)}
                        className="btn btn-sm btn-primary"
                        style={{ backgroundColor: '#2563eb' }}
                      >
                        <Send size={15} />
                        Send Offer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Publish Produce Modal */}
        {publishModalOpen && (
          <div className="modal-overlay" onClick={() => setPublishModalOpen(false)}>
            <div className="modal-content" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1b4332' }}>
                  Publish Fresh Harvest Produce
                </h3>
                <button onClick={() => setPublishModalOpen(false)} style={{ color: '#64748b', cursor: 'pointer' }}>
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handlePublish}>
                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Crop Name *</label>
                    <select
                      className="form-select"
                      value={publishForm.crop_name}
                      onChange={e => {
                        const cr = referenceData?.crops?.find(c => c.name === e.target.value);
                        const cat = referenceData?.categories?.find(c => c.id === cr?.category_id);
                        setPublishForm({
                          ...publishForm,
                          crop_name: e.target.value,
                          category_name: cat?.name || publishForm.category_name,
                          unit: cr?.unit_default || 'kg'
                        });
                      }}
                      required
                    >
                      {referenceData?.crops?.map(c => (
                        <option key={c.id} value={c.name}>{c.icon} {c.name} ({c.hindi_name})</option>
                      )) || (
                        <>
                          <option value="Tomato">Tomato</option>
                          <option value="Onion">Onion</option>
                          <option value="Wheat">Wheat</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Variety</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Hybrid Sahu / Desi Country / Sharbati"
                      value={publishForm.variety}
                      onChange={e => setPublishForm({ ...publishForm, variety: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-cols-3">
                  <div className="form-group">
                    <label className="form-label">Total Quantity Harvested *</label>
                    <input
                      type="number"
                      step="1"
                      className="form-input"
                      placeholder="e.g. 700"
                      value={publishForm.total_qty}
                      onChange={e => setPublishForm({ ...publishForm, total_qty: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <select
                      className="form-select"
                      value={publishForm.unit}
                      onChange={e => setPublishForm({ ...publishForm, unit: e.target.value })}
                    >
                      <option value="kg">kg (Kilograms)</option>
                      <option value="quintal">quintal (100 kg)</option>
                      <option value="ton">ton (1,000 kg)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expected Price (₹/unit) *</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-input"
                      placeholder="e.g. 24"
                      value={publishForm.expected_price}
                      onChange={e => setPublishForm({ ...publishForm, expected_price: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Quality Grade</label>
                    <select
                      className="form-select"
                      value={publishForm.quality}
                      onChange={e => setPublishForm({ ...publishForm, quality: e.target.value })}
                    >
                      <option value="Grade A">Grade A (Premium / Export Quality)</option>
                      <option value="Grade B">Grade B (Standard Market Quality)</option>
                      <option value="Grade C">Grade C (Processing Quality)</option>
                      <option value="Organic Certified">Organic Certified</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Available Until Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={publishForm.available_until}
                      onChange={e => setPublishForm({ ...publishForm, available_until: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-cols-3">
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      className="form-input"
                      value={publishForm.state}
                      onChange={e => setPublishForm({ ...publishForm, state: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">District</label>
                    <input
                      type="text"
                      className="form-input"
                      value={publishForm.district}
                      onChange={e => setPublishForm({ ...publishForm, district: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">APMC Mandi Yard</label>
                    <input
                      type="text"
                      className="form-input"
                      value={publishForm.market_apmc}
                      onChange={e => setPublishForm({ ...publishForm, market_apmc: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Harvest Notes</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    placeholder="e.g., Clean sorted tomatoes harvested yesterday, ready for mandi yard pickup."
                    value={publishForm.description}
                    onChange={e => setPublishForm({ ...publishForm, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button type="button" onClick={() => setPublishModalOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary btn-lg">
                    {submitting ? 'Listing...' : 'Publish Produce Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Send Offer Modal (Buyer) */}
        {offerModalOpen && targetListing && (
          <div className="modal-overlay" onClick={() => setOfferModalOpen(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e3a8a' }}>
                  Send Offer to {targetListing.farmer_name}
                </h3>
                <button onClick={() => setOfferModalOpen(false)} style={{ color: '#64748b', cursor: 'pointer' }}>
                  <X size={22} />
                </button>
              </div>

              <div style={{ backgroundColor: '#eff6ff', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#1e40af' }}>
                <div>Crop: <strong>{targetListing.crop_name}</strong> ({targetListing.variety})</div>
                <div>Currently Available: <strong>{targetListing.available_qty} {targetListing.unit}</strong> • Farmer Expected: ₹{targetListing.expected_price}/{targetListing.unit}</div>
              </div>

              {offerSuccessMsg ? (
                <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', padding: '1rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle size={22} />
                  <span>{offerSuccessMsg}</span>
                </div>
              ) : (
                <form onSubmit={handleSendOffer}>
                  <div className="grid-cols-2">
                    <div className="form-group">
                      <label className="form-label">Quantity to Purchase ({targetListing.unit}) *</label>
                      <input
                        type="number"
                        step="1"
                        max={targetListing.available_qty}
                        className="form-input"
                        value={offerQty}
                        onChange={e => setOfferQty(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Your Bid Price (₹ per {targetListing.unit}) *</label>
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

                  <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>Estimated Total Value:</span>
                    <span style={{ color: '#15803d' }}>
                      ₹{(parseFloat(offerQty || 0) * parseFloat(offerPrice || 0)).toLocaleString()}
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notes for Farmer</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Can arrange pickup tomorrow morning directly at mandi yard"
                      value={offerNotes}
                      onChange={e => setOfferNotes(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                    <button type="button" onClick={() => setOfferModalOpen(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" disabled={sendingOffer} className="btn btn-primary" style={{ backgroundColor: '#2563eb' }}>
                      {sendingOffer ? 'Sending Offer...' : 'Send Offer to Farmer'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
