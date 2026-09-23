import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  PlusCircle,
  Search,
  Sparkles,
  MapPin,
  Calendar,
  X,
  CheckCircle2
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function DemandRequirementsPage() {
  const { user, isBuyer, isAdmin } = useAuth();
  const { t } = useLanguage();

  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [referenceData, setReferenceData] = useState(null);

  // Filters
  const [searchCrop, setSearchCrop] = useState('');
  const [filterState, setFilterState] = useState('');

  // Publish Modal State
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishForm, setPublishForm] = useState({
    crop_name: 'Tomato',
    category_name: 'Vegetables',
    quantity_required: '',
    unit: 'kg',
    required_quality: 'Grade A',
    max_target_price: '',
    state: user?.profile?.state || 'Telangana',
    district: user?.profile?.district || 'Hyderabad',
    location: user?.profile?.delivery_address || 'Kattedan Processing Yard, Hyderabad',
    required_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const loadRequirements = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      let url = '/requirements?';
      if (searchCrop) url += `crop=${encodeURIComponent(searchCrop)}&`;
      if (filterState) url += `state=${encodeURIComponent(filterState)}&`;

      const res = await api.get(url);
      setRequirements(res.requirements || []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load buyer demands.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequirements();
    api.get('/metadata/reference')
      .then(res => {
        if (res.referenceData) setReferenceData(res.referenceData);
      })
      .catch(() => {});
  }, [searchCrop, filterState]);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!publishForm.crop_name || !publishForm.quantity_required || !publishForm.max_target_price) {
      alert('Please fill in Crop, Quantity Required, and Target Price.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/requirements', publishForm);
      setPublishModalOpen(false);
      setPublishForm({
        ...publishForm,
        quantity_required: '',
        max_target_price: '',
        description: ''
      });
      await loadRequirements();
      alert('Requirement published! The smart matching engine will pair suitable local farmer harvests.');
    } catch (err) {
      alert(`Publishing failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e3a8a' }}>
              Buyer Demands & Requirements
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Institutional, processor, and wholesale procurement requirements open for farmer supply
            </p>
          </div>

          {(isBuyer || isAdmin) && (
            <button
              onClick={() => setPublishModalOpen(true)}
              className="btn btn-primary btn-lg"
              style={{ backgroundColor: '#2563eb', fontWeight: 800 }}
            >
              <PlusCircle size={20} />
              + Publish Demand
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            <div>
              <label className="form-label">Search Crop</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="e.g. Tomato, Onion..."
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
                onChange={e => setFilterState(e.target.value)}
              >
                <option value="">All Indian States</option>
                {referenceData?.states?.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="button"
                onClick={() => { setSearchCrop(''); setFilterState(''); }}
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

        {/* Requirements Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading buyer demands...
          </div>
        ) : requirements.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
            <span style={{ fontSize: '3rem' }}>🏢</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginTop: '0.5rem' }}>
              No Open Demands Found
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Buyers can publish new harvest procurement requirements anytime.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {requirements.map(r => (
              <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="badge badge-confirmed" style={{ marginBottom: '0.35rem' }}>{r.category_name}</span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e3a8a' }}>
                      {r.crop_name}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      Required Quality: <span style={{ fontWeight: 600, color: '#1d4ed8' }}>{r.required_quality}</span>
                    </p>
                  </div>

                  <span className="badge badge-active">{r.status}</span>
                </div>

                <div style={{ margin: '1rem 0' }}>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1e3a8a' }}>
                    {r.quantity_required.toLocaleString()} <span style={{ fontSize: '1rem', color: '#64748b' }}>{r.unit}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '0.2rem' }}>
                    Target Budget: <strong style={{ color: '#15803d' }}>₹{r.max_target_price}/{r.unit}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={15} color="#2563eb" />
                    <span>{r.location || r.district}, {r.state}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={15} color="#2563eb" />
                    <span>Required By: <strong>{r.required_date || 'Immediate'}</strong></span>
                  </div>
                  <div>Buyer: <strong>{r.buyer_name}</strong></div>
                </div>

                {r.description && (
                  <p style={{ fontSize: '0.825rem', color: '#64748b', fontStyle: 'italic', marginBottom: '1.25rem' }}>
                    "{r.description}"
                  </p>
                )}

                <div style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem' }}>
                  <Link
                    to={`/matches?requirementId=${r.id}`}
                    className="btn btn-primary"
                    style={{ width: '100%', backgroundColor: '#2563eb', fontWeight: 700 }}
                  >
                    <Sparkles size={16} />
                    View Matching Farmers & Combine Supply
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Publish Demand Modal */}
        {publishModalOpen && (
          <div className="modal-overlay" onClick={() => setPublishModalOpen(false)}>
            <div className="modal-content" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e3a8a' }}>
                  Publish Buyer Requirement / Demand
                </h3>
                <button onClick={() => setPublishModalOpen(false)} style={{ color: '#64748b', cursor: 'pointer' }}>
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handlePublish}>
                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Crop Needed *</label>
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
                    <label className="form-label">Required Quality Standard</label>
                    <select
                      className="form-select"
                      value={publishForm.required_quality}
                      onChange={e => setPublishForm({ ...publishForm, required_quality: e.target.value })}
                    >
                      <option value="Grade A">Grade A (Premium / Export Quality)</option>
                      <option value="Grade B">Grade B (Standard Market Quality)</option>
                      <option value="Grade C">Grade C (Processing Quality)</option>
                      <option value="Organic Certified">Organic Certified</option>
                    </select>
                  </div>
                </div>

                <div className="grid-cols-3">
                  <div className="form-group">
                    <label className="form-label">Quantity Required *</label>
                    <input
                      type="number"
                      step="1"
                      className="form-input"
                      placeholder="e.g. 2000"
                      value={publishForm.quantity_required}
                      onChange={e => setPublishForm({ ...publishForm, quantity_required: e.target.value })}
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
                    <label className="form-label">Target Max Price (₹/unit) *</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-input"
                      placeholder="e.g. 26"
                      value={publishForm.max_target_price}
                      onChange={e => setPublishForm({ ...publishForm, max_target_price: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Required Delivery / Handover Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={publishForm.required_date}
                      onChange={e => setPublishForm({ ...publishForm, required_date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Delivery Location / Warehouse Point</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Kattedan Processing Yard, Hyderabad"
                      value={publishForm.location}
                      onChange={e => setPublishForm({ ...publishForm, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Requirement Details / Notes</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    placeholder="e.g. Immediate procurement for sauce processing. Multiple farmer suppliers welcome to combine volume."
                    value={publishForm.description}
                    onChange={e => setPublishForm({ ...publishForm, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button type="button" onClick={() => setPublishModalOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary btn-lg" style={{ backgroundColor: '#2563eb' }}>
                    {submitting ? 'Publishing...' : 'Publish Procurement Demand'}
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
