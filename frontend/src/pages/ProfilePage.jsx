import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, Mail, Building, CheckCircle } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [state, setState] = useState(user?.profile?.state || 'Telangana');
  const [district, setDistrict] = useState(user?.profile?.district || 'Hyderabad');
  const [marketApmc, setMarketApmc] = useState(user?.profile?.market_apmc || '');
  const [companyName, setCompanyName] = useState(user?.profile?.company_name || '');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.profile?.delivery_address || '');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setState(user.profile?.state || 'Telangana');
      setDistrict(user.profile?.district || 'Hyderabad');
      setMarketApmc(user.profile?.market_apmc || '');
      setCompanyName(user.profile?.company_name || '');
      setDeliveryAddress(user.profile?.delivery_address || '');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      await api.patch(`/users/${user.id}`, {
        name,
        phone,
        state,
        district,
        market_apmc: marketApmc,
        company_name: companyName,
        delivery_address: deliveryAddress
      });

      setSuccessMsg('Profile updated successfully!');
      if (refreshUser) refreshUser();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '680px' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: user?.role === 'farmer' ? '#dcfce7' : '#dbeafe',
              color: user?.role === 'farmer' ? '#15803d' : '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.25rem'
            }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>
                Account Profile
              </h1>
              <span className={`badge badge-${user?.role === 'farmer' ? 'active' : 'confirmed'}`}>
                {user?.role?.toUpperCase()} ACCOUNT
              </span>
            </div>
          </div>

          {successMsg && (
            <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', padding: '0.75rem 1rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', marginBottom: '1.25rem' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
              />
            </div>

            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-input"
                  value={state}
                  onChange={e => setState(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">District</label>
                <input
                  type="text"
                  className="form-input"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                />
              </div>
            </div>

            {user?.role === 'farmer' && (
              <div className="form-group">
                <label className="form-label">Primary APMC Mandi Yard</label>
                <input
                  type="text"
                  className="form-input"
                  value={marketApmc}
                  onChange={e => setMarketApmc(e.target.value)}
                  placeholder="e.g. Bowenpally APMC Market"
                />
              </div>
            )}

            {user?.role === 'buyer' && (
              <>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Address / Warehouse</label>
                  <input
                    type="text"
                    className="form-input"
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.75rem', fontWeight: 800 }}
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
