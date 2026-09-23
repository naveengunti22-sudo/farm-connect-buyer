import React from 'react';
import { Check } from 'lucide-react';

const defaultCrops = [
  { name: 'Tomato', hindi: 'टमाटर', icon: '🍅', category: 'Vegetables', unit: 'kg' },
  { name: 'Onion', hindi: 'प्याज', icon: '🧅', category: 'Vegetables', unit: 'kg' },
  { name: 'Potato', hindi: 'आलू', icon: '🥔', category: 'Vegetables', unit: 'kg' },
  { name: 'Mango', hindi: 'आम', icon: '🥭', category: 'Fruits', unit: 'kg' },
  { name: 'Banana', hindi: 'केला', icon: '🍌', category: 'Fruits', unit: 'kg' },
  { name: 'Rice (Paddy)', hindi: 'चावल', icon: '🌾', category: 'Cereals', unit: 'quintal' },
  { name: 'Wheat', hindi: 'गेहूं', icon: '🌾', category: 'Cereals', unit: 'quintal' },
  { name: 'Maize', hindi: 'मक्का', icon: '🌽', category: 'Cereals', unit: 'quintal' },
  { name: 'Jowar (Sorghum)', hindi: 'ज्वार', icon: '🌾', category: 'Millets', unit: 'quintal' },
  { name: 'Red Gram (Tur / Arhar)', hindi: 'तूर दाल', icon: '🌱', category: 'Pulses', unit: 'quintal' },
  { name: 'Groundnut', hindi: 'मूंगफली', icon: '🥜', category: 'Oilseeds', unit: 'quintal' },
  { name: 'Chilli', hindi: 'लाल मिर्च', icon: '🌶️', category: 'Spices', unit: 'quintal' },
  { name: 'Turmeric', hindi: 'हल्दी', icon: '🫚', category: 'Spices', unit: 'quintal' },
  { name: 'Cotton', hindi: 'कपास', icon: '☁️', category: 'Other Agricultural Crops', unit: 'quintal' }
];

export default function PictureCropPicker({ selectedCrop, onSelect, availableCrops = [] }) {
  const cropsToDisplay = availableCrops.length > 0 ? availableCrops : defaultCrops;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Choose Crop (Tap Picture)</span>
        <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>
          Selected: {selectedCrop || 'None'}
        </span>
      </label>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
        gap: '0.65rem',
        maxHeight: '220px',
        overflowY: 'auto',
        padding: '0.5rem',
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
        border: '1.5px solid #e2e8f0'
      }}>
        {cropsToDisplay.map((crop) => {
          const isSelected = selectedCrop?.toLowerCase() === crop.name?.toLowerCase();
          return (
            <button
              key={crop.name}
              type="button"
              onClick={() => onSelect(crop)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.65rem 0.4rem',
                borderRadius: '8px',
                border: '2px solid',
                borderColor: isSelected ? '#16a34a' : '#cbd5e1',
                backgroundColor: isSelected ? '#dcfce7' : '#ffffff',
                boxShadow: isSelected ? '0 2px 6px rgba(22, 163, 74, 0.25)' : 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.15s ease'
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
              <span style={{ fontSize: '1.75rem', marginBottom: '0.2rem' }}>
                {crop.icon || '🌾'}
              </span>
              <strong style={{ fontSize: '0.8rem', color: isSelected ? '#15803d' : '#1e293b', textAlign: 'center', lineHeight: 1.2 }}>
                {crop.name.split(' (')[0]}
              </strong>
              {crop.hindi_name && (
                <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '1px' }}>
                  {crop.hindi_name}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
