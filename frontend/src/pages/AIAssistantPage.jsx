import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Sparkles,
  HelpCircle,
  Database,
  ArrowRight
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AudioSpeaker from '../components/AudioSpeaker';

export default function AIAssistantPage() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();

  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Namaste! I am your FarmLink AI Assistant, directly connected to real-time marketplace data across all Indian states and APMC mandis. How can I help you today?',
      suggestions: [
        'Who is buying tomatoes near Hyderabad?',
        'What is the mandi price of Turmeric in Nizamabad?',
        'Where can I buy wheat?',
        'How does partial quantity matching work?'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMessage = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const res = await api.post('/chat', {
        message: query,
        userContext: {
          role: user?.role || 'farmer',
          state: user?.profile?.state || 'Telangana',
          district: user?.profile?.district || 'Hyderabad'
        }
      });

      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: res.reply,
          suggestions: res.suggestions || [],
          assistantType: res.assistantType || 'Rule-Based FarmLink Assistant'
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: `I apologize, but I could not connect to the marketplace assistant engine: ${err.message}. Please check your connection or contact Farmer Care at 1800-FARMLINK.`,
          suggestions: ['Call Farmer Care hotline', 'Browse Mandi Prices']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Voice speech input using Web Speech API
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or modern Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      handleSend(transcript);
    };

    recognition.start();
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        {/* Assistant Header */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1b4332' }}>
                FarmLink AI Assistant
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
                <Database size={13} color="#16a34a" />
                <span>Connected to Local Marketplace Database & All-India APMC Mandi Records</span>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#f1f5f9',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#475569'
          }}>
            Rule-Based FarmLink Assistant
          </div>
        </div>

        {/* Chat Window */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          height: '620px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          {/* Messages Scroll Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '14px',
                  backgroundColor: m.sender === 'user' ? '#1b4332' : '#f8fafc',
                  color: m.sender === 'user' ? '#ffffff' : '#1e293b',
                  border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap'
                }}>
                  {m.text}
                </div>

                {m.sender === 'assistant' && (
                  <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AudioSpeaker text={m.text} lang={lang} label="Listen to Answer" />
                  </div>
                )}

                {/* Interactive Suggestion Chips */}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                    marginTop: '0.65rem'
                  }}>
                    {m.suggestions.map((s, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSend(s)}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '16px',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.8rem',
                          color: '#1b4332',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#16a34a'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                      >
                        {s} →
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{
                alignSelf: 'flex-start',
                backgroundColor: '#f8fafc',
                padding: '0.85rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                fontSize: '0.9rem',
                fontStyle: 'italic'
              }}>
                Searching FarmLink marketplace database...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div style={{
            borderTop: '1px solid #e2e8f0',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px'
          }}>
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
            >
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`btn btn-secondary ${isListening ? 'btn-danger' : ''}`}
                style={{
                  minHeight: '44px',
                  padding: '0.65rem',
                  borderRadius: '10px',
                  backgroundColor: isListening ? '#fee2e2' : '#ffffff',
                  borderColor: isListening ? '#ef4444' : '#cbd5e1'
                }}
                title={isListening ? 'Listening... Click to stop' : 'Voice Input (Speak your query)'}
              >
                {isListening ? <MicOff size={20} color="#dc2626" /> : <Mic size={20} color="#16a34a" />}
              </button>

              <input
                type="text"
                className="form-input"
                style={{ flex: 1, minHeight: '44px' }}
                placeholder="Ask about buyers, mandi rates, or e.g. 'Who is buying tomatoes near Hyderabad?'"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
              />

              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="btn btn-primary"
                style={{ minHeight: '44px', padding: '0.65rem 1.25rem' }}
              >
                <Send size={18} />
                <span>Ask</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
