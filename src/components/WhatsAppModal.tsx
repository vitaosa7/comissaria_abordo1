import { Check, Copy, ExternalLink, MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import {
  BRAND_LOGO_SRC,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  formatCurrency,
  formatPhoneDisplay,
} from '../data/defaultMenu';
import {
  ClientLanguage,
  CLIENT_TRANSLATIONS,
} from '../i18n/clientTranslations';
import { HangarSettings, WhatsAppOrder } from '../types/catering';

interface WhatsAppModalProps {
  language: ClientLanguage;
  order: WhatsAppOrder | null;
  settings: HangarSettings;
  canEditPhone?: boolean;
  onUpdatePhone: (phone: string) => void;
  onClose: () => void;
}

export function WhatsAppModal({
  language,
  order,
  settings,
  canEditPhone = false,
  onUpdatePhone,
  onClose,
}: WhatsAppModalProps) {
  const [copied, setCopied] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(settings.whatsappNumber);

  if (!order) return null;

  const t = CLIENT_TRANSLATIONS[language];
  const message = buildWhatsAppMessage(order, settings);
  const waUrl = buildWhatsAppUrl(settings.whatsappNumber, message);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleSavePhone = () => {
    if (phoneInput.replace(/\D/g, '').length >= 10) {
      onUpdatePhone(phoneInput);
      setEditingPhone(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0B1320]/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wa-modal-title"
    >
      <div className="bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 max-w-lg w-full max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl">
        {/* Mobile bottom-sheet drag indicator */}
        <div className="sm:hidden bg-[#0B1320] pt-2.5 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-white/25" aria-hidden="true" />
        </div>

        {/* Midnight Navy Aviation Header */}
        <div className="bg-[#0B1320] text-white px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={BRAND_LOGO_SRC}
              alt="Logo Comissaria Hangar"
              referrerPolicy="no-referrer"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-[#C9A256]/50 bg-white shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-mono font-medium text-[#C9A256] truncate">
                {t.modal.orderPrefix} #{order.code} · {t.modal.aircraftPrefix}{' '}
                {order.aircraftTail}
              </p>
              <h3
                id="wa-modal-title"
                className="text-base sm:text-lg font-bold text-white mt-0.5 truncate"
              >
                {t.modal.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.modal.closeAria}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Recipient WhatsApp Phone */}
          <div className="bg-[#F8F9FB] rounded-xl border border-slate-200/90 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-xs text-slate-500 block">
                  {t.modal.whatsappLabel}
                </span>
                <span className="text-sm font-mono font-semibold text-[#0B1320]">
                  {formatPhoneDisplay(settings.whatsappNumber)}
                </span>
              </div>
              {canEditPhone && (
                <button
                  type="button"
                  onClick={() => {
                    setPhoneInput(settings.whatsappNumber);
                    setEditingPhone(!editingPhone);
                  }}
                  className="min-h-[36px] px-2 text-xs font-semibold text-[#0B1320] hover:text-[#9B7732] underline underline-offset-2 cursor-pointer"
                >
                  {editingPhone ? t.modal.cancel : t.modal.changeNumber}
                </button>
              )}
            </div>

            {canEditPhone && editingPhone && (
              <div className="mt-3 flex gap-2">
                <input
                  type="tel"
                  inputMode="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="5511999999999"
                  className="flex-1 min-h-[42px] px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-base sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0B1320]"
                />
                <button
                  type="button"
                  onClick={handleSavePhone}
                  className="min-h-[42px] px-4 py-1.5 bg-[#0B1320] text-white text-xs font-semibold rounded-xl hover:bg-[#162238] cursor-pointer"
                >
                  {t.modal.apply}
                </button>
              </div>
            )}
          </div>

          {/* Formatted Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700">
                {t.modal.messagePreviewLabel}
              </span>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {t.modal.totalPrefix} {formatCurrency(order.total)}
              </span>
            </div>
            <pre className="bg-[#0B1320] text-slate-100 rounded-xl p-3.5 sm:p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-56 sm:max-h-64 overflow-y-auto border border-slate-800">
              {message}
            </pre>
          </div>
        </div>

        {/* Pinned Bottom Actions */}
        <div className="px-4 sm:px-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-6 border-t border-slate-100 bg-white flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="sm:w-44 min-h-[46px] py-3 px-4 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-[#0B1320] font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-700" />
                <span>{t.modal.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{t.modal.copyText}</span>
              </>
            )}
          </button>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-h-[48px] py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t.modal.openWhatsapp}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      </div>
    </div>
  );
}
