import React from 'react';

interface FlagIconProps {
  countryCode: string;
  size?: number;
  className?: string;
}

// Flag emoji mapping for better fallback support
const FLAG_EMOJIS: Record<string, string> = {
  'KR': '🇰🇷', // South Korea
  'US': '🇺🇸', // United States
  'VN': '🇻🇳', // Vietnam
  'CN': '🇨🇳', // China
  'JP': '🇯🇵', // Japan
  'TH': '🇹🇭', // Thailand
  'RU': '🇷🇺', // Russia
  'ES': '🇪🇸', // Spain
  'FR': '🇫🇷', // France
  'DE': '🇩🇪', // Germany
};

export function FlagIcon({ countryCode, size = 24, className = '' }: FlagIconProps) {
  const emoji = FLAG_EMOJIS[countryCode.toUpperCase()];
  
  if (!emoji) {
    // Fallback for unknown country codes
    return (
      <div 
        className={`inline-flex items-center justify-center bg-gray-200 text-gray-600 rounded ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.6 }}
      >
        {countryCode}
      </div>
    );
  }

  return (
    <span 
      className={`inline-block ${className}`}
      style={{ 
        fontSize: size,
        lineHeight: 1,
        fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif'
      }}
      role="img"
      aria-label={`${countryCode} flag`}
    >
      {emoji}
    </span>
  );
}