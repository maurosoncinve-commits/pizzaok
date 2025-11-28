
import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import { useLocalization } from '../hooks/useLocalization';
import { DownloadIcon } from './icons/DownloadIcon';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLocalization();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
        if (!isIOS) {
            alert("App might already be installed or browser doesn't support auto-install. Check menu options.");
        }
        return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('howToInstall')}>
      <div className="space-y-6">
        <p className="text-gray-300">{t('installInstructions')}</p>
        
        {/* Android / Desktop Chrome Button */}
        {deferredPrompt && (
             <button
                onClick={handleInstallClick}
                className="flex items-center justify-center gap-2 w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded-lg transition-colors"
            >
                <DownloadIcon className="w-6 h-6" />
                {t('install')}
            </button>
        )}

        {/* Instructions for everyone */}
        <div className="bg-gray-700/50 p-4 rounded-lg space-y-4 text-sm text-gray-200">
             {!isIOS && !deferredPrompt && (
                 <p>
                    <strong>Android:</strong> {t('installAndroid')}
                 </p>
             )}
             
             {isIOS && (
                 <div className="space-y-2">
                    <p className="font-bold text-white">iPhone / iPad (iOS):</p>
                    <ol className="list-decimal list-inside space-y-1 text-gray-300">
                        <li>Tap the <span className="font-bold text-blue-400">Share</span> icon (square with arrow up) in the Safari toolbar.</li>
                        <li>Scroll down the list of options.</li>
                        <li>Tap <span className="font-bold text-white">Add to Home Screen</span>.</li>
                        <li>Tap <span className="font-bold text-white">Add</span> in the top right corner.</li>
                    </ol>
                 </div>
             )}
        </div>
      </div>
    </Modal>
  );
};

export default InstallModal;
