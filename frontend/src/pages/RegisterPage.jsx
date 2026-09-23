import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Sprout, ShoppingBag, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [role, setRole] = useState('farmer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedState, setSelectedState] = useState('Telangana');
  const [selectedDistrict, setSelectedDistrict] = useState('Hyderabad');
  const [selectedMarket, setSelectedMarket] = useState('Bowenpally APMC Market');
  const [companyName, setCompanyName] = useState('');

  const [referenceData, setReferenceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api.get('/metadata/reference')
      .then(res => {
        if (res.referenceData) setReferenceData(res.referenceData);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const payload = {
        name,
        email,
        phone,
        password,
        role,
        state: selectedState,
        district: selectedDistrict,
        market_apmc: selectedMarket,
        company_name: companyName || name
      };

      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredDistricts = referenceData?.districts?.filter(d => {
    const st = referenceData.states.find(s => s.name === selectedState);
    return st ? d.state_id === st.id : true;
  }) || [];

  return (
    <div style={{ padding: '3rem 1.25rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '640px', width: '100%', padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1b4332' }}>
            Join FarmLink India
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Register your farm or business for direct agricultural trade
          </p>

          {/* Role Toggle */}
          <div style={{
            display: 'flex',
            backgroundColor: '#f1f5f9',
            padding: '0.35rem',
            borderRadius: '12px',
            marginTop: '1.25rem',
            gap: '0.35rem'
          }}>
            <button
              type="button"
              onClick={() => setRole('farmer')}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: role === 'farmer' ? '#ffffff' : 'transparent',
                color: role === 'farmer' ? '#15803d' : '#64748b',
                boxShadow: role === 'farmer' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer'
              }}
            >
              <Sprout size={18} />
              I am a Farmer (Kisan)
            </button>
            <button
              type="button"
              onClick={() => setRole('buyer')}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: role === 'buyer' ? '#ffffff' : 'transparent',
                color: role === 'buyer' ? '#1d4ed8' : '#64748b',
                boxShadow: role === 'buyer' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer'
              }}
            >
              <ShoppingBag size={18} />
              I am a Buyer (Trader / Processor)
            </button>
          </div>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#dc2626',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Full Name / Primary Contact *</label>
              <input
                type="text"
                className="form-input"
                placeholder={role === 'farmer' ? 'e.g. Ramesh Kumar' : 'e.g. Ravi Sharma'}
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@farmlink.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="Choose strong password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {role === 'buyer' && (
            <div className="form-group">
              <label className="form-label">Company / Business Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Deccan Agro Foods Pvt Ltd"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
              />
            </div>
          )}

          {/* Regional Mandi & Location (Dynamic) */}
          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">State</label>
              <select
                className="form-select"
                value={selectedState}
                onChange={e => {
                  setSelectedState(e.target.value);
                  const st = referenceData?.states?.find(s => s.name === e.target.value);
                  const dists = referenceData?.districts?.filter(d => d.state_id === st?.id);
                  if (dists && dists.length > 0) setSelectedDistrict(dists[0].name);
                }}
              >
                {referenceData?.states ? (
                  referenceData.states.map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                ) : (
                  <>
                    <option value="Telangana">Telangana</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Punjab">Punjab</option>
                  </>
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">District</label>
              <select
                className="form-select"
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
              >
                {filteredDistricts.length > 0 ? (
                  filteredDistricts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)
                ) : (
                  <>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Warangal">Warangal</option>
                    <option value="Nizamabad">Nizamabad</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {role === 'farmer' && (
            <div className="form-group">
              <label className="form-label">Primary APMC Mandi Yard</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Bowenpally APMC Market / Nizamabad Mandi"
                value={selectedMarket}
                onChange={e => setSelectedMarket(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', minHeight: '48px', fontSize: '1rem', marginTop: '0.75rem' }}
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'farmer' ? 'Farmer' : 'Buyer'}`}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#16a34a', fontWeight: 700 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
