import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <span style={{ fontSize: '4rem' }}>🌾</span>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#1b4332', marginTop: '0.5rem' }}>404</h1>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
          Page Not Found
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          The harvest page or resource you are looking for does not exist on FarmLink India.
        </p>
        <Link to="/" className="btn btn-primary btn-lg" style={{ fontWeight: 700 }}>
          <Home size={18} />
          Back to Marketplace Home
        </Link>
      </div>
    </div>
  );
}
