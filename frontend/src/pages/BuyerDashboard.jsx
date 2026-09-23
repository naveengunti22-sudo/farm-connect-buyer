import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  Sparkles,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  PlusCircle,
  ArrowRight,
  Send,
  Layers
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [requirements, setRequirements] = useState([]);
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [topMatchData, setTopMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const [reqRes, offRes, ordRes] = await Promise.all([
        api.get(`/requirements?buyer_id=${user.id}`),
        api.get('/offers'),
        api.get('/orders')
      ]);

      const reqs = reqRes.requirements || [];
      setRequirements(reqs);
      setOffers(offRes.offers || []);
      setOrders(ordRes.orders || []);

      // If buyer has active requirements, fetch match for the first one to highlight supply aggregation
      if (reqs.length > 0) {
        try {
          const matchRes = await api.get(`/matches?requirementId=${reqs[0].id}`);
          setTopMatchData(matchRes);
        } catch (e) {
          console.warn('Match fetch error:', e);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load buyer dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const totalDemand = requirements.reduce((acc, r) => acc + (r.quantity_required || 0), 0);
  const activeOffers = offers.filter(o => ['PENDING', 'COUNTERED', 'RESERVED'].includes(o.status));

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        {/* Buyer Welcome Banner */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.75rem' }}>🏢</span>
            <div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1e3a8a' }}>
                {user?.profile?.company_name || user?.name}
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Institutional Buyer Dashboard • {user?.profile?.district || 'Hyderabad'}, {user?.profile?.state || 'Telangana'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/demand" className="btn btn-primary" style={{ backgroundColor: '#2563eb' }}>
              <PlusCircle size={18} />
              + Publish Demand
            </Link>
            <Link to="/matches" className="btn btn-secondary">
              <Sparkles size={18} color="#d97706" />
              Supply Aggregator
            </Link>
          </div>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '8px', color: '#dc2626', marginBottom: '1.5rem' }}>
            {errorMsg}
          </div>
        )}

        {/* 4 Quantitative Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="card" style={{ borderLeft: '4px solid #2563eb' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Active Demands
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e3a8a', marginTop: '0.35rem' }}>
              {requirements.length} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>postings</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
              Total volume: <strong>{totalDemand.toLocaleString()} kg</strong>
            </p>
          </div>

          <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Matched Supply
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#15803d', marginTop: '0.35rem' }}>
              {topMatchData?.aggregation?.totalAvailableMatched || 0} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>kg</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '0.35rem', fontWeight: 600 }}>
              {topMatchData?.aggregation?.fulfilledPercentage || 0}% fulfillable via aggregation
            </p>
          </div>

          <div className="card" style={{ borderLeft: '4px solid #d97706' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Active Bids / Offers
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#b45309', marginTop: '0.35rem' }}>
              {activeOffers.length} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>in negotiation</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
              Pending farmer acceptance or reserved
            </p>
          </div>

          <div className="card" style={{ borderLeft: '4px solid #059669' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Confirmed Orders
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginTop: '0.35rem' }}>
              {orders.length} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>orders</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#059669', marginTop: '0.35rem', fontWeight: 600 }}>
              Mandi pickup or in-transit
            </p>
          </div>
        </div>

        {/* Core Highlight: Multi-Farmer Partial Supply Aggregator Banner */}
        {topMatchData?.aggregation && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '2px solid #93c5fd',
            padding: '1.75rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 15px rgba(37, 99, 235, 0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <span className="badge badge-confirmed">Multi-Farmer Supply Aggregation Engine</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e3a8a', marginTop: '0.35rem' }}>
                  Requirement: {topMatchData.requirement.quantityRequired} {topMatchData.requirement.unit} of {topMatchData.requirement.crop}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  Target Budget: ₹{topMatchData.requirement.maxTargetPrice}/{topMatchData.requirement.unit} • Location: {topMatchData.requirement.location}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#15803d' }}>
                  {topMatchData.aggregation.fulfilledPercentage}% Fulfilled
                </div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Combined from {topMatchData.aggregation.participatingFarmersCount} independent farmers
                </span>
              </div>
            </div>

            {/* Aggregation Calculation Flow */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.25rem'
            }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
                Optimal Supply Combination Calculated by Engine:
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                {topMatchData.aggregation.suggestedCombination.map((farmerAlloc, idx) => (
                  <div key={farmerAlloc.listingId} style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    borderLeft: '4px solid #16a34a'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>{farmerAlloc.farmerName}</strong>
                      <span className="match-score-badge match-score-excellent" style={{ fontSize: '0.75rem' }}>
                        {farmerAlloc.matchScore}% Match
                      </span>
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803d', margin: '0.35rem 0' }}>
                      {farmerAlloc.allocatedQty} {farmerAlloc.unit}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Price: ₹{farmerAlloc.pricePerUnit}/{farmerAlloc.unit} • Subtotal: ₹{farmerAlloc.subtotal.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: '1rem',
                paddingTop: '0.85rem',
                borderTop: '1px dashed #cbd5e1',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}>
                <div>
                  <strong>Total Combined Volume:</strong> {topMatchData.aggregation.totalAvailableMatched} {topMatchData.requirement.unit}
                  {topMatchData.aggregation.remainingShortfall > 0 && (
                    <span style={{ color: '#dc2626', marginLeft: '0.5rem' }}>
                      (Shortfall: {topMatchData.aggregation.remainingShortfall} {topMatchData.requirement.unit})
                    </span>
                  )}
                </div>
                <div>
                  <strong>Average Combined Rate:</strong> <span style={{ color: '#15803d', fontWeight: 800 }}>₹{topMatchData.aggregation.averagePrice}/{topMatchData.requirement.unit}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Link to={`/matches?requirementId=${topMatchData.requirement.id}`} className="btn btn-primary" style={{ backgroundColor: '#2563eb' }}>
                Open Full Supply Aggregator Tool <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {/* My Demands List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e293b' }}>
              My Active Requirements ({requirements.length})
            </h2>
            <Link to="/demand" className="btn btn-sm btn-secondary">
              Manage All Demands →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {requirements.map(r => (
              <div key={r.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>{r.crop_name}</h3>
                  <span className="badge badge-active">{r.status}</span>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1d4ed8', margin: '0.5rem 0' }}>
                  {r.quantity_required.toLocaleString()} {r.unit}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Target: <strong>₹{r.max_target_price}/{r.unit}</strong> • Quality: {r.required_quality}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Location: {r.location || r.district}, {r.state}
                </p>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Needed by: {r.required_date || 'Immediate'}</span>
                  <Link to={`/matches?requirementId=${r.id}`} className="btn btn-sm btn-primary" style={{ backgroundColor: '#2563eb', fontSize: '0.8rem' }}>
                    <Sparkles size={14} /> Combine Supply
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
