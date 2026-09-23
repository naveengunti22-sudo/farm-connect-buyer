import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Users,
  Layers,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  Lock,
  Zap,
  Globe
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LandingPage() {
  const { isAuthenticated, isFarmer, isBuyer, login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    farmers: 3,
    buyers: 2,
    activeListings: 4,
    activeDemands: 1
  });
  const [samplePrices, setSamplePrices] = useState([]);
  const [loadingDemo, setLoadingDemo] = useState(false);

  useEffect(() => {
    api.get('/listings?status=ACTIVE')
      .then(res => {
        if (res.listings) {
          setStats(prev => ({ ...prev, activeListings: res.listings.length }));
        }
      })
      .catch(() => {});

    api.get('/market-prices?state=Telangana')
      .then(res => {
        if (res.data) setSamplePrices(res.data.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  const handleQuickDemo = async (role) => {
    try {
      setLoadingDemo(true);
      if (role === 'farmer') {
        await login('farmer.ramesh@farmlink.in', 'Password123!');
        navigate('/dashboard');
      } else if (role === 'buyer') {
        await login('buyer.ravi@farmlink.in', 'Password123!');
        navigate('/dashboard');
      }
    } catch (err) {
      alert(`Demo login error: ${err.message}`);
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 60%, #40916c 100%)',
        color: '#ffffff',
        padding: '4.5rem 0 3.5rem 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '820px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
              backdropFilter: 'blur(4px)'
            }}>
              <span>🌾</span>
              <span>All-India Agricultural Direct Marketplace & Matching Engine</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              letterSpacing: '-0.02em'
            }}>
              Connecting Multiple Farmers Directly with Multiple Buyers.
            </h1>

            <p style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: '#d8f3dc',
              lineHeight: 1.6,
              marginBottom: '2rem',
              maxWidth: '720px'
            }}>
              Sell harvests directly without middlemen. Combine small farmer supplies (700 kg + 800 kg + 500 kg = 2,000 kg) to meet institutional buyer demands with guaranteed transactional reservation.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <Link to="/produce" className="btn btn-accent btn-lg" style={{ fontWeight: 800 }}>
                <Sprout size={20} />
                Explore Produce Listings
              </Link>
              <Link to="/demand" className="btn btn-secondary btn-lg" style={{ fontWeight: 700, backgroundColor: '#ffffff', color: '#1b4332' }}>
                <ShoppingBag size={20} />
                Post Buyer Demand
              </Link>
              <Link to="/matches" className="btn btn-secondary btn-lg" style={{ fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}>
                <Sparkles size={20} color="#f59e0b" />
                Smart Matches
              </Link>
            </div>

            {/* Quick Demo Fill Buttons */}
            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <span style={{ fontSize: '0.85rem', color: '#a7f3d0', fontWeight: 600, display: 'block', marginBottom: '0.6rem' }}>
                ⚡ INSTANT DEMO LOGIN (TEST ACCOUNTS):
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                <button
                  onClick={() => handleQuickDemo('farmer')}
                  disabled={loadingDemo}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#15803d',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
                  }}
                >
                  👨‍🌾 Test as Farmer Ramesh (700 kg Tomato)
                </button>
                <button
                  onClick={() => handleQuickDemo('buyer')}
                  disabled={loadingDemo}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#1d4ed8',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
                  }}
                >
                  🏢 Test as Buyer Ravi (2,000 kg Tomato Demand)
                </button>
                <Link
                  to="/login"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textDecoration: 'none'
                  }}
                >
                  View All Test Credentials →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mandatory Architecture Highlight: Partial Supply Matching */}
      <section style={{ padding: '3.5rem 0', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 2.5rem auto' }}>
            <span style={{ color: '#16a34a', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Core Innovation: Multi-Farmer Partial Supply Aggregator
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginTop: '0.35rem' }}>
              How Institutional Demands Are Met By Small Farmers
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.5rem' }}>
              No single farmer needs to supply the entire quantity. FarmLink's matching engine dynamically aggregates supply across multiple farmers to fulfill bulk buyer requirements.
            </p>
          </div>

          {/* Visual Interactive Supply Flow Box */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '2px solid #bbf7d0',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '960px',
            margin: '0 auto',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
              {/* Farmer A */}
              <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '1.75rem' }}>👨‍🌾</span>
                <h4 style={{ fontWeight: 700, color: '#1e293b', marginTop: '0.35rem' }}>Farmer A (Ramesh)</h4>
                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Hyderabad, Telangana</p>
                <div style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 800, padding: '0.35rem', borderRadius: '6px', marginTop: '0.5rem' }}>
                  700 kg Tomato
                </div>
              </div>

              {/* Farmer B */}
              <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '1.75rem' }}>👨‍🌾</span>
                <h4 style={{ fontWeight: 700, color: '#1e293b', marginTop: '0.35rem' }}>Farmer B (Balu)</h4>
                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Warangal, Telangana</p>
                <div style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 800, padding: '0.35rem', borderRadius: '6px', marginTop: '0.5rem' }}>
                  800 kg Tomato
                </div>
              </div>

              {/* Farmer C */}
              <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '1.75rem' }}>👨‍🌾</span>
                <h4 style={{ fontWeight: 700, color: '#1e293b', marginTop: '0.35rem' }}>Farmer C (Suresh)</h4>
                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Hyderabad, Telangana</p>
                <div style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 800, padding: '0.35rem', borderRadius: '6px', marginTop: '0.5rem' }}>
                  500 kg Tomato
                </div>
              </div>
            </div>

            {/* Summation Math Strip */}
            <div style={{
              margin: '1.5rem 0',
              padding: '1rem',
              backgroundColor: '#1b4332',
              color: '#ffffff',
              borderRadius: '10px',
              textAlign: 'center',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '1.1rem',
              fontWeight: 800
            }}>
              <span>Farmer A (700 kg)</span>
              <span style={{ color: '#f59e0b' }}>+</span>
              <span>Farmer B (800 kg)</span>
              <span style={{ color: '#f59e0b' }}>+</span>
              <span>Farmer C (500 kg)</span>
              <span style={{ color: '#f59e0b' }}>=</span>
              <span style={{ backgroundColor: '#f59e0b', color: '#1b4332', padding: '0.2rem 0.75rem', borderRadius: '6px' }}>
                2,000 kg Exact Fulfill
              </span>
            </div>

            {/* Buyer Destination */}
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1.5px solid #bfdbfe',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>🏢</span>
                <div>
                  <h4 style={{ fontWeight: 800, color: '#1e3a8a' }}>Buyer A: Ravi Agro Foods (Sauce Factory)</h4>
                  <p style={{ color: '#3b82f6', fontSize: '0.85rem' }}>Requirement: 2,000 kg Grade A Tomato • Budget: ₹26/kg</p>
                </div>
              </div>
              <Link to="/matches" className="btn btn-primary" style={{ backgroundColor: '#2563eb' }}>
                View Smart Match Breakdown →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Grid */}
      <section style={{ padding: '3.5rem 0', backgroundColor: '#f8fafc' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {/* Pillar 1 */}
            <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', marginBottom: '1rem' }}>
                <Lock size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.4rem' }}>
                Double-Selling Prevention
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Atomic transactional locking reserves accepted quantity for 24 hours. No two buyers can ever reserve the same farm harvest simultaneously.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="card" style={{ borderLeft: '4px solid #2563eb' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', marginBottom: '1rem' }}>
                <Sparkles size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.4rem' }}>
                Smart Matching Engine
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Multi-factor scoring based on Crop (35%), Price (25%), Location proximity (20%), Quality (10%), and harvest readiness (10%).
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="card" style={{ borderLeft: '4px solid #d97706' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', marginBottom: '1rem' }}>
                <TrendingUp size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.4rem' }}>
                APMC Mandi Benchmarks
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Transparent modal, min, and max rates across Indian mandis. Verified benchmark data clearly labeled for farmer reference.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="card" style={{ borderLeft: '4px solid #7c3aed' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', marginBottom: '1rem' }}>
                <Globe size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.4rem' }}>
                Low-Literacy & Voice Ready
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Large touch targets, visual crop badges, text-to-speech voice reader, toll-free 1800-FARMLINK hotline, and 6 Indian languages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* APMC Benchmark Preview */}
      {samplePrices.length > 0 && (
        <section style={{ padding: '3.5rem 0', backgroundColor: '#ffffff' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge badge-demo">Sample/Demo Data</span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginTop: '0.4rem' }}>
                  Live APMC Mandi Benchmark Rates
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Regional wholesale prices across Bowenpally, Enumamula, and Nizamabad mandis.
                </p>
              </div>
              <Link to="/market-prices" className="btn btn-secondary">
                View All Mandi Prices →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
              {samplePrices.map(p => (
                <div key={p.id} className="card" style={{ borderTop: '3px solid #2d6a4f' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>{p.crop}</h4>
                    <span className="badge badge-active">{p.category}</span>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0.75rem 0' }}>{p.market}</p>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d' }}>
                    ₹{p.modalPrice} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>/ {p.unit}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                    Range: ₹{p.minPrice} – ₹{p.maxPrice}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Need Help Banner */}
      <section style={{ backgroundColor: '#1b4332', color: '#ffffff', padding: '3rem 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '680px' }}>
          <span style={{ fontSize: '2.5rem' }}>📞</span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem' }}>
            Need Assistance or Field Guidance?
          </h2>
          <p style={{ color: '#d8f3dc', fontSize: '1rem', marginTop: '0.5rem', lineHeight: 1.6 }}>
            Our 24/7 Farmer Care team is available toll-free across India in Telugu, Hindi, English, Tamil, Kannada, and Marathi.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="tel:+911800327654" className="btn btn-accent btn-lg" style={{ fontWeight: 800 }}>
              <PhoneCall size={20} />
              Call 1800-FARMLINK (+91 1800 327 654)
            </a>
            <Link to="/help" className="btn btn-secondary btn-lg" style={{ backgroundColor: '#ffffff', color: '#1b4332', fontWeight: 700 }}>
              Visit Farmer Care Center
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
