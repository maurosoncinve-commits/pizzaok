
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { NewTransaction, Card, Customer, CardType } from '../types';
import { CameraIcon } from './icons/CameraIcon';

// html5-qrcode is loaded from CDN
declare const Html5Qrcode: any;
declare const Tesseract: any;

interface TransactionFormProps {
    cards: Card[];
    customers: Customer[];
    onAddTransaction: (transaction: NewTransaction) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ cards, customers, onAddTransaction }) => {
    const { t } = useLocalization();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCardId, setSelectedCardId] = useState('');
    const [amount, setAmount] = useState('');
    const [displayAmount, setDisplayAmount] = useState('');
    const [error, setError] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [isScanningReceipt, setIsScanningReceipt] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const receiptInputRef = useRef<HTMLInputElement>(null);
    
    const wrapperRef = useRef<HTMLDivElement>(null);

    const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c.name])), [customers]);

    const filteredCards = useMemo(() => {
        if (!searchTerm || selectedCardId) return [];
        const lowerSearchTerm = searchTerm.toLowerCase();
        
        const cardsByName = customers
            .filter(c => c.name.toLowerCase().includes(lowerSearchTerm))
            .flatMap(c => cards.filter(card => card.customerId === c.id));
            
        const cardsById = cards.filter(c => c.id.toLowerCase().includes(lowerSearchTerm));

        const allFiltered = [...cardsByName, ...cardsById];
        return Array.from(new Map(allFiltered.map(item => [item.id, item])).values());
    }, [searchTerm, cards, customers, selectedCardId]);

    const handleSelectCard = useCallback((card: Card) => {
        setSelectedCardId(card.id);
        const customerName = customerMap.get(card.customerId) || 'Unknown';
        setSearchTerm(`${customerName} (${card.id})`);
        setShowResults(false);
    }, [customerMap]);

    const handleStartScanning = () => {
        setError('');
        setIsScanning(true);
    };

    const handleStopScanning = () => {
        setIsScanning(false);
    };

    const formatAmount = (val: string) => {
        const num = val.replace(/\D/g, '');
        if (!num) return '';
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const rawValue = val.replace(/\./g, '');
        
        if (rawValue === '' || /^\d+$/.test(rawValue)) {
            setAmount(rawValue);
            setDisplayAmount(formatAmount(rawValue));
        }
    };

    const handleReceiptScanClick = () => {
        receiptInputRef.current?.click();
    };

    const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsScanningReceipt(true);
            setError('');
            const file = e.target.files[0];
            
            try {
                if (typeof Tesseract === 'undefined') {
                    throw new Error("OCR Library not loaded");
                }

                const result = await Tesseract.recognize(
                    file,
                    'eng',
                    { logger: (m: any) => console.log(m) }
                );

                const text = result.data.text;
                const lines = text.split('\n');
                
                const numberPattern = /[\d,.]+/g;
                let maxVal = 0;

                for (const line of lines) {
                    const cleanLine = line.replace(/[Rp$]/gi, '');
                    const matches = cleanLine.match(numberPattern);
                    if (matches) {
                        for (const match of matches) {
                            const normalized = match.replace(/\./g, '').replace(/,/g, '.'); 
                            const val = parseFloat(normalized);
                            
                            if (!isNaN(val) && val > 5000 && val < 10000000) {
                                if (val > maxVal) maxVal = val;
                            }
                        }
                    }
                }
                
                if (maxVal > 0) {
                    const rawString = maxVal.toString();
                    setAmount(rawString);
                    setDisplayAmount(formatAmount(rawString));
                    alert(`${t('receiptTotalFound')} ${formatAmount(rawString)}`);
                } else {
                    alert(t('receiptError'));
                }

            } catch (err) {
                console.error(err);
                setError(t('receiptError'));
            } finally {
                setIsScanningReceipt(false);
                e.target.value = '';
            }
        }
    };
    
    useEffect(() => {
        if (!isScanning) return;

        if (typeof Html5Qrcode === 'undefined') {
            setError("QR Scanner library not loaded.");
            setIsScanning(false);
            return;
        }

        const qrCodeScanner = new Html5Qrcode("qr-reader");

        const qrCodeSuccessCallback = (decodedText: string) => {
            const foundCard = cards.find(c => c.id === decodedText);
            if (foundCard) {
                handleSelectCard(foundCard);
                setIsScanning(false);
            } else {
                setError(t('cardNotFound'));
            }
        };
        
        const config = { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            disableFlip: true,
        };
        
        qrCodeScanner.start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
            .catch((err: any) => {
                console.error("QR Code scanner error:", err);
                setError(t('noCameraPermission'));
                setIsScanning(false);
            });
        
        return () => {
            if (qrCodeScanner && qrCodeScanner.isScanning) {
                qrCodeScanner.stop().catch((err: any) => console.warn(err));
            }
        };
    }, [isScanning, cards, t, handleSelectCard]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!selectedCardId) {
            setError(t('cardNotFound'));
            return;
        }

        const numericAmount = parseFloat(amount);
        const transaction: NewTransaction = {
            cardId: selectedCardId,
            amount: numericAmount,
        };
        onAddTransaction(transaction);

        // WhatsApp Logic
        const card = cards.find(c => c.id === selectedCardId);
        const customer = card ? customers.find(cust => cust.id === card.customerId) : undefined;

        if (card && customer) {
            let message = "";
            if (card.type === CardType.VIP) {
                message = `Halo ${customer.name}, ${t('waVipMsg')}`;
            } else {
                const newPoints = card.points + (numericAmount >= 75000 ? 1 : 0);
                message = `Halo ${customer.name}, ${t('waFidelityMsg')} ${newPoints} ${t('pointsMsg')}`;
            }

            const phone = customer.phone.countryCode.replace('+','') + customer.phone.number.replace(/^0+/, '');
            const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
            
            // Small delay to allow state update
            setTimeout(() => window.open(whatsappUrl, '_blank'), 500);
        }

        setSearchTerm('');
        setSelectedCardId('');
        setAmount('');
        setDisplayAmount('');
    };

    return (
        <div className="bg-gray-800/50 p-6 md:p-8 rounded-xl shadow-2xl shadow-black/20 max-w-2xl mx-auto mb-8">
            <h2 className="text-3xl font-bold mb-6 text-yellow-400 border-b-2 border-yellow-400/30 pb-2">{t('addTransaction')}</h2>
            
            {isScanning && (
                <div className="mb-4">
                    <div id="qr-reader" className="w-full rounded-lg overflow-hidden border-2 border-red-500 bg-gray-900"></div>
                    <p className="text-center text-sm text-gray-300 mt-2">{t('qrScanning')}</p>
                    <button onClick={handleStopScanning} className="w-full mt-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">{t('stopScanning')}</button>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className={`space-y-4 ${isScanning ? 'hidden' : 'block'}`}>
                
                {/* Search / Scan Card Row */}
                <div ref={wrapperRef} className="relative">
                    <label htmlFor="cardId" className="block text-sm font-medium text-gray-300 mb-1">{t('searchByNameOrCardId')}</label>
                    <div className="flex gap-2 h-12">
                        <input 
                            type="text" 
                            id="cardId" 
                            value={searchTerm} 
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setSelectedCardId('');
                                setShowResults(true);
                            }}
                            onFocus={() => setShowResults(true)}
                            autoComplete="off"
                            required 
                            placeholder="Enter name or ID"
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500 h-full"
                        />
                         <button 
                            type="button" 
                            onClick={handleStartScanning} 
                            className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white px-3 rounded-md transition-colors flex items-center justify-center gap-2 w-16 h-full"
                            title={t('scanCardPrompt')}
                        >
                            <CameraIcon className="h-6 w-6" />
                        </button>
                    </div>
                   
                    {showResults && filteredCards.length > 0 && (
                        <ul className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {filteredCards.map(card => (
                                <li 
                                    key={card.id}
                                    onClick={() => handleSelectCard(card)}
                                    className="px-4 py-2 text-white hover:bg-red-600 cursor-pointer"
                                >
                                    <span className="font-semibold">{customerMap.get(card.customerId)}</span>
                                    <span className="text-sm text-gray-300 block">({card.type}) - {card.id}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Amount / Scan Bill Row */}
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">{t('transactionAmount')}</label>
                    <div className="flex gap-2 h-12">
                        <input 
                            type="text" 
                            id="amount" 
                            value={displayAmount} 
                            onChange={handleAmountChange} 
                            required
                            placeholder="0"
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500 font-mono text-lg h-full"
                        />
                        <button 
                            type="button" 
                            onClick={handleReceiptScanClick}
                            className={`bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white px-3 rounded-md transition-colors flex items-center justify-center gap-2 w-16 h-full ${isScanningReceipt ? 'opacity-50 cursor-wait' : ''}`}
                            disabled={isScanningReceipt}
                            title={t('scanBillPrompt')}
                        >
                            <CameraIcon className="w-6 h-6" />
                        </button>
                        <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment" 
                            ref={receiptInputRef} 
                            onChange={handleReceiptFileChange} 
                            className="hidden" 
                        />
                    </div>
                    {isScanningReceipt && <p className="text-xs text-blue-400 mt-1">{t('processingReceipt')}</p>}
                </div>
                
                {error && <p className="text-sm text-red-400 text-center mt-2">{error}</p>}
                
                {/* Submit Row */}
                <div className="pt-2">
                    <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:bg-gray-500 flex items-center justify-center" disabled={!selectedCardId || !amount}>
                        {t('submit')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransactionForm;
