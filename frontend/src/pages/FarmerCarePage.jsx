import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
  BookOpen,
  Send,
  MessageSquare
} from 'lucide-react';
import api from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import AudioSpeaker from '../components/AudioSpeaker';

export default function FarmerCarePage() {
  const { lang, t } = useLanguage();

  const [supportInfo, setSupportInfo] = useState(null);
  const [activeTopic, setActiveTopic] = useState('post-produce');
  const [formData, setFormData] = useState({ user_name: '', phone: '', topic: 'How to Post Produce', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api.get('/support')
      .then(res => setSupportInfo(res))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_name || !formData.phone) {
      setErrorMsg('Please enter your name and phone number.');
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
    <div style={{ padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '2.5rem' }}>🌾</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1b4332', marginTop: '0.25rem' }}>
            FarmLink Farmer Care Center
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.25rem' }}>
            All-India Agricultural Support & Guidance for Farmers and Buyers
          </p>
        </div>

        {/* Emergency Toll-Free Banner (Requirement 15) */}
        <div style={{
          backgroundColor: '#1b4332',
          backgroundImage: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 25px -5px rgba(27, 67, 50, 0.3)'
        }}>
          <div>
            <span style={{ color: '#74c69d', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Need Help Using FarmLink?
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.25rem' }}>
              Call Support: +91 1800 327 654
            </h2>
            <p style={{ color: '#d8f3dc', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              1800-FARMLINK • 24/7 Toll-Free in Telugu, Hindi, English, Tamil, Kannada, Marathi
            </p>
          </div>

          <a
            href="tel:+911800327654"
            className="btn btn-accent btn-lg"
            style={{ fontWeight: 800, fontSize: '1.15rem', padding: '1rem 2rem' }}
          >
            <PhoneCall size={24} />
            CALL NOW
          </a>
        </div>

        {/* Safeguard Notice (Requirement 15) */}
        <div style={{
          backgroundColor: '#fef2f2',
          border: '2px solid #fecaca',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
          marginBottom: '2.5rem'
        }}>
          <ShieldAlert size={26} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ color: '#991b1b', fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Farmer Confirmation Protection Safeguard
            </h3>
            <p style={{ color: '#7f1d1d', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Customer support representatives must <strong>NOT</strong> independently sell produce or accept offers on behalf of the farmer. Explicit farmer confirmation is always strictly required for all transactions and price agreements.
            </p>
          </div>
        </div>

        {/* Support Topics Tabs & Detailed Guides */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e293b' }}>
              Step-by-Step Educational Guides
            </h2>
            {selectedTopic && (
              <AudioSpeaker
                text={`${selectedTopic.title}. ${selectedTopic.summary}. Step 1: ${selectedTopic.steps.join('. Step ')}`}
                lang={lang}
                label="Listen to Full Guide"
              />
            )}
          </div>

          {/* Topic Selector Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {supportInfo?.topics?.map(topic => (
              <button
                key={topic.id}
                onClick={() => setActiveTopic(topic.id)}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '25px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  border: '1.5px solid',
                  borderColor: activeTopic === topic.id ? '#1b4332' : '#cbd5e1',
                  backgroundColor: activeTopic === topic.id ? '#d8f3dc' : '#ffffff',
                  color: activeTopic === topic.id ? '#1b4332' : '#475569',
                  cursor: 'pointer'
                }}
              >
                {topic.title}
              </button>
            ))}
          </div>

          {selectedTopic && (
            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1b4332', marginBottom: '0.5rem' }}>
                {selectedTopic.title}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                {selectedTopic.summary}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {selectedTopic.steps?.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: '#2d6a4f',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#1e293b', paddingTop: '2px' }}>
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Free Officer Callback Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <PhoneCall size={20} color="#16a34a" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
              Request a Free Agricultural Officer Callback
            </h2>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Prefer to speak on the phone? Leave your mobile number and our field team will call you back within 15 minutes.
          </p>

          {submitted ? (
            <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#15803d' }}>
              <CheckCircle size={24} />
              <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                Thank you! Your request has been queued. An agricultural field officer will call your phone number shortly.
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Your Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.user_name}
                    onChange={e => setFormData({ ...formData, user_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Support Topic</label>
                <select
                  className="form-select"
                  value={formData.topic}
                  onChange={e => setFormData({ ...formData, topic: e.target.value })}
                >
                  <option value="How to Post Produce">How to Post Produce</option>
                  <option value="How to Find Buyers">How to Find Buyers & Smart Matches</option>
                  <option value="How to Understand Offers">How to Accept/Counter Offers</option>
                  <option value="Supply Aggregation Guidance">Supply Aggregation Guidance</option>
                  <option value="Mandi Price Questions">Mandi Price Questions</option>
                  <option value="Order Tracking Help">Order Tracking Help</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Question / Details (Optional)</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="Describe your question or difficulty..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              {errorMsg && (
                <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg"
                style={{ fontWeight: 800 }}
              >
                <Send size={18} />
                {submitting ? 'Submitting Request...' : 'Request Free Callback Now'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
