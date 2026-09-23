import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sprout,
  ShoppingBag,
  Sparkles,
  MessageSquareQuote,
  Package,
  TrendingUp,
  Bot,
  HelpCircle,
  Globe,
  User,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import FarmerCareModal from './FarmerCareModal';

export default function Navbar() {
  const { user, isAuthenticated, isFarmer, isBuyer, isAdmin, logout } = useAuth();
  const { lang, changeLanguage, availableLanguages, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 800,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {/* Top utility strip for All-India notice, Farmer helpline & Language */}
        <div style={{
          backgroundColor: '#1b4332',
          color: '#e2e8f0',
          padding: '0.35rem 1.25rem',
          fontSize: '0.8rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.9rem' }}>🇮🇳</span>
              <strong>All-India Agricultural Direct Marketplace</strong>
            </span>
            <span style={{ color: '#52b788' }}>|</span>
            <a
              href="tel:+911800327654"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#74c69d', fontWeight: 600 }}
            >
              <PhoneCall size={13} />
              Toll-Free Farmer Care: 1800-FARMLINK (+91 1800 327 654)
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Globe size={14} color="#74c69d" />
              <select
                value={lang}
                onChange={(e) => changeLanguage(e.target.value)}
                style={{
                  backgroundColor: '#2d6a4f',
                  color: '#ffffff',
                  border: '1px solid #40916c',
                  borderRadius: '4px',
                  padding: '0.15rem 0.4rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {availableLanguages.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>

            {/* Quick Demo Help */}
            <button
              onClick={() => setHelpModalOpen(true)}
              style={{
                backgroundColor: '#d97706',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                padding: '0.15rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <HelpCircle size={13} />
              Need Help?
            </button>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              boxShadow: '0 2px 8px rgba(27,67,50,0.25)'
            }}>
              🌾
            </div>
            <div>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1b4332', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>
                FarmLink <span style={{ color: '#d97706' }}>India</span>
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Kisan Direct Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} className="desktop-nav">
            <Link
              to="/produce"
              className="btn btn-sm"
              style={{
                backgroundColor: isActive('/produce') ? '#d8f3dc' : 'transparent',
                color: isActive('/produce') ? '#1b4332' : '#334155'
              }}
            >
              <Sprout size={16} color={isActive('/produce') ? '#1b4332' : '#475569'} />
              <span>{t('nav_produce', 'Produce')}</span>
            </Link>

            <Link
              to="/demand"
              className="btn btn-sm"
              style={{
                backgroundColor: isActive('/demand') ? '#d8f3dc' : 'transparent',
                color: isActive('/demand') ? '#1b4332' : '#334155'
              }}
            >
              <ShoppingBag size={16} color={isActive('/demand') ? '#1b4332' : '#475569'} />
              <span>{t('nav_demands', 'Demands')}</span>
            </Link>

            <Link
              to="/matches"
              className="btn btn-sm"
              style={{
                backgroundColor: isActive('/matches') ? '#d8f3dc' : 'transparent',
                color: isActive('/matches') ? '#1b4332' : '#334155',
                position: 'relative'
              }}
            >
              <Sparkles size={16} color="#d97706" />
              <span>{t('nav_matches', 'Smart Matches')}</span>
            </Link>

            <Link
              to="/offers"
              className="btn btn-sm"
              style={{
                backgroundColor: isActive('/offers') ? '#d8f3dc' : 'transparent',
                color: isActive('/offers') ? '#1b4332' : '#334155'
              }}
            >
              <MessageSquareQuote size={16} color={isActive('/offers') ? '#1b4332' : '#475569'} />
              <span>{t('nav_offers', 'Offers')}</span>
            </Link>

            <Link
              to="/orders"
              className="btn btn-sm"
              style={{
                backgroundColor: isActive('/orders') ? '#d8f3dc' : 'transparent',
                color: isActive('/orders') ? '#1b4332' : '#334155'
              }}
            >
              <Package size={16} color={isActive('/orders') ? '#1b4332' : '#475569'} />
              <span>{t('nav_orders', 'Orders')}</span>
            </Link>

            <Link
              to="/market-prices"
              className="btn btn-sm"
              style={{
                backgroundColor: isActive('/market-prices') ? '#d8f3dc' : 'transparent',
                color: isActive('/market-prices') ? '#1b4332' : '#334155'
              }}
            >
              <TrendingUp size={16} color={isActive('/market-prices') ? '#1b4332' : '#475569'} />
              <span>{t('nav_prices', 'Mandi Prices')}</span>
            </Link>

            <Link
              to="/assistant"
              className="btn btn-sm"
              style={{
                backgroundColor: isActive('/assistant') ? '#d8f3dc' : 'transparent',
                color: isActive('/assistant') ? '#1b4332' : '#334155'
              }}
            >
              <Bot size={16} color="#2563eb" />
              <span>{t('nav_assistant', 'AI Assistant')}</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="btn btn-sm"
                style={{
                  backgroundColor: isActive('/admin') ? '#f3e8ff' : 'transparent',
                  color: isActive('/admin') ? '#7e22ce' : '#334155'
                }}
              >
                <ShieldCheck size={16} color="#7e22ce" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Right Action / Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link
                  to="/profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: isFarmer ? '#dcfce7' : isBuyer ? '#dbeafe' : '#f3e8ff',
                    color: isFarmer ? '#15803d' : isBuyer ? '#1d4ed8' : '#7e22ce',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem'
                  }}>
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', display: 'block' }}>
                      {user?.name?.split(' ')[0]}
                    </span>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: isFarmer ? '#16a34a' : isBuyer ? '#2563eb' : '#7e22ce'
                    }}>
                      {user?.role}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn btn-sm btn-secondary"
                  title="Logout"
                  style={{ padding: '0.45rem', minHeight: '36px' }}
                >
                  <LogOut size={16} color="#dc2626" />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/login" className="btn btn-sm btn-secondary">
                  {t('nav_login', 'Login')}
                </Link>
                <Link to="/register" className="btn btn-sm btn-primary">
                  {t('nav_register', 'Register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-toggle"
              style={{
                display: 'none',
                padding: '0.4rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1'
              }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <Link to="/produce" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              <Sprout size={18} /> Produce Listings
            </Link>
            <Link to="/demand" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              <ShoppingBag size={18} /> Buyer Demands
            </Link>
            <Link to="/matches" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              <Sparkles size={18} /> Smart Matches & Supply Aggregation
            </Link>
            <Link to="/offers" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              <MessageSquareQuote size={18} /> Offers & Negotiation
            </Link>
            <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              <Package size={18} /> Orders
            </Link>
            <Link to="/market-prices" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              <TrendingUp size={18} /> Mandi Prices
            </Link>
            <Link to="/assistant" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              <Bot size={18} /> FarmLink AI Assistant
            </Link>
            <button onClick={() => { setHelpModalOpen(true); setMobileMenuOpen(false); }} className="btn btn-accent" style={{ justifyContent: 'flex-start' }}>
              <HelpCircle size={18} /> Farmer Care Hotline
            </button>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="btn btn-danger" style={{ justifyContent: 'flex-start', marginTop: '0.5rem' }}>
                <LogOut size={18} /> Logout
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>Login</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ flex: 1 }}>Register</Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Responsive Style Overrides */}
      <style>{`
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-toggle { display: flex !important; }
        }
      `}</style>

      {/* Floating Need Help? Button */}
      <button
        type="button"
        onClick={() => setHelpModalOpen(true)}
        className="floating-help-btn"
        title="Need Help? Click to call Farmer Care or read guides"
      >
        <PhoneCall size={20} />
        <span>Need Help?</span>
      </button>

      {/* Global Farmer Care Support Modal */}
      <FarmerCareModal isOpen={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
    </>
  );
}
