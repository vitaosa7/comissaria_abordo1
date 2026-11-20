import { MessageCircle, Plane, RotateCcw, Trash2 } from 'lucide-react';
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  formatCurrency,
} from '../data/defaultMenu';
import {
  ClientLanguage,
  CLIENT_TRANSLATIONS,
  getLocalizedDateLocale,
  getLocalizedMenuItem,
} from '../i18n/clientTranslations';
import {
  HangarSettings,
  MenuItem,
  OrderStatus,
  WhatsAppOrder,
} from '../types/catering';

interface OrdersHistoryProps {
  language: ClientLanguage;
  menuItems: MenuItem[];
  orders: WhatsAppOrder[];
  settings: HangarSettings;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onRepeatOrder: (order: WhatsAppOrder) => void;
  onDeleteOrder: (orderId: string) => void;
  onGoToCatalog: () => void;
}

const STATUS_OPTIONS: OrderStatus[] = [
  'Enviado no WhatsApp',
  'Em Preparo',
  'Entregue na Aeronave',
];

export function OrdersHistory({
  language,
  menuItems,
  orders,
  settings,
  onUpdateStatus,
  onRepeatOrder,
  onDeleteOrder,
  onGoToCatalog,
}: OrdersHistoryProps) {
  const t = CLIENT_TRANSLATIONS[language];
  const dateLocale = getLocalizedDateLocale(language);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const deliveredCount = orders.filter(
    (o) => o.status === 'Entregue na Aeronave'
  ).length;

  const resolveItemName = (id: string, fallbackName: string) => {
    const found = menuItems.find((m) => m.id === id);
    return found ? getLocalizedMenuItem(found, language).name : fallbackName;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#0B1320]">
            {t.orders.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.orders.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-3 md:flex items-center gap-3 sm:gap-6 text-sm border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
          <div>
            <span className="text-[11px] sm:text-xs text-slate-500 block">
              {t.orders.recordsLabel}
            </span>
            <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-[#0B1320]">
              {orders.length}
            </span>
          </div>
          <div>
            <span className="text-[11px] sm:text-xs text-slate-500 block">
              {t.orders.deliveredLabel}
            </span>
            <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-emerald-700">
              {deliveredCount}
            </span>
          </div>
          <div>
            <span className="text-[11px] sm:text-xs text-slate-500 block">
              {t.orders.totalVolumeLabel}
            </span>
            <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-[#0B1320] truncate block">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center">
          <div className="w-11 h-11 rounded-xl bg-[#0B1320] text-[#C9A256] flex items-center justify-center mx-auto mb-3">
            <Plane className="w-5 h-5" />
          </div>
          <p className="text-base font-semibold text-[#0B1320]">
            {t.orders.emptyTitle}
          </p>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {t.orders.emptySubtitle}
          </p>
          <button
            type="button"
            onClick={onGoToCatalog}
            className="mt-5 min-h-[44px] px-5 py-2.5 bg-[#0B1320] hover:bg-[#162238] active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition cursor-pointer"
          >
            {t.orders.goToMenuBtn}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {orders.map((order) => {
            const waUrl = buildWhatsAppUrl(
              settings.whatsappNumber,
              buildWhatsAppMessage(order, settings)
            );

            return (
              <article
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <span>#{order.code}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {new Date(order.createdAt).toLocaleString(dateLocale, {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold font-mono text-[#0B1320] mt-1">
                        {order.aircraftTail}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {order.requesterName} · {t.orders.deliveryAtPrefix}{' '}
                        <strong className="font-mono tabular-nums text-[#0B1320]">
                          {order.deliveryTime}
                        </strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteOrder(order.id)}
                      aria-label={`${t.orders.deleteOrderAriaPrefix} ${order.code}`}
                      className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="py-3 text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1 border-b border-slate-100">
                    <span>
                      {t.orders.locationLabel}{' '}
                      <strong className="text-[#0B1320]">
                        {order.hangarLocation || t.orders.locationMissing}
                      </strong>
                    </span>
                    <span>
                      {t.orders.paymentLabel}{' '}
                      <strong className="text-[#0B1320]">
                        {t.payments[order.paymentMethod]}
                      </strong>
                    </span>
                    {order.notes && (
                      <span className="w-full text-slate-500">
                        {t.orders.notesPrefix} {order.notes}
                      </span>
                    )}
                  </div>

                  {/* Items */}
                  <div className="py-3 space-y-1.5">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm gap-2"
                      >
                        <span className="text-slate-700 min-w-0 truncate">
                          <span className="font-mono font-semibold text-[#0B1320]">
                            {item.qty}x
                          </span>{' '}
                          {resolveItemName(item.id, item.name)}
                        </span>
                        <span className="font-mono tabular-nums text-slate-600 shrink-0">
                          {formatCurrency(item.price * item.qty)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      {t.orders.orderTotalLabel}
                    </span>
                    <span className="text-lg font-bold font-mono tabular-nums text-[#0B1320]">
                      {formatCurrency(order.total)}
                    </span>
                  </div>

                  {/* Status selector */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {STATUS_OPTIONS.map((statusOption) => {
                      const active = order.status === statusOption;
                      return (
                        <button
                          key={statusOption}
                          type="button"
                          onClick={() => onUpdateStatus(order.id, statusOption)}
                          className={`min-h-[40px] py-1.5 px-2 text-xs font-semibold rounded-xl border transition cursor-pointer truncate ${
                            active
                              ? 'bg-[#0B1320] text-white border-[#0B1320]'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {t.orders.statusShort[statusOption]}
                        </button>
                      );
                    })}
                  </div>

                  {/* Action Links */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onRepeatOrder(order)}
                      className="flex-1 min-h-[44px] py-2 px-3 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-[#0B1320] text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.orders.repeatOrderBtn}</span>
                    </button>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-h-[44px] py-2 px-3 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{t.orders.resendWhatsappBtn}</span>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
