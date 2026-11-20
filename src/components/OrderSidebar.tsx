import { MessageCircle, Minus, Plane, Plus, Trash2 } from 'lucide-react';
import { FormEvent } from 'react';
import { formatCurrency, formatPhoneDisplay } from '../data/defaultMenu';
import {
  ClientLanguage,
  CLIENT_TRANSLATIONS,
  getLocalizedMenuItem,
} from '../i18n/clientTranslations';
import { CartItem, HangarSettings, MenuItem, PaymentMethod } from '../types/catering';

interface OrderSidebarProps {
  language: ClientLanguage;
  menuItems: MenuItem[];
  cart: CartItem[];
  settings: HangarSettings;
  aircraftTail: string;
  requesterName: string;
  deliveryTime: string;
  hangarLocation: string;
  notes: string;
  paymentMethod: PaymentMethod;
  onAircraftTailChange: (val: string) => void;
  onRequesterNameChange: (val: string) => void;
  onDeliveryTimeChange: (val: string) => void;
  onHangarLocationChange: (val: string) => void;
  onNotesChange: (val: string) => void;
  onPaymentMethodChange: (val: PaymentMethod) => void;
  onUpdateQty: (itemId: string, delta: number) => void;
  onClearCart: () => void;
  onSubmitOrder: (e: FormEvent) => void;
}

const PAYMENT_OPTIONS: PaymentMethod[] = [
  'Faturar na Aeronave',
  'PIX',
  'Cartão na Entrega',
];

export function OrderSidebar({
  language,
  menuItems,
  cart,
  settings,
  aircraftTail,
  requesterName,
  deliveryTime,
  hangarLocation,
  notes,
  paymentMethod,
  onAircraftTailChange,
  onRequesterNameChange,
  onDeliveryTimeChange,
  onHangarLocationChange,
  onNotesChange,
  onPaymentMethodChange,
  onUpdateQty,
  onClearCart,
  onSubmitOrder,
}: OrderSidebarProps) {
  const t = CLIENT_TRANSLATIONS[language];
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const resolveCartItemName = (cartItem: CartItem) => {
    const found = menuItems.find((m) => m.id === cartItem.id);
    if (found) {
      return getLocalizedMenuItem(found, language).name;
    }
    return cartItem.name;
  };

  return (
    <aside
      id="cart-section"
      className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden lg:sticky lg:top-24 scroll-mt-20"
    >
      {/* Flight Dispatch Sheet Header */}
      <div className="bg-[#0B1320] text-white px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <Plane className="w-4 h-4 text-[#C9A256] shrink-0" />
          <h2 className="text-sm sm:text-base font-bold tracking-tight">
            {t.sidebar.title}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="font-mono tabular-nums">
            {totalQty}{' '}
            {totalQty === 1 ? t.sidebar.itemSingular : t.sidebar.itemPlural}
          </span>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={onClearCart}
              title={t.sidebar.clearOrderTitle}
              aria-label={t.sidebar.clearOrderTitle}
              className="w-9 h-9 -my-2 -mr-1.5 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={onSubmitOrder} className="p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="aircraft-tail"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              {t.sidebar.aircraftTailLabel}
            </label>
            <input
              id="aircraft-tail"
              type="text"
              required
              minLength={2}
              maxLength={12}
              enterKeyHint="next"
              autoCapitalize="characters"
              value={aircraftTail}
              onChange={(e) => onAircraftTailChange(e.target.value.toUpperCase())}
              placeholder={t.sidebar.aircraftTailPlaceholder}
              className="w-full min-h-[44px] px-3 py-2 bg-[#F8F9FB] border border-slate-200/90 rounded-xl text-base sm:text-sm font-mono font-semibold uppercase text-[#0B1320] focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white transition"
            />
          </div>

          <div>
            <label
              htmlFor="delivery-time"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              {t.sidebar.deliveryTimeLabel}
            </label>
            <input
              id="delivery-time"
              type="time"
              required
              value={deliveryTime}
              onChange={(e) => onDeliveryTimeChange(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 bg-[#F8F9FB] border border-slate-200/90 rounded-xl text-base sm:text-sm font-mono tabular-nums text-[#0B1320] focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white transition"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="requester-name"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            {t.sidebar.requesterLabel}
          </label>
          <input
            id="requester-name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            enterKeyHint="next"
            value={requesterName}
            onChange={(e) => onRequesterNameChange(e.target.value)}
            placeholder={t.sidebar.requesterPlaceholder}
            className="w-full min-h-[44px] px-3 py-2 bg-[#F8F9FB] border border-slate-200/90 rounded-xl text-base sm:text-sm text-[#0B1320] focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          <div>
            <label
              htmlFor="hangar-location"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              {t.sidebar.hangarLocationLabel}
            </label>
            <input
              id="hangar-location"
              type="text"
              maxLength={120}
              enterKeyHint="next"
              value={hangarLocation}
              onChange={(e) => onHangarLocationChange(e.target.value)}
              placeholder={t.sidebar.hangarLocationPlaceholder}
              className="w-full min-h-[44px] px-3 py-2 bg-[#F8F9FB] border border-slate-200/90 rounded-xl text-base sm:text-sm text-[#0B1320] focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white transition"
            />
          </div>

          <div>
            <label
              htmlFor="payment-method"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              {t.sidebar.paymentMethodLabel}
            </label>
            <select
              id="payment-method"
              value={paymentMethod}
              onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
              className="w-full min-h-[44px] px-3 py-2 bg-[#F8F9FB] border border-slate-200/90 rounded-xl text-base sm:text-sm text-[#0B1320] focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white transition"
            >
              {PAYMENT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {t.payments[opt]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="order-notes"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            {t.sidebar.notesLabel}
          </label>
          <input
            id="order-notes"
            type="text"
            maxLength={500}
            enterKeyHint="done"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={t.sidebar.notesPlaceholder}
            className="w-full min-h-[44px] px-3 py-2 bg-[#F8F9FB] border border-slate-200/90 rounded-xl text-base sm:text-sm text-[#0B1320] focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white transition"
          />
        </div>

        {/* Cart Items List */}
        <div className="border-t border-b border-slate-100 py-3.5 space-y-2.5 max-h-60 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              {t.sidebar.emptyCart}
            </p>
          ) : (
            cart.map((item) => {
              const displayName = resolveCartItemName(item);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-1"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0B1320] truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-500 font-mono tabular-nums">
                      {formatCurrency(item.price * item.qty)}
                    </p>
                  </div>

                  <div className="flex items-center gap-0.5 border border-slate-200 rounded-xl px-1 py-0.5 shrink-0 bg-[#F8F9FB]">
                    <button
                      type="button"
                      aria-label={`${t.sidebar.decreaseQtyPrefix} ${displayName}`}
                      onClick={() => onUpdateQty(item.id, -1)}
                      className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-[#0B1320] hover:bg-white active:scale-95 transition cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-semibold font-mono tabular-nums text-[#0B1320]">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      aria-label={`${t.sidebar.increaseQtyPrefix} ${displayName}`}
                      onClick={() => onUpdateQty(item.id, 1)}
                      className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-[#0B1320] hover:bg-white active:scale-95 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Total & WhatsApp Destination Info */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
              {t.sidebar.estimatedTotal}
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-[#0B1320]">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            {t.sidebar.directWhatsappPrefix}{' '}
            <span className="font-mono text-slate-700">
              {formatPhoneDisplay(settings.whatsappNumber)}
            </span>
          </p>
        </div>

        <button
          type="submit"
          disabled={cart.length === 0}
          className="w-full min-h-[48px] py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] disabled:bg-slate-300 disabled:active:scale-100 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{t.sidebar.submitButton}</span>
        </button>
      </form>
    </aside>
  );
}
