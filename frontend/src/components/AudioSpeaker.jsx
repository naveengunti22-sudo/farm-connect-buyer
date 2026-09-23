import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AudioSpeaker({ text, lang = 'en', label = 'Listen' }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = (e) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel(); // Clear any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt language matching
    if (lang === 'hi') utterance.lang = 'hi-IN';
    else if (lang === 'te') utterance.lang = 'te-IN';
    else if (lang === 'ta') utterance.lang = 'ta-IN';
    else if (lang === 'mr') utterance.lang = 'mr-IN';
    else utterance.lang = 'en-IN';

    utterance.rate = 0.9; // Slightly slower for clear rural comprehension
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      className={`btn-sm btn-secondary ${isPlaying ? 'playing' : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.3rem 0.6rem',
        borderRadius: '8px',
        fontSize: '0.8rem',
        color: isPlaying ? '#16a34a' : '#475569',
        borderColor: isPlaying ? '#22c55e' : '#cbd5e1',
        backgroundColor: isPlaying ? '#f0fdf4' : '#ffffff'
      }}
      title="Listen to details (Audio Support)"
    >
      {isPlaying ? <VolumeX size={15} color="#16a34a" /> : <Volume2 size={15} color="#475569" />}
      <span>{isPlaying ? 'Stop' : label}</span>
    </button>
  );
}
