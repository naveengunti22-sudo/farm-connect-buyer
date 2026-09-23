import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  MapPin,
  Calendar,
  AlertCircle,
  Info,
  CheckCircle2
} from 'lucide-react';
import api from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import AudioSpeaker from '../components/AudioSpeaker';

export default function MarketPricesPage() {
  const { lang, t } = useLanguage();

  const [prices, setPrices] = useState([]);
  const [sourceInfo, setSourceInfo] = useState({ source: 'Sample/Demo Data', isLive: false, notice: '' });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [referenceData, setReferenceData] = useState(null);

  // Filters
  const [filterState, setFilterState] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterMarket, setFilterMarket] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCrop, setFilterCrop] = useState('');

  const loadPrices = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      let url = '/market-prices?';
      if (filterState) url += `state=${encodeURIComponent(filterState)}&`;
      if (filterDistrict) url += `district=${encodeURIComponent(filterDistrict)}&`;
      if (filterMarket) url += `market=${encodeURIComponent(filterMarket)}&`;
      if (filterCategory) url += `category=${encodeURIComponent(filterCategory)}&`;
      if (filterCrop) url += `crop=${encodeURIComponent(filterCrop)}&`;

      const res = await api.get(url);
      setPrices(res.data || []);
      setSourceInfo({
        source: res.source,
        isLive: res.isLive,
        notice: res.notice
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load mandi prices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrices();
    api.get('/metadata/reference')
      .then(res => {
        if (res.referenceData) setReferenceData(res.referenceData);
      })
      .catch(() => {});
  }, [filterState, filterDistrict, filterMarket, filterCategory, filterCrop]);

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <TrendingUp size={24} color="#1b4332" />
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1b4332' }}>
              All-India APMC Mandi Market Prices
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Wholesale mandi benchmark rates across Indian agricultural markets to guide farmer pricing and buyer bidding
          </p>
        </div>

        {/* Mandatory Transparency Disclaimer Box (Requirement 13) */}
        <div style={{
          backgroundColor: '#fff1f2',
          border: '1.5px solid #fecdd3',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start',
          marginBottom: '1.75rem'
        }}>
          <Info size={20} color="#e11d48" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-demo">{sourceInfo.source}</span>
              <strong style={{ color: '#9f1239', fontSize: '0.9rem' }}>
                {sourceInfo.isLive ? 'Live Government Agmarknet API Connected' : 'Regional Mandi Benchmark Notice'}
              </strong>
            </div>
            <p style={{ color: '#881337', fontSize: '0.85rem', lineHeight: 1.5 }}>
              {sourceInfo.notice || 'Live data unavailable: No official government Agmarknet API key configured. Displaying verified regional mandi benchmark sample data.'}
            </p>
          </div>
        </div>

        {/* Multi-Level Mandi Filters */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            <div>
              <label className="form-label">State</label>
              <select
                className="form-select"
                value={filterState}
                onChange={e => {
                  setFilterState(e.target.value);
                  setFilterDistrict('');
                  setFilterMarket('');
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
                onChange={e => {
                  setFilterDistrict(e.target.value);
                  setFilterMarket('');
                }}
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
              <label className="form-label">APMC Mandi Yard</label>
              <select
                className="form-select"
                value={filterMarket}
                onChange={e => setFilterMarket(e.target.value)}
              >
                <option value="">All Mandi Yards</option>
                {referenceData?.markets?.filter(m => {
                  if (!filterDistrict) return true;
                  const dist = referenceData?.districts?.find(d => d.name === filterDistrict);
                  return dist ? m.district_id === dist.id : true;
                }).map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {referenceData?.categories?.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Crop Name</label>
              <input
                type="text"
                placeholder="e.g. Tomato, Turmeric"
                className="form-input"
                value={filterCrop}
                onChange={e => setFilterCrop(e.target.value)}
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  setFilterState('');
                  setFilterDistrict('');
                  setFilterMarket('');
                  setFilterCategory('');
                  setFilterCrop('');
                }}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '8px', color: '#dc2626', marginBottom: '1.5rem' }}>
            {errorMsg}
          </div>
        )}

        {/* Mandi Benchmark Price Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Fetching mandi benchmark prices...
          </div>
        ) : prices.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
            <span style={{ fontSize: '2.5rem' }}>📊</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginTop: '0.5rem' }}>
              No Mandi Rates Found for this Filter
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Try selecting a different district, state, or reset the filters.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {prices.map(p => (
              <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="badge badge-active" style={{ marginBottom: '0.35rem' }}>{p.category}</span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1b4332' }}>
                      {p.crop}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Variety: {p.variety || 'Standard'}</p>
                  </div>

                  <span className="badge badge-demo">Sample/Demo</span>
                </div>

                <div style={{ margin: '1rem 0' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Modal (Average) Mandi Rate
                  </span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#15803d' }}>
                    ₹{p.modalPrice.toLocaleString()} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>/ {p.unit}</span>
                  </div>

                  {/* Range visual bar */}
                  <div style={{
                    marginTop: '0.65rem',
                    padding: '0.65rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    color: '#475569'
                  }}>
                    <span>Min: <strong>₹{p.minPrice.toLocaleString()}</strong></span>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <span>Max: <strong>₹{p.maxPrice.toLocaleString()}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={15} color="#16a34a" />
                    <span><strong>{p.market}</strong>, {p.district}, {p.state}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={15} color="#64748b" />
                    <span>Reported: {p.reportedDate}</span>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <AudioSpeaker
                    text={`At ${p.market}, ${p.crop} average modal price is ${p.modalPrice} rupees per ${p.unit}. Minimum price is ${p.minPrice}, and maximum price is ${p.maxPrice}.`}
                    lang={lang}
                    label="Listen to Price"
                  />
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Verified Benchmark</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
