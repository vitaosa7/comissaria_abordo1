import { Minus, Plus, Search, X } from 'lucide-react';
import { formatCurrency } from '../data/defaultMenu';
import {
  ClientLanguage,
  CLIENT_TRANSLATIONS,
  getLocalizedMenuItem,
} from '../i18n/clientTranslations';
import { CartItem, MenuCategory, MenuItem } from '../types/catering';
import { MenuItemImage } from './MenuItemImage';

interface CatalogSectionProps {
  language: ClientLanguage;
  items: MenuItem[];
  cart: CartItem[];
  selectedCategory: 'Todos' | MenuCategory;
  searchQuery: string;
  onSelectCategory: (cat: 'Todos' | MenuCategory) => void;
  onSearchChange: (q: string) => void;
  onAddToCart: (item: MenuItem) => void;
  onUpdateQty: (itemId: string, delta: number) => void;
}

const CATEGORIES: ('Todos' | MenuCategory)[] = [
  'Todos',
  'Salgados',
  'Lanches',
  'Refeições',
  'Sobremesas',
  'Bebidas',
];

export function CatalogSection({
  language,
  items,
  cart,
  selectedCategory,
  searchQuery,
  onSelectCategory,
  onSearchChange,
  onAddToCart,
  onUpdateQty,
}: CatalogSectionProps) {
  const t = CLIENT_TRANSLATIONS[language];
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredItems = items.filter((item) => {
    if (!item.available) return false;
    const localized = getLocalizedMenuItem(item, language);
    const localizedCat = t.categories[item.category];

    const matchesCategory =
      selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesSearch =
      !normalizedQuery ||
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.desc.toLowerCase().includes(normalizedQuery) ||
      item.category.toLowerCase().includes(normalizedQuery) ||
      localized.name.toLowerCase().includes(normalizedQuery) ||
      localized.desc.toLowerCase().includes(normalizedQuery) ||
      localizedCat.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesSearch;
  });

  const getCartQty = (id: string) => {
    return cart.find((c) => c.id === id)?.qty ?? 0;
  };

  return (
    <div className="space-y-3.5 sm:space-y-5">
      {/* Toolbar: Search + Category Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#0B1320]">
              {t.catalog.heading}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{t.catalog.subheading}</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              enterKeyHint="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.catalog.searchPlaceholder}
              className="w-full min-h-[44px] sm:min-h-[38px] pl-10 pr-9 py-2 bg-[#F8F9FB] border border-slate-200/90 rounded-xl text-base sm:text-sm text-[#0B1320] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label={t.catalog.clearFilters}
                onClick={() => onSearchChange('')}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#0B1320] absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-slate-100 pt-3 -mx-0.5 px-0.5">
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            const label =
              category === 'Todos'
                ? t.catalog.allCategory
                : t.categories[category];
            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory(category)}
                className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 active:scale-[0.97] transition cursor-pointer ${
                  active
                    ? 'bg-[#0B1320] text-white'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-[#0B1320]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center">
          <p className="text-sm font-medium text-slate-600">
            {t.catalog.emptyState}
          </p>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('Todos');
              onSearchChange('');
            }}
            className="mt-3 min-h-[42px] px-4 py-2 text-xs font-semibold text-[#0B1320] bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            {t.catalog.clearFilters}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
          {filteredItems.map((item) => {
            const qtyInCart = getCartQty(item.id);
            const localized = getLocalizedMenuItem(item, language);
            const localizedCat = t.categories[item.category];
            return (
              <article
                key={item.id}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#C9A256]/70 p-3 sm:p-4 flex items-center gap-3 sm:gap-3.5 transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-sm"
              >
                <MenuItemImage
                  src={item.imageUrl}
                  alt={localized.name}
                  iconKey={item.iconKey}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl shrink-0 border border-slate-100"
                  iconClassName="w-6 h-6"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between gap-1.5">
                  <div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span className="truncate font-medium text-[#9B7732]">
                        {localizedCat}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="font-mono tabular-nums shrink-0 text-slate-500">
                        {localized.portion}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-[15px] font-bold text-[#0B1320] leading-snug line-clamp-1 mt-0.5">
                      {localized.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-snug mt-0.5">
                      {localized.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-sm sm:text-[15px] font-bold font-mono tabular-nums text-[#0B1320]">
                      {formatCurrency(item.price)}
                    </span>

                    {qtyInCart > 0 ? (
                      <div className="flex items-center gap-0.5 bg-[#0B1320] text-white rounded-xl p-0.5">
                        <button
                          type="button"
                          aria-label={`${t.catalog.removeAriaPrefix} ${localized.name}`}
                          onClick={() => onUpdateQty(item.id, -1)}
                          className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-white/15 active:scale-95 transition cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold font-mono tabular-nums text-[#C9A256]">
                          {qtyInCart}
                        </span>
                        <button
                          type="button"
                          aria-label={`${t.catalog.addAriaPrefix} ${localized.name}`}
                          onClick={() => onUpdateQty(item.id, 1)}
                          className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-white/15 active:scale-95 transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAddToCart(item)}
                        className="min-h-[40px] sm:min-h-[34px] px-3.5 sm:px-3 py-1.5 bg-[#0B1320] hover:bg-[#162238] active:scale-[0.97] text-white text-xs font-semibold rounded-xl sm:rounded-lg transition flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#C9A256]" />
                        <span>{t.catalog.add}</span>
                      </button>
                    )}
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
