
import React from 'react';
import Modal from './common/Modal';
import { useLocalization } from '../hooks/useLocalization';
import { WhatsappIcon } from './icons/WhatsappIcon';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  customerName: string;
  customerPhone?: string;
  countryCode?: string;
}

const ShareCardModal: React.FC<ShareCardModalProps> = ({ 
  isOpen, 
  onClose, 
  imageUrl, 
  customerName, 
  customerPhone, 
  countryCode 
}) => {
  const { t } = useLocalization();

  const handleOpenWhatsapp = () => {
    const whatsappMsg = encodeURIComponent(`Halo ${customerName}, ${t('shareMessage')}`);
    let whatsappUrl = `https://wa.me/?text=${whatsappMsg}`;
    
    if (customerPhone && countryCode) {
        let cleanNumber = customerPhone.replace(/^0+/, '');
        let fullPhone = `${countryCode.replace('+','')}${cleanNumber}`;
        whatsappUrl = `https://wa.me/${fullPhone}?text=${whatsappMsg}`;
    }
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('readyToShare')}>
      <div className="flex flex-col items-center space-y-4">
        
        <div className="bg-gray-700 p-2 rounded-lg">
            {imageUrl && (
                <img src={imageUrl} alt="Loyalty Card" className="max-w-full h-auto rounded-lg shadow-lg max-h-[300px]" />
            )}
        </div>

        <div className="text-center text-yellow-400 font-bold text-sm bg-gray-700/50 p-3 rounded-lg w-full">
            <p className="mb-1">{t('shareStep1')}</p>
        </div>

        <div className="w-full">
            <button
                onClick={handleOpenWhatsapp}
                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg"
            >
                <WhatsappIcon className="w-6 h-6" />
                {t('shareStep2')}
            </button>
        </div>
        
        <button onClick={onClose} className="text-gray-400 hover:text-white text-sm underline">
            {t('close')}
        </button>
      </div>
    </Modal>
  );
};

export default ShareCardModal;
