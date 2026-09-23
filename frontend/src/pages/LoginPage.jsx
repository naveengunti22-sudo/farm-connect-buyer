import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserCheck, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await login(email, password);
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from === '/login' ? '/dashboard' : from);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillAndLogin = async (demoEmail, demoPassword = 'Password123!') => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await login(demoEmail, demoPassword);
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3rem 1.25rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '960px', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Left: Login Form */}
        <div className="card" style={{ padding: '2.5rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
              <LogIn size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e293b' }}>
                Sign In to FarmLink
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Access your agricultural marketplace dashboard
              </p>
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
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              </div>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', minHeight: '48px', fontSize: '1rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#16a34a', fontWeight: 700 }}>
              Register as Farmer or Buyer
            </Link>
          </div>
        </div>

        {/* Right: Instant Test Credentials Panel */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1.5px dashed #cbd5e1',
          borderRadius: '16px',
          padding: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <UserCheck size={20} color="#15803d" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b' }}>
              One-Click Demo Accounts
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Click any role to automatically log in and test the mandatory scenarios (e.g. 700 + 800 + 500 = 2,000 kg supply aggregation):
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Farmer A */}
            <button
              type="button"
              onClick={() => fillAndLogin('farmer.ramesh@farmlink.in')}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#16a34a'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#15803d' }}>👨‍🌾 Farmer A: Ramesh Kumar</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>
                  Has 700 kg Tomato @ ₹24/kg • Bowenpally, Hyderabad
                </span>
              </div>
              <span className="badge badge-active">Login</span>
            </button>

            {/* Farmer B */}
            <button
              type="button"
              onClick={() => fillAndLogin('farmer.balu@farmlink.in')}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#16a34a'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#15803d' }}>👨‍🌾 Farmer B: Balu Naik</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>
                  Has 800 kg Tomato @ ₹23/kg • Enumamula, Warangal
                </span>
              </div>
              <span className="badge badge-active">Login</span>
            </button>

            {/* Farmer C */}
            <button
              type="button"
              onClick={() => fillAndLogin('farmer.suresh@farmlink.in')}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#16a34a'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#15803d' }}>👨‍🌾 Farmer C: Suresh Reddy</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>
                  Has 500 kg Tomato @ ₹25/kg • Hyderabad
                </span>
              </div>
              <span className="badge badge-active">Login</span>
            </button>

            {/* Buyer A */}
            <button
              type="button"
              onClick={() => fillAndLogin('buyer.ravi@farmlink.in')}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#1d4ed8' }}>🏢 Buyer A: Ravi Agro Foods</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>
                  Needs 2,000 kg Tomato • Combines A + B + C
                </span>
              </div>
              <span className="badge badge-confirmed">Login</span>
            </button>

            {/* Admin */}
            <button
              type="button"
              onClick={() => fillAndLogin('admin@farmlink.in')}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#7e22ce'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#7e22ce' }}>🛡️ Platform Admin: Sharma</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>
                  Marketplace Oversight, Stats, Mandi Manager
                </span>
              </div>
              <span className="badge" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce' }}>Login</span>
            </button>
          </div>

          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
            All demo passwords: <code>Password123!</code>
          </div>
        </div>

      </div>
    </div>
  );
}
