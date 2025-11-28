
import React from 'react';
import Modal from './common/Modal';
import { useLocalization } from '../hooks/useLocalization';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLocalization();

  const steps = [
    { title: t('guideStep1Title'), desc: t('guideStep1Desc'), icon: '📝' },
    { title: t('guideStep2Title'), desc: t('guideStep2Desc'), icon: '📲' },
    { title: t('guideStep3Title'), desc: t('guideStep3Desc'), icon: '💰' },
    { title: t('guideStep4Title'), desc: t('guideStep4Desc'), icon: '🎁' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('operatorGuide')}>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl">
              {step.icon}
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">{step.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
        <div className="pt-4 border-t border-gray-700">
             <button 
                onClick={onClose}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
             >
                OK
             </button>
        </div>
      </div>
    </Modal>
  );
};

export default HelpModal;
