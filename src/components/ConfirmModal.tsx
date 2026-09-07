import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}) => {
  const { t } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || t('confirm')}
      maxWidth="sm"
    >
      <div className="text-center py-2">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
        </div>
        <p className="text-sm font-semibold text-slate-700 leading-relaxed mb-6">
          {message || t('confirmDelete')}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-md shadow-rose-600/30 transition-all"
          >
            {t('delete')}
          </button>
        </div>
      </div>
    </Modal>
  );
};
