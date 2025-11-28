
import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import { useLocalization } from '../hooks/useLocalization';
import { api } from '../services/mockApi';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const { t } = useLocalization();
  const [syncUrl, setSyncUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
        setSyncUrl(api.getSyncUrl());
    }
  }, [isOpen]);

  const handleSave = () => {
    api.setSyncUrl(syncUrl);
    onSave();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings')}>
      <div className="space-y-6">
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('syncUrl')}</label>
            <input 
                type="text" 
                value={syncUrl} 
                onChange={(e) => setSyncUrl(e.target.value)}
                placeholder={t('syncUrlPlaceholder')}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500 text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">{t('cloudSyncDescription')}</p>
            <div className="mt-4 p-3 bg-green-900/30 border border-green-800 rounded text-xs text-green-200">
                 <strong>Configurazione Automatica:</strong> Il link al tuo database Google Drive è stato inserito automaticamente. Non serve fare altro!
            </div>
        </div>

        <div className="pt-4 border-t border-gray-700 flex justify-end">
             <button 
                onClick={handleSave}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
             >
                {t('saveSettings')}
             </button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
