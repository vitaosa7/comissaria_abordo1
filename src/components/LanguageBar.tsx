import { Check, ChevronDown, Globe } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  ClientLanguage,
  CLIENT_TRANSLATIONS,
  LANGUAGE_OPTIONS,
} from '../i18n/clientTranslations';

interface LanguageBarProps {
  language: ClientLanguage;
  onChangeLanguage: (lang: ClientLanguage) => void;
}

export function LanguageBar({
  language,
  onChangeLanguage,
}: LanguageBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const t = CLIENT_TRANSLATIONS[language];
  const currentOption =
    LANGUAGE_OPTIONS.find((opt) => opt.id === language) ?? LANGUAGE_OPTIONS[0];

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (nextLang: ClientLanguage) => {
    onChangeLanguage(nextLang);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block mb-2.5 sm:mb-4">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="client-language-panel"
        onClick={() => setIsOpen((prev) => !prev)}
        className="px-2.5 py-1 bg-white border border-slate-200/90 hover:border-[#C9A256]/70 rounded-lg inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0B1320] transition cursor-pointer"
      >
        <Globe className="w-3 h-3 text-[#9B7732] shrink-0" />
        <span aria-hidden="true">{currentOption.flag}</span>
        <span>{currentOption.shortLabel}</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          id="client-language-panel"
          role="tablist"
          aria-label={t.languageBarLabel}
          className="absolute left-0 top-full mt-1.5 z-20 w-44 bg-white rounded-xl border border-slate-200 shadow-lg p-1 space-y-0.5"
        >
          {LANGUAGE_OPTIONS.map((opt) => {
            const active = language === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleSelect(opt.id)}
                className={`w-full px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition flex items-center justify-between gap-2 cursor-pointer ${
                  active
                    ? 'bg-[#0B1320] text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-[#0B1320]'
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span aria-hidden="true">{opt.flag}</span>
                  <span className="truncate">{opt.label}</span>
                </span>
                {active && <Check className="w-3 h-3 text-[#C9A256] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
