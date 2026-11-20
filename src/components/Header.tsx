import { ShoppingBag } from 'lucide-react';
import { BRAND_LOGO_SRC, formatCurrency } from '../data/defaultMenu';
import {
  ClientLanguage,
  CLIENT_TRANSLATIONS,
} from '../i18n/clientTranslations';

export type StorefrontTab = 'catalog' | 'orders';

interface HeaderProps {
  brandTitle: string;
  language: ClientLanguage;
  activeTab: StorefrontTab;
  onSelectTab: (tab: StorefrontTab) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
}

export function Header({
  brandTitle,
  language,
  activeTab,
  onSelectTab,
  cartCount,
  cartTotal,
  onOpenCart,
}: HeaderProps) {
  const t = CLIENT_TRANSLATIONS[language];

  const navItems: { id: StorefrontTab; label: string }[] = [
    { id: 'catalog', label: t.header.menuTab },
    { id: 'orders', label: t.header.ordersTab },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#0B1320]/95 backdrop-blur-md border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-8">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('catalog');
          }}
          className="flex items-center gap-2.5 min-h-[44px] text-sm sm:text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          <img
            src={BRAND_LOGO_SRC}
            alt="Logo Sá Aviações a Bordo"
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-lg object-contain border border-[#C9A256]/40 bg-[#FAF9F6] shrink-0"
          />
          <span className="hidden sm:inline tracking-tight">{brandTitle}</span>
        </a>

        <nav className="flex items-center gap-4 sm:gap-7 text-[13px] sm:text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`min-h-[44px] px-1 flex items-center whitespace-nowrap shrink-0 border-b-2 transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'text-white border-[#C9A256] font-semibold'
                    : 'text-slate-300 border-transparent hover:text-white hover:border-white/30'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            className="min-h-[40px] px-3 sm:px-4 py-1.5 sm:py-2 bg-[#C9A256] hover:bg-[#B89042] active:scale-[0.97] text-[#0B1320] text-xs sm:text-sm font-bold rounded-lg transition flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>
              {t.header.orderBtn} ({cartCount})
            </span>
            {cartCount > 0 && (
              <span className="hidden sm:inline font-mono tabular-nums text-[#0B1320]/80">
                · {formatCurrency(cartTotal)}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
