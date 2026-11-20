import { Check, Pencil, Plus, RotateCcw, Trash2, Upload } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import {
  buildWhatsAppMessage,
  formatCurrency,
  formatPhoneDisplay,
  sanitizePhoneDigits,
} from '../data/defaultMenu';
import {
  HangarSettings,
  IconKey,
  MenuCategory,
  MenuItem,
} from '../types/catering';
import { MenuItemImage } from './MenuItemImage';

interface MenuManagerProps {
  items: MenuItem[];
  onSaveItem: (item: Omit<MenuItem, 'id'>, editId?: string) => void;
  onToggleAvailability: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onResetDefaultMenu: () => void;
}

const CATEGORIES: MenuCategory[] = [
  'Salgados',
  'Lanches',
  'Refeições',
  'Sobremesas',
  'Bebidas',
];

const ICON_OPTIONS: { value: IconKey; label: string }[] = [
  { value: 'pastry', label: 'Salgado / Folhado' },
  { value: 'sandwich', label: 'Sanduíche / Lanche' },
  { value: 'beverage', label: 'Suco / Refrigerante' },
  { value: 'coffee', label: 'Café / Bebida Quente' },
  { value: 'water', label: 'Água Mineral' },
  { value: 'meal', label: 'Refeição / Bowl' },
  { value: 'dessert', label: 'Doce / Sobremesa' },
];

export function MenuManager({
  items,
  onSaveItem,
  onToggleAvailability,
  onDeleteItem,
  onResetDefaultMenu,
}: MenuManagerProps) {
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<MenuCategory>('Salgados');
  const [portion, setPortion] = useState('');
  const [desc, setDesc] = useState('');
  const [iconKey, setIconKey] = useState<IconKey>('pastry');
  const [imageUrl, setImageUrl] = useState('');
  const [available, setAvailable] = useState(true);

  const resetForm = () => {
    setEditId(undefined);
    setName('');
    setPrice('');
    setCategory('Salgados');
    setPortion('');
    setDesc('');
    setIconKey('pastry');
    setImageUrl('');
    setAvailable(true);
  };

  const startEdit = (item: MenuItem) => {
    setEditId(item.id);
    setName(item.name);
    setPrice(String(item.price));
    setCategory(item.category);
    setPortion(item.portion);
    setDesc(item.desc);
    setIconKey(item.iconKey);
    setImageUrl(item.imageUrl || '');
    setAvailable(item.available);
  };

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 640;
        const scale = img.width > maxW ? maxW / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setImageUrl(canvas.toDataURL('image/jpeg', 0.82));
      };
      if (typeof reader.result === 'string') {
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const numericPrice = parseFloat(price);
    if (!name.trim() || isNaN(numericPrice) || numericPrice <= 0) return;

    onSaveItem(
      {
        name: name.trim(),
        price: numericPrice,
        category,
        portion: portion.trim() || 'Unidade',
        desc: desc.trim() || 'Preparado sob demanda para atendimento em hangar.',
        iconKey,
        imageUrl: imageUrl.trim() || undefined,
        available,
      },
      editId
    );
    resetForm();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6">
        <h2 className="text-lg font-bold tracking-tight text-[#0B1320] mb-4">
          {editId ? 'Editar Item do Cardápio' : 'Adicionar Novo Item'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome do Item *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Coxinha de Frango com Catupiry"
              className="w-full min-h-[44px] px-3.5 py-2 bg-[#F8F9FB] border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preço (R$) *
              </label>
              <input
                type="number"
                inputMode="decimal"
                required
                step="0.01"
                min="0.50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="14.50"
                className="w-full min-h-[44px] px-3.5 py-2 bg-[#F8F9FB] border border-slate-200 rounded-xl text-base sm:text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Porção / Volume
              </label>
              <input
                type="text"
                value={portion}
                onChange={(e) => setPortion(e.target.value)}
                placeholder="Ex: 130g / 350ml"
                className="w-full min-h-[44px] px-3.5 py-2 bg-[#F8F9FB] border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MenuCategory)}
                className="w-full min-h-[44px] px-3 py-2 bg-[#F8F9FB] border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ícone
              </label>
              <select
                value={iconKey}
                onChange={(e) => setIconKey(e.target.value as IconKey)}
                className="w-full min-h-[44px] px-3 py-2 bg-[#F8F9FB] border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição Breve
            </label>
            <textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Detalhes de preparo ou embalagem"
              className="w-full px-3.5 py-2 bg-[#F8F9FB] border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Imagem do Item (URL ou Arquivo)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... ou envie uma foto"
                className="flex-1 min-w-0 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
              <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
            </div>
            {imageUrl && (
              <div className="flex items-center gap-3 pt-1">
                <MenuItemImage
                  src={imageUrl}
                  alt={name || 'Prévia'}
                  iconKey={iconKey}
                  className="w-20 h-14 rounded-lg shrink-0"
                  iconClassName="w-5 h-5"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-xs text-rose-600 hover:underline cursor-pointer"
                >
                  Remover imagem
                </button>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              className="w-4 h-4 rounded accent-slate-900"
            />
            <span className="text-sm font-medium text-slate-700">
              Disponível no cardápio
            </span>
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-[#0B1320] hover:bg-[#162238] text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#C9A256]" />
              <span>{editId ? 'Atualizar Item' : 'Adicionar Item'}</span>
            </button>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition cursor-pointer"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Menu List */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold tracking-tight text-[#0B1320]">
              Itens Cadastrados ({items.length})
            </h3>
            <p className="text-xs text-slate-500">
              Alterações são refletidas imediatamente no cardápio de pedidos.
            </p>
          </div>

          <button
            type="button"
            onClick={onResetDefaultMenu}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
            >
              <div className="flex items-start gap-3.5">
                <MenuItemImage
                  src={item.imageUrl}
                  alt={item.name}
                  iconKey={item.iconKey}
                  className="w-16 h-12 rounded-xl shrink-0"
                  iconClassName="w-5 h-5"
                />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.category} · {item.portion} ·{' '}
                    <strong className="font-mono tabular-nums text-slate-800">
                      {formatCurrency(item.price)}
                    </strong>{' '}
                    ·{' '}
                    <span
                      className={
                        item.available
                          ? 'text-emerald-700 font-medium'
                          : 'text-rose-600 font-medium'
                      }
                    >
                      {item.available ? 'Ativo' : 'Indisponível'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleAvailability(item.id)}
                  className="min-h-[40px] px-3.5 py-1.5 text-xs font-semibold text-[#0B1320] bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  {item.available ? 'Pausar' : 'Ativar'}
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  aria-label={`Editar ${item.name}`}
                  className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-[#0B1320] bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  aria-label={`Remover ${item.name}`}
                  className="w-10 h-10 flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface WhatsAppSettingsPanelProps {
  settings: HangarSettings;
  onSaveSettings: (next: HangarSettings) => void;
}

export function WhatsAppSettingsPanel({
  settings,
  onSaveSettings,
}: WhatsAppSettingsPanelProps) {
  const [hangarName, setHangarName] = useState(settings.hangarName);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [greetingText, setGreetingText] = useState(settings.greetingText);
  const [leadMinutes, setLeadMinutes] = useState(
    String(settings.deliveryLeadMinutes)
  );
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    setHangarName(settings.hangarName);
    setWhatsappNumber(settings.whatsappNumber);
    setGreetingText(settings.greetingText);
    setLeadMinutes(String(settings.deliveryLeadMinutes));
  }, [settings]);

  const previewSettings: HangarSettings = {
    hangarName: hangarName.trim() || settings.hangarName,
    whatsappNumber: sanitizePhoneDigits(whatsappNumber) || settings.whatsappNumber,
    greetingText: greetingText.trim() || settings.greetingText,
    deliveryLeadMinutes: Math.max(15, parseInt(leadMinutes, 10) || 60),
  };

  const sampleMessage = buildWhatsAppMessage(
    {
      code: 'HB-4821',
      aircraftTail: 'PT-XYZ',
      requesterName: 'Cmte. Carlos Silva',
      deliveryTime: '07:30',
      hangarLocation: 'Hangar 2 · Pátio Sul',
      notes: 'Entregar ao comissário antes do embarque.',
      paymentMethod: 'Faturar na Aeronave',
      items: [
        {
          id: '1',
          name: 'Coxinha de Frango com Catupiry',
          price: 14,
          qty: 4,
          portion: '130g',
        },
        {
          id: '2',
          name: 'Café Expresso Gourmet',
          price: 9,
          qty: 2,
          portion: 'Garrafa / Dose',
        },
      ],
      total: 74,
    },
    previewSettings
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSaveSettings(previewSettings);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6">
        <h2 className="text-lg font-bold tracking-tight text-[#0B1320]">
          Configuração do WhatsApp Receptor
        </h2>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          Defina o número oficial da comissaria que receberá os pedidos da tripulação.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome do Hangar / Comissaria
            </label>
            <input
              type="text"
              required
              value={hangarName}
              onChange={(e) => setHangarName(e.target.value)}
              placeholder="Comissaria Hangar Executivo"
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#F8F9FB] border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Número do WhatsApp (com DDI 55 + DDD) *
            </label>
            <input
              type="tel"
              inputMode="tel"
              required
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="5511999999999"
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#F8F9FB] border border-slate-200 rounded-xl text-base sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white"
            />
            <p className="text-xs text-slate-500 mt-1">
              Formato exibido:{' '}
              <span className="font-mono font-medium text-slate-700">
                {formatPhoneDisplay(whatsappNumber)}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Título da Mensagem no WhatsApp
            </label>
            <input
              type="text"
              required
              value={greetingText}
              onChange={(e) => setGreetingText(e.target.value)}
              placeholder="Solicitação de Catering a Bordo"
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#F8F9FB] border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Antecedência Padrão Sugerida (minutos)
            </label>
            <input
              type="number"
              inputMode="numeric"
              min="15"
              max="720"
              step="15"
              value={leadMinutes}
              onChange={(e) => setLeadMinutes(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#F8F9FB] border border-slate-200 rounded-xl text-base sm:text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#0B1320] hover:bg-[#162238] text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {savedFeedback ? (
              <>
                <Check className="w-4 h-4 text-[#C9A256]" />
                <span>Configurações Salvas</span>
              </>
            ) : (
              <span>Salvar Configurações de WhatsApp</span>
            )}
          </button>
        </form>
      </div>

      {/* Live Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-3">
        <div>
          <h3 className="text-base font-bold tracking-tight text-[#0B1320]">
            Modelo da Mensagem Gerada
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualização exata do texto que chegará no WhatsApp configurado.
          </p>
        </div>

        <pre className="bg-[#0B1320] text-slate-100 rounded-xl p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap border border-slate-800">
          {sampleMessage}
        </pre>
      </div>
    </div>
  );
}
