
import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { PizzaIcon } from './icons/PizzaIcon';

const InstallPrompt: React.FC = () => {
  const { t } = useLocalization();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Android / Chrome
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // iOS Detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS && !window.matchMedia('(display-mode: standalone)').matches) {
        setShowIOSPrompt(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (isInstalled || (!deferredPrompt && !showIOSPrompt)) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-yellow-500/50 shadow-2xl z-50 animate-slide-up">
      <div className="container mx-auto max-w-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
             <PizzaIcon className="w-10 h-10 text-red-500 bg-gray-800 p-1 rounded-full" />
             <div>
                 <h4 className="font-bold text-white text-sm">{t('installApp')}</h4>
                 <p className="text-xs text-gray-400">{t('installAppDesc')}</p>
             </div>
        </div>
        
        {deferredPrompt && (
            <button 
                onClick={handleInstallClick}
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded-full text-sm shadow-lg whitespace-nowrap"
            >
                {t('install')}
            </button>
        )}

        {showIOSPrompt && (
             <div className="text-yellow-400 text-xs font-bold text-right max-w-[150px]">
                 {t('iosInstall')}
             </div>
        )}
      </div>
      <style>{`
        @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        .animate-slide-up {
            animation: slideUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default InstallPrompt;
