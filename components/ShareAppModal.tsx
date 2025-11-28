
import React, { useRef, useEffect } from 'react';
import Modal from './common/Modal';
import { useLocalization } from '../hooks/useLocalization';
import { WhatsappIcon } from './icons/WhatsappIcon';

declare const QRCode: any;

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLocalization();
  const qrRef = useRef<HTMLDivElement>(null);
  const currentUrl = window.location.href;

  useEffect(() => {
    if (isOpen && qrRef.current && typeof QRCode !== 'undefined') {
      qrRef.current.innerHTML = '';
      new QRCode(qrRef.current, {
        text: currentUrl,
        width: 256,
        height: 256,
        colorDark: '#111827',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H,
      });
    }
  }, [isOpen, currentUrl]);

  const handleWhatsappShare = () => {
      const message = `Login Staff Pizza 'N Gooo: ${currentUrl}`;
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('shareApp')}>
      <div className="flex flex-col items-center space-y-6">
        <p className="text-gray-300 text-center">{t('shareAppDesc')}</p>
        
        <div className="p-4 bg-white rounded-xl shadow-lg">
            <div ref={qrRef}></div>
        </div>

        <div className="w-full pt-4 border-t border-gray-700">
            <button
                onClick={handleWhatsappShare}
                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
                <WhatsappIcon className="w-6 h-6" />
                {t('share')}
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareAppModal;
