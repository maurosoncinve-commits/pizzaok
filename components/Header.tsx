
import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { Language } from '../utils/localization';
import { PizzaIcon } from './icons/PizzaIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { CloudIcon } from './icons/CloudIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface HeaderProps {
  onHelpClick?: () => void;
  onSettingsClick?: () => void;
  onInstallClick?: () => void;
  syncStatus?: 'synced' | 'syncing' | 'error';
  showNotification?: (msg: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onHelpClick, onSettingsClick, onInstallClick, syncStatus, showNotification }) => {
  const { language, setLanguage, t } = useLocalization();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <header className="bg-black/20 backdrop-blur-sm p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <PizzaIcon className="h-8 w-8 text-red-500" />
          <span className="text-xl font-semibold text-white hidden md:inline">{t('appName')}</span>
          <span className="text-xl font-semibold text-white md:hidden">Pizza 'N Gooo</span>
        </div>
        <div className="flex items-center space-x-2">
          {syncStatus && (
              <div className="mr-1" title={t(syncStatus as any)}>
                  <CloudIcon className="w-5 h-5" status={syncStatus} />
              </div>
          )}

          <button
             onClick={onInstallClick}
             className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-full transition-colors text-xs font-bold shadow-md"
             aria-label={t('installApp')}
             title={t('installApp')}
          >
             <DownloadIcon className="w-4 h-4" />
             <span className="hidden sm:inline">{t('install')}</span>
          </button>

          <button
             onClick={onSettingsClick}
             className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
             aria-label={t('settings')}
             title={t('settings')}
          >
             <SettingsIcon className="w-6 h-6" />
          </button>

          <button
             onClick={onHelpClick}
             className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors rounded-full hover:bg-white/10"
             aria-label={t('help')}
             title={t('help')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-1 bg-gray-700 rounded-md p-1 ml-1">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                language === 'en' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => handleLanguageChange('id')}
              className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                language === 'id' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              ID
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
