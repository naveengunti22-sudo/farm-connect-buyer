import React from 'react';
import { PhoneCall, ShieldCheck, Heart, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#0f291e',
      color: '#cbd5e1',
      borderTop: '3px solid #2d6a4f',
      padding: '3rem 0 1.5rem 0',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Col 1: About */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.8rem' }}>🌾</span>
              <h3 style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: 800 }}>
                FarmLink <span style={{ color: '#f59e0b' }}>India</span>
              </h3>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#94a3b8', marginBottom: '1.25rem' }}>
              Empowering India's farmers through direct digital trade, partial supply aggregation, transparent APMC mandi benchmarks, and atomic double-selling safeguards.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#74c69d', fontSize: '0.85rem' }}>
              <ShieldCheck size={18} />
              <span>100% Verified Farmers & Institutional Buyers</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>
              Marketplace Quick Access
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li><Link to="/produce" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#ffffff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Farmer Produce Listings</Link></li>
              <li><Link to="/demand" style={{ color: '#94a3b8' }}>Institutional Buyer Demands</Link></li>
              <li><Link to="/matches" style={{ color: '#94a3b8' }}>Smart Supply Matching Engine</Link></li>
              <li><Link to="/market-prices" style={{ color: '#94a3b8' }}>APMC Mandi Benchmark Prices</Link></li>
              <li><Link to="/assistant" style={{ color: '#94a3b8' }}>FarmLink AI Assistant</Link></li>
              <li><Link to="/help" style={{ color: '#94a3b8' }}>Farmer Care Help Center</Link></li>
            </ul>
          </div>

          {/* Col 3: All-India Mandi Coverage */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>
              Regional Mandi Hubs
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <MapPin size={15} color="#52b788" />
                <span>Telangana: Bowenpally, Enumamula, Nizamabad</span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <MapPin size={15} color="#52b788" />
                <span>Andhra Pradesh: Guntur Mirchi Yard, Madanapalle</span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <MapPin size={15} color="#52b788" />
                <span>Maharashtra: Lasalgaon Onion, Gultekdi Pune</span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <MapPin size={15} color="#52b788" />
                <span>Karnataka: Kolar Tomato, Yeshwanthpur</span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <MapPin size={15} color="#52b788" />
                <span>Punjab: Khanna Grain Mandi, Amritsar Dana</span>
              </div>
            </div>
          </div>

          {/* Col 4: Farmer Care Contact */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>
              Farmer Care & Support
            </h4>
            <div style={{
              backgroundColor: '#1b4332',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid #2d6a4f'
            }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#74c69d', fontWeight: 700, display: 'block' }}>
                24/7 All-India Toll-Free
              </span>
              <a
                href="tel:+911800327654"
                style={{
                  color: '#ffffff',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginTop: '0.35rem'
                }}
              >
                <PhoneCall size={18} color="#f59e0b" />
                1800-FARMLINK
              </a>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.2rem' }}>
                (+91 1800 327 654)
              </span>
              <p style={{ fontSize: '0.75rem', color: '#a7f3d0', marginTop: '0.5rem', lineHeight: 1.4 }}>
                Available in English, Hindi, Telugu, Tamil, Kannada, and Marathi.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright & disclaimers */}
        <div style={{
          borderTop: '1px solid #1e3a2f',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          <div>
            © 2026 FarmLink India Technologies. Built for India's Agricultural Ecosystem.
          </div>
          <div>
            Mandi prices shown are regional benchmark rates • Farmer explicit confirmation required for all sales.
          </div>
        </div>
      </div>
    </footer>
  );
}
