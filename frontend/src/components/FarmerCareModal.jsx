import React, { useState, useEffect } from 'react';
import { PhoneCall, X, ShieldAlert, CheckCircle, BookOpen, Send, HelpCircle } from 'lucide-react';
import api from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import AudioSpeaker from './AudioSpeaker';

export default function FarmerCareModal({ isOpen, onClose }) {
  const { t, lang } = useLanguage();
  const [supportInfo, setSupportInfo] = useState(null);
  const [activeTopic, setActiveTopic] = useState('post-produce');
  const [formData, setFormData] = useState({ user_name: '', phone: '', topic: 'Post Produce Help', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/support')
        .then(res => setSupportInfo(res))
        .catch(err => console.error('Failed to load support info:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_name || !formData.phone) {
      setErrorMsg('Please enter your Name and Phone Number.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      await api.post('/support', formData);
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit callback request.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTopic = supportInfo?.topics?.find(t => t.id === activeTopic) || supportInfo?.topics?.[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '780px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1b4332' }}>FarmLink Farmer Care</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>24/7 Dedicated Agricultural Assistance for Farmers & Buyers</p>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: '0.35rem', borderRadius: '50%', color: '#64748b', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Emergency Call Banner */}
        <div style={{
          backgroundColor: '#1b4332',
          backgroundImage: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 12px rgba(27, 67, 50, 0.2)'
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#74c69d', fontWeight: 700 }}>
              Need Help Using FarmLink?
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '0.2rem' }}>
              Call Support: +91 1800 327 654
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#d8f3dc', marginTop: '0.15rem' }}>
              Toll-Free Helpline • Available in Telugu, Hindi, English, Tamil, Kannada, Marathi
            </p>
          </div>
          <a
            href="tel:+911800327654"
            className="btn btn-accent btn-lg"
            style={{ fontWeight: 800, textDecoration: 'none' }}
          >
            <PhoneCall size={20} />
            CALL NOW
          </a>
        </div>

        {/* Critical Farmer Protection Safeguard Notice */}
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1.5px solid #fecaca',
          borderRadius: '10px',
          padding: '0.9rem 1.15rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start',
          marginBottom: '1.5rem'
        }}>
          <ShieldAlert size={22} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ color: '#991b1b', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.2rem' }}>
              Farmer Confirmation Safeguard
            </h4>
            <p style={{ color: '#7f1d1d', fontSize: '0.825rem', lineHeight: 1.5 }}>
              FarmLink Farmer Care cannot sell produce on your behalf or accept offers. Farmer explicit confirmation is strictly required for all transactions and price agreements.
            </p>
          </div>
        </div>

        {/* Guide Topics / Callback Request Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>
                How Can We Help You Today?
              </h4>
              {selectedTopic && (
                <AudioSpeaker
                  text={`${selectedTopic.title}. ${selectedTopic.summary}. Step 1: ${selectedTopic.steps.join('. Step ')}`}
                  lang={lang}
                  label="Listen to Guide"
                />
              )}
            </div>

            {/* Topic Pills */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {supportInfo?.topics?.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => setActiveTopic(topic.id)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: activeTopic === topic.id ? '#2d6a4f' : '#cbd5e1',
                    backgroundColor: activeTopic === topic.id ? '#d8f3dc' : '#ffffff',
                    color: activeTopic === topic.id ? '#1b4332' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {topic.title}
                </button>
              ))}
            </div>

            {/* Selected Topic Content */}
            {selectedTopic && (
              <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                <h5 style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                  {selectedTopic.title}
                </h5>
                <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '0.85rem' }}>
                  {selectedTopic.summary}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedTopic.steps?.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.85rem', color: '#334155' }}>
                      <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#2d6a4f', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Callback Request Form */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.75rem' }}>
              Want a Field Officer to Call You Back?
            </h4>

            {submitted ? (
              <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#15803d' }}>
                <CheckCircle size={22} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  Thank you! Your callback request has been logged. Our agricultural officer will call your number within 15 minutes.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="form-input"
                    value={formData.user_name}
                    onChange={e => setFormData({ ...formData, user_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Mobile Number (e.g. 98480xxxxx)"
                    className="form-input"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <input
                    type="text"
                    placeholder="Brief question or topic (e.g., How do I counter offer on tomatoes?)"
                    className="form-input"
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                {errorMsg && (
                  <div style={{ gridColumn: '1 / -1', color: '#dc2626', fontSize: '0.825rem' }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" onClick={onClose} className="btn btn-secondary">
                    Close
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    <Send size={16} />
                    {submitting ? 'Submitting...' : 'Request Free Callback'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
