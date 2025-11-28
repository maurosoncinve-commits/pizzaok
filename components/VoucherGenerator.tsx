
import React, { useRef, useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { PizzaIcon } from './icons/PizzaIcon';
import { WhatsappIcon } from './icons/WhatsappIcon';
import ShareCardModal from './ShareCardModal';

declare const htmlToImage: any;

const VoucherGenerator: React.FC = () => {
    const { t } = useLocalization();
    const [title, setTitle] = useState('SPECIAL PROMO');
    const [amount, setAmount] = useState('10% OFF');
    const [desc, setDesc] = useState('Valid for dine-in only.');
    const voucherRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState('');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const handleShare = async () => {
        if (!voucherRef.current || !htmlToImage) return;
        setIsGenerating(true);
        try {
            await new Promise(r => setTimeout(r, 100));
            const dataUrl = await htmlToImage.toJpeg(voucherRef.current, { 
                quality: 0.95,
                backgroundColor: '#1f2937' 
            });
            setGeneratedImageUrl(dataUrl);
            setIsShareModalOpen(true);
        } catch (err) {
            console.error(err);
            alert(t('sharingFailed'));
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-pink-500">{t('createVoucher')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">{t('voucherTitle')}</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">{t('voucherAmount')}</label>
                        <input type="text" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-bold" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">{t('voucherDesc')}</label>
                        <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" rows={3} />
                    </div>
                    <button 
                        onClick={handleShare}
                        disabled={isGenerating}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition-colors flex items-center justify-center gap-2"
                    >
                        <WhatsappIcon className="w-5 h-5" />
                        {isGenerating ? t('generatingCard') : t('generateVoucher')}
                    </button>
                </div>

                {/* Preview */}
                <div>
                    <p className="text-gray-400 mb-2 text-sm">{t('preview')}</p>
                    <div ref={voucherRef} className="bg-gradient-to-r from-red-900 to-red-800 p-6 rounded-xl border-2 border-yellow-500/50 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <PizzaIcon className="w-48 h-48 text-white" />
                        </div>
                        <div className="relative z-10 text-center border-2 border-dashed border-white/30 p-6 rounded-lg">
                            <PizzaIcon className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                            <h3 className="text-2xl font-bold text-white uppercase tracking-wider mb-2">{title}</h3>
                            <div className="text-4xl font-extrabold text-yellow-400 my-4 bg-black/30 inline-block px-4 py-2 rounded">{amount}</div>
                            <p className="text-gray-200 text-sm italic">{desc}</p>
                            <p className="text-xs text-gray-400 mt-4">Pizza 'N Gooo Loyalty Reward</p>
                        </div>
                    </div>
                </div>
            </div>

            <ShareCardModal 
                isOpen={isShareModalOpen} 
                onClose={() => setIsShareModalOpen(false)} 
                imageUrl={generatedImageUrl} 
                customerName="Customer"
            />
        </div>
    );
};

export default VoucherGenerator;
