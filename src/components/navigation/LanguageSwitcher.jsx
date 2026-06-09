import React from 'react';

const LanguageSwitcher = ({ onLanguageChange }) => {
  return (
    <select className="lang-selector" onChange={onLanguageChange}>
      <option value="en">🇬🇧 English</option>
      <option value="fr">🇫🇷 Français</option>
      <option value="sw">🇰🇪 Kiswahili</option>
      <option value="ar">🇸🇦 العربية</option>
      <option value="pt">🇵🇹 Português</option>
    </select>
  );
};

export default LanguageSwitcher;