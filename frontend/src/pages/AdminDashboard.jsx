import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Sprout,
  ShoppingBag,
  MessageSquareQuote,
  Package,
  TrendingUp,
  Lock,
  PlusCircle,
  CheckCircle
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentOffers, setRecentOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Add Crop Modal / Form
  const [cropName, setCropName] = useState('');
  const [cropCategory, setCropCategory] = useState('1');
  const [cropHindi, setCropHindi] = useState('');
  const [cropIcon, setCropIcon] = useState('🌾');
  const [addingCrop, setAddingCrop] = useState(false);
  const [cropSuccess, setCropSuccess] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get('/admin/stats');
      setStats(res.stats);
      setRecentOrders(res.recentOrders || []);
      setRecentOffers(res.recentOffers || []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load admin stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleAddCrop = async (e) => {
    e.preventDefault();
    if (!cropName) return;
    try {
      setAddingCrop(true);
      await api.post('/admin/crops', {
        name: cropName,
        category_id: parseInt(cropCategory),
        hindi_name: cropHindi,
        icon: cropIcon
      });
      setCropSuccess(`Crop '${cropName}' added successfully!`);
      setCropName('');
      setCropHindi('');
      loadAdminData();
    } catch (err) {
      alert(`Failed to add crop: ${err.message}`);
    } finally {
      setAddingCrop(false);
    }
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e293b' }}>
              Platform Administration & Oversight
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              System health, all-India user metrics, marketplace transactions, and catalog management
            </p>
          </div>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '8px', color: '#dc2626', marginBottom: '1.5rem' }}>
            {errorMsg}
          </div>
        )}

        {/* Stats Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading platform metrics...</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Farmers</span>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#15803d', marginTop: '0.2rem' }}>
                  {stats?.totalFarmers || 0}
                </div>
              </div>

              <div className="card" style={{ borderLeft: '4px solid #2563eb' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Buyers</span>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1d4ed8', marginTop: '0.2rem' }}>
                  {stats?.totalBuyers || 0}
                </div>
              </div>

              <div className="card" style={{ borderLeft: '4px solid #059669' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active Produce Listings</span>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>
                  {stats?.activeListings || 0}
                </div>
              </div>

              <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active Demands</span>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>
                  {stats?.activeRequirements || 0}
                </div>
              </div>

              <div className="card" style={{ borderLeft: '4px solid #d97706' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Offers</span>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#b45309', marginTop: '0.2rem' }}>
                  {stats?.totalOffers || 0}
                </div>
              </div>

              <div className="card" style={{ borderLeft: '4px solid #ea580c' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active Reservations</span>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#c2410c', marginTop: '0.2rem' }}>
                  {stats?.activeReservations || 0}
                </div>
              </div>

              <div className="card" style={{ borderLeft: '4px solid #7c3aed' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Confirmed Orders</span>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#6d28d9', marginTop: '0.2rem' }}>
                  {stats?.totalOrders || 0}
                </div>
              </div>

              <div className="card" style={{ borderLeft: '4px solid #e11d48' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Mandi Price Records</span>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#be123c', marginTop: '0.2rem' }}>
                  {stats?.marketPriceRecords || 0}
                </div>
              </div>
            </div>

            {/* Management & Recent Activity Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
              {/* Add Crop to Catalog */}
              <div className="card">
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                  Add Crop to Platform Catalog
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Extensible without altering frontend code (Requirement 12)
                </p>

                {cropSuccess && (
                  <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', padding: '0.75rem', borderRadius: '8px', color: '#15803d', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={16} />
                    <span>{cropSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleAddCrop}>
                  <div className="form-group">
                    <label className="form-label">Crop Name (English) *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Mustard, Black Gram, Guava"
                      value={cropName}
                      onChange={e => setCropName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid-cols-2">
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        value={cropCategory}
                        onChange={e => setCropCategory(e.target.value)}
                      >
                        <option value="1">Vegetables</option>
                        <option value="2">Fruits</option>
                        <option value="3">Cereals</option>
                        <option value="4">Millets</option>
                        <option value="5">Pulses</option>
                        <option value="6">Oilseeds</option>
                        <option value="7">Spices</option>
                        <option value="8">Other Agricultural Crops</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Icon / Emoji</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cropIcon}
                        onChange={e => setCropIcon(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Regional / Hindi Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. सरसों"
                      value={cropHindi}
                      onChange={e => setCropHindi(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={addingCrop}
                    className="btn btn-primary"
                    style={{ width: '100%', fontWeight: 700 }}
                  >
                    {addingCrop ? 'Adding...' : '+ Add Crop to System'}
                  </button>
                </form>
              </div>

              {/* Recent Orders */}
              <div className="card">
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>
                  Recent Confirmed Orders
                </h3>
                {recentOrders.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No orders confirmed yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {recentOrders.map(o => (
                      <div key={o.id} style={{
                        padding: '0.75rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.85rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#1e293b' }}>
                          <span>#{o.order_number} ({o.crop_name})</span>
                          <span style={{ color: '#15803d' }}>₹{o.total_amount.toLocaleString()}</span>
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                          {o.farmer_name} → {o.buyer_name} ({o.quantity} {o.unit})
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
