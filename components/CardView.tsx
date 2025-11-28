
import React, { useRef, useEffect, useState } from 'react';
import { Card, Customer, CardType } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { PizzaIcon } from './icons/PizzaIcon';
import { FIDELITY_POINTS_FOR_REWARD } from '../constants';
import { formatDate } from '../utils/helpers';
import Modal from './common/Modal';
import { WhatsappIcon } from './icons/WhatsappIcon';
import { DeleteIcon } from './icons/DeleteIcon';
import ShareCardModal from './ShareCardModal';

declare const QRCode: any;
declare const htmlToImage: any;

interface CardViewProps {
  card: Card;
  customer: Customer;
  onDelete: (cardId: string) => void;
}

const DiscountIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="5" x2="5" y2="19"></line>
        <circle cx="6.5" cy="6.5" r="2.5"></circle>
        <circle cx="17.5" cy="17.5" r="2.5"></circle>
    </svg>
);

const GiftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 12 20 22 4 22 4 12"></polyline>
        <rect x="2" y="7" width="20" height="5"></rect>
        <line x1="12" y1="22" x2="12" y2="7"></line>
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C9.8 2 12 4.2 12 7z"></path>
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C14.2 2 12 4.2 12 7z"></path>
    </svg>
);


const CardView: React.FC<CardViewProps> = ({ card, customer, onDelete }) => {
  const { t, language } = useLocalization();
  const cardRef = useRef<HTMLDivElement>(null);
  const qrcodeRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');

  const isVip = card.type === CardType.VIP;

  useEffect(() => {
    if (qrcodeRef.current && typeof QRCode !== 'undefined') {
      qrcodeRef.current.innerHTML = '';
      new QRCode(qrcodeRef.current, {
        text: card.id,
        width: 100,
        height: 100,
        colorDark: '#111827',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H,
      });
    }
  }, [card.id]);
  
 const handleShare = async () => {
    if (!cardRef.current || !htmlToImage) return;

    setIsGenerating(true);
    
    try {
        // Wait for fonts/images to render slightly
        await new Promise(r => setTimeout(r, 100));

        const dataUrl = await htmlToImage.toJpeg(cardRef.current, { 
            quality: 0.95,
            backgroundColor: '#1f2937' 
        });

        setGeneratedImageUrl(dataUrl);
        setIsShareModalOpen(true);

    } catch (err) {
        console.error('Failed to share card:', err);
        alert(t('sharingFailed'));
    } finally {
        setIsGenerating(false);
    }
  };

  const handleDeleteConfirm = () => {
    onDelete(card.id);
    setIsDeleteModalOpen(false);
  };
  
  const progressPercentage = isVip ? 100 : (card.points / FIDELITY_POINTS_FOR_REWARD) * 100;

  return (
    <>
    <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-700/50 flex flex-col h-full transform hover:scale-[1.02] transition-transform duration-300">
        <div 
            ref={cardRef} 
            className="p-4 sm:p-6 flex-grow bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-2xl"
        >
             {/* Mobile: Stack Vertical (QR Top), Desktop: Row (QR Right) */}
             <div className="flex flex-col-reverse sm:flex-row justify-between items-center sm:items-start gap-6 sm:gap-0">
                
                {/* Left Side (Info) */}
                <div className="flex-1 w-full text-center sm:text-left sm:pr-4">
                    <h3 className="text-2xl font-bold text-white tracking-wide break-words">{customer.name}</h3>
                    <p className="text-sm text-gray-400">@{customer.instagram}</p>
                    
                    {isVip ? (
                        <div className="mt-6 space-y-3">
                            <p className="font-semibold text-amber-400 text-sm">{t('benefits')}:</p>
                            <div className="space-y-3 text-gray-200 text-sm flex flex-col items-center sm:items-start">
                                <div className="flex items-center gap-3"><DiscountIcon className="w-5 h-5 text-red-400" /><span>{t('vipBenefit1')}</span></div>
                                <div className="flex items-center gap-3"><GiftIcon className="w-5 h-5 text-red-400" /><span>{t('vipBenefit2')}</span></div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6">
                            <p className="font-semibold text-amber-400 text-sm mb-2">{t('progress')}:</p>
                            <div className="flex items-baseline justify-center sm:justify-start gap-2">
                                <span className="text-4xl font-bold text-white">{card.points}</span>
                                <span className="text-lg text-gray-400"> / {FIDELITY_POINTS_FOR_REWARD} {t('points')}</span>
                            </div>
                             <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                                <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">{card.points >= FIDELITY_POINTS_FOR_REWARD ? `🎉 ${t('fidelityReward')}` : `${FIDELITY_POINTS_FOR_REWARD - card.points} points to reward`}</p>
                        </div>
                    )}
                </div>
                
                {/* Right Side (QR & Logo) */}
                <div className="flex flex-col items-center sm:items-end flex-shrink-0 w-full sm:w-auto">
                    <div className="flex items-center justify-center sm:justify-end space-x-2 mb-4 sm:mb-0 w-full">
                        <PizzaIcon className="h-10 w-10 sm:h-8 sm:w-8 text-white object-contain" />
                        <span className="text-xl sm:text-lg font-semibold">Pizza 'N Gooo</span>
                    </div>
                    <div ref={qrcodeRef} className="mt-2 p-1 bg-white rounded-md shadow-lg inline-block"></div>
                    <p className="font-mono text-xs text-gray-400 mt-2">{card.id}</p>
                    <p className="text-xs text-gray-500 mt-1">Expires: {formatDate(card.expiresAt, language)}</p>
                </div>
            </div>
        </div>

        <div className="p-2 bg-gray-800 grid grid-cols-2 gap-2">
            <button
                onClick={handleShare}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm disabled:bg-gray-500 disabled:cursor-not-allowed shadow-md"
            >
                <WhatsappIcon className="w-5 h-5" />
                {isGenerating ? t('generatingCard') : 'Send WA'}
            </button>
            <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm shadow-md"
            >
                <DeleteIcon className="w-5 h-5" />
                {t('delete')}
            </button>
        </div>
    </div>
    
    <Modal
      isOpen={isDeleteModalOpen}
      onClose={() => setIsDeleteModalOpen(false)}
      title={t('deleteCard')}
    >
      <div>
        <p className="text-gray-300 mb-6">{t('areYouSureDeleteCard')}</p>
        <div className="flex justify-end gap-4">
          <button onClick={() => setIsDeleteModalOpen(false)} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors">{t('cancel')}</button>
          <button onClick={handleDeleteConfirm} className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">{t('delete')}</button>
        </div>
      </div>
    </Modal>
    
    <ShareCardModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)}
        imageUrl={generatedImageUrl}
        customerName={customer.name}
        customerPhone={customer.phone.number}
        countryCode={customer.phone.countryCode}
    />
    </>
  );
};

export default CardView;
