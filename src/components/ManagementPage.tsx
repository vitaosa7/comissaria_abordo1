import { User } from 'firebase/auth';
import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  Download,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  MessageCircle,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import { useState } from 'react';
import {
  BRAND_LOGO_SRC,
  HERO_AVIATION_SRC,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  formatCurrency,
  formatPhoneDisplay,
} from '../data/defaultMenu';
import {
  AdminRole,
  AdminUser,
  CurrentAdminRole,
  HangarSettings,
  MenuItem,
  OrderStatus,
  WhatsAppOrder,
} from '../types/catering';
import { AccessControlPanel } from './AccessControlPanel';
import { MenuManager, WhatsAppSettingsPanel } from './AdminPanel';
import { SalesReport } from './SalesReport';

type ManagementSection = 'orders' | 'reports' | 'menu' | 'access' | 'whatsapp';

interface ManagementPageProps {
  authReady: boolean;
  authUser: User | null;
  isManager: boolean;
  adminRole: CurrentAdminRole;
  admins: AdminUser[];
  authLoading: boolean;
  authError: string | null;
  onLogin: () => void;
  onLogout: () => void;
  onSwitchAccount: () => void;
  orders: WhatsAppOrder[];
  menuItems: MenuItem[];
  settings: HangarSettings;
  onBackToStorefront: () => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onSaveMenuItem: (item: Omit<MenuItem, 'id'>, editId?: string) => void;
  onToggleAvailability: (itemId: string) => void;
  onDeleteMenuItem: (itemId: string) => void;
  onResetDefaultMenu: () => void;
  onSaveSettings: (next: HangarSettings) => void;
  onAddAdmin: (data: {
    email: string;
    displayName: string;
    role: AdminRole;
  }) => Promise<void>;
  onUpdateAdminRole: (emailId: string, role: AdminRole) => Promise<void>;
  onRemoveAdmin: (emailId: string) => Promise<void>;
}

const STATUS_FILTERS: ('Todos' | OrderStatus)[] = [
  'Todos',
  'Enviado no WhatsApp',
  'Em Preparo',
  'Entregue na Aeronave',
];

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  'Enviado no WhatsApp',
  'Em Preparo',
  'Entregue na Aeronave',
];

export function ManagementPage({
  authReady,
  authUser,
  isManager,
  adminRole,
  admins,
  authLoading,
  authError,
  onLogin,
  onLogout,
  onSwitchAccount,
  orders,
  menuItems,
  settings,
  onBackToStorefront,
  onUpdateOrderStatus,
  onDeleteOrder,
  onSaveMenuItem,
  onToggleAvailability,
  onDeleteMenuItem,
  onResetDefaultMenu,
  onSaveSettings,
  onAddAdmin,
  onUpdateAdminRole,
  onRemoveAdmin,
}: ManagementPageProps) {
  const [section, setSection] = useState<ManagementSection>('orders');
  const [statusFilter, setStatusFilter] = useState<'Todos' | OrderStatus>('Todos');
  const [orderSearch, setOrderSearch] = useState('');

  // 1. Auth Loading Gate
  if (!authReady) {
    return (
      <div className="relative min-h-screen bg-[#0B1320] flex items-center justify-center p-4 overflow-hidden">
        <img
          src={HERO_AVIATION_SRC}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-7 shadow-2xl flex flex-col items-center text-center space-y-3">
          <Loader2 className="w-7 h-7 text-[#0B1320] animate-spin" />
          <p className="text-sm font-semibold text-[#0B1320]">
            Verificando acesso à gerência...
          </p>
        </div>
      </div>
    );
  }

  // 2. Manager Login Gate (unauthenticated visitors / clients)
  if (!authUser) {
    return (
      <div className="relative min-h-screen bg-[#0B1320] flex items-center justify-center p-4 overflow-hidden">
        <img
          src={HERO_AVIATION_SRC}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#0B1320]/70 via-[#0B1320]/80 to-[#0B1320]"
        />
        <div className="relative bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-7 shadow-2xl space-y-5">
          <div className="space-y-2">
            <img
              src={BRAND_LOGO_SRC}
              alt="Logo Sá Aviações a Bordo"
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl object-contain border border-[#C9A256]/40 bg-[#FAF9F6] mb-3"
            />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0B1320] text-[#C9A256] flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[#0B1320]">
                Login de Gerência
              </h1>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Área restrita à equipe administrativa. Clientes devem utilizar apenas o cardápio público para pedidos.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
              {authError}
            </div>
          )}

          <button
            type="button"
            onClick={onLogin}
            disabled={authLoading}
            className="w-full py-3 px-4 bg-[#0B1320] hover:bg-[#162238] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {authLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#C9A256]" />
            ) : (
              <LogIn className="w-4 h-4 text-[#C9A256]" />
            )}
            <span>{authLoading ? 'Conectando...' : 'Entrar com Google'}</span>
          </button>

          <button
            type="button"
            onClick={onBackToStorefront}
            className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-[#0B1320] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para o Cardápio Público</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Unauthorized Client Account Gate (signed in with non-manager Google account)
  if (!isManager) {
    return (
      <div className="relative min-h-screen bg-[#0B1320] flex items-center justify-center p-4 overflow-hidden">
        <img
          src={HERO_AVIATION_SRC}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#0B1320]/75 via-[#0B1320]/85 to-[#0B1320]"
        />
        <div className="relative bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-7 shadow-2xl space-y-5">
          <div className="space-y-2">
            <img
              src={BRAND_LOGO_SRC}
              alt="Logo Sá Aviações a Bordo"
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl object-contain border border-[#C9A256]/40 bg-[#FAF9F6] mb-3"
            />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[#0B1320]">
                Acesso Negado
              </h1>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              A conta{' '}
              <strong className="text-[#0B1320] break-all">
                {authUser.email || 'conectada'}
              </strong>{' '}
              não possui permissão de gerência para acessar pedidos, cardápio ou relatórios.
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={onSwitchAccount}
              disabled={authLoading}
              className="w-full py-2.5 px-4 bg-[#0B1320] hover:bg-[#162238] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#C9A256]" />
              <span>Entrar com Outra Conta</span>
            </button>

            <button
              type="button"
              onClick={onBackToStorefront}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-[#0B1320] text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para o Cardápio Público</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter orders
  const normalizedQuery = orderSearch.trim().toLowerCase();
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === 'Todos' || order.status === statusFilter;
    const matchesSearch =
      !normalizedQuery ||
      order.aircraftTail.toLowerCase().includes(normalizedQuery) ||
      order.requesterName.toLowerCase().includes(normalizedQuery) ||
      order.code.toLowerCase().includes(normalizedQuery) ||
      order.hangarLocation.toLowerCase().includes(normalizedQuery);
    return matchesStatus && matchesSearch;
  });

  // KPIs
  const sentCount = orders.filter((o) => o.status === 'Enviado no WhatsApp').length;
  const preparingCount = orders.filter((o) => o.status === 'Em Preparo').length;
  const deliveredCount = orders.filter(
    (o) => o.status === 'Entregue na Aeronave'
  ).length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  const exportCsv = () => {
    const header = [
      'Codigo',
      'Data',
      'Aeronave',
      'Solicitante',
      'Horario_Entrega',
      'Local',
      'Pagamento',
      'Status',
      'Total_BRL',
      'Itens',
    ].join(';');

    const rows = orders.map((o) => {
      const itemsSummary = o.items
        .map((i) => `${i.qty}x ${i.name}`)
        .join(' | ')
        .replace(/;/g, ',');
      return [
        o.code,
        new Date(o.createdAt).toLocaleString('pt-BR'),
        o.aircraftTail,
        o.requesterName.replace(/;/g, ','),
        o.deliveryTime,
        (o.hangarLocation || '').replace(/;/g, ','),
        o.paymentMethod,
        o.status,
        o.total.toFixed(2).replace('.', ','),
        itemsSummary,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedidos-comissaria-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const roleLabel =
    adminRole === 'owner'
      ? 'Administrador Principal'
      : adminRole === 'admin'
        ? 'Administrador Completo'
        : 'Operador / Gerente';

  const sectionTitle =
    section === 'orders'
      ? 'Painel de Pedidos'
      : section === 'reports'
        ? 'Relatório de Vendas'
        : section === 'menu'
          ? 'Cardápio & Preços'
          : section === 'access'
            ? 'Controle de Acesso'
            : 'WhatsApp & Configurações';

  const navItems: {
    id: ManagementSection;
    label: string;
    icon: typeof ClipboardList;
  }[] = [
    { id: 'orders', label: 'Painel de Pedidos', icon: ClipboardList },
    { id: 'reports', label: 'Relatório de Vendas', icon: BarChart3 },
    { id: 'menu', label: 'Cardápio & Preços', icon: UtensilsCrossed },
    { id: 'access', label: 'Controle de Acesso', icon: ShieldCheck },
    { id: 'whatsapp', label: 'WhatsApp & Config.', icon: Settings },
  ];

  const getStatusTextColor = (status: OrderStatus) => {
    if (status === 'Entregue na Aeronave') return 'text-emerald-700';
    if (status === 'Em Preparo') return 'text-amber-700';
    return 'text-slate-700';
  };

  return (
    <div className="min-h-screen bg-[#F3F5F8] flex flex-col lg:flex-row print:bg-white">
      {/* Left Sidebar Navigation */}
      <aside className="lg:w-64 bg-[#0B1320] text-slate-100 flex flex-col justify-between shrink-0 border-r border-white/10 print:hidden">
        <div>
          <div className="px-4 h-16 flex items-center gap-3 border-b border-white/10">
            <img
              src={BRAND_LOGO_SRC}
              alt="Logo Sá Aviações a Bordo"
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-lg object-contain border border-[#C9A256]/40 bg-[#FAF9F6] shrink-0"
            />
            <span className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
              Gerência · Sá Aviações
            </span>
          </div>

          <nav className="p-2.5 sm:p-3 flex lg:flex-col gap-1.5 lg:gap-1 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`min-h-[42px] flex items-center gap-2.5 sm:gap-3 px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition cursor-pointer ${
                    active
                      ? 'bg-white/10 text-white font-semibold border border-[#C9A256]/40'
                      : 'text-slate-300 border border-transparent hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-[#C9A256]' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block p-4 border-t border-white/10 space-y-2">
          <div className="px-2 space-y-0.5">
            <p className="text-[11px] text-slate-400 truncate">
              Conectado: <span className="text-slate-200">{authUser.email}</span>
            </p>
            <p className="text-[11px] text-[#C9A256] font-medium truncate">
              Perfil: {roleLabel}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              WhatsApp: {formatPhoneDisplay(settings.whatsappNumber)}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="w-full px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair da Gerência</span>
          </button>
          <button
            type="button"
            onClick={onBackToStorefront}
            className="w-full px-3 py-2.5 text-xs font-bold text-[#0B1320] bg-[#C9A256] hover:bg-[#B89042] rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Site de Pedidos</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Breadcrumb Bar */}
        <header className="bg-white border-b border-slate-200/90 px-4 sm:px-8 h-16 flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2 text-sm min-w-0">
            <span className="text-slate-500 whitespace-nowrap">Gerência</span>
            <span className="text-slate-400" aria-hidden="true">
              /
            </span>
            <h1 className="font-bold tracking-tight text-[#0B1320] truncate">
              {sectionTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {section === 'orders' && orders.length > 0 && (
              <button
                type="button"
                onClick={exportCsv}
                className="px-3.5 py-2 text-xs font-semibold text-[#0B1320] bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exportar CSV</span>
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="lg:hidden px-3 py-2 text-xs font-semibold text-[#0B1320] bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
            <button
              type="button"
              onClick={onBackToStorefront}
              className="lg:hidden px-3.5 py-2 text-xs font-semibold text-white bg-[#0B1320] hover:bg-[#162238] rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C9A256]" />
              <span>Loja</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {section === 'orders' && (
            <>
              {/* 4-column KPI Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5">
                  <span className="text-xs font-medium text-slate-500">
                    Enviados no WhatsApp
                  </span>
                  <p className="text-2xl font-bold font-mono tabular-nums text-[#0B1320] mt-1">
                    {sentCount}
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5">
                  <span className="text-xs font-medium text-slate-500">
                    Em Preparo
                  </span>
                  <p className="text-2xl font-bold font-mono tabular-nums text-amber-700 mt-1">
                    {preparingCount}
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5">
                  <span className="text-xs font-medium text-slate-500">
                    Entregues na Aeronave
                  </span>
                  <p className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
                    {deliveredCount}
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5">
                  <span className="text-xs font-medium text-slate-500">
                    Volume Faturado
                  </span>
                  <p className="text-2xl font-bold font-mono tabular-nums text-[#0B1320] mt-1">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 md:pb-0">
                  {STATUS_FILTERS.map((filter) => {
                    const active = statusFilter === filter;
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setStatusFilter(filter)}
                        className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition cursor-pointer ${
                          active
                            ? 'bg-[#0B1320] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {filter === 'Enviado no WhatsApp'
                          ? 'Enviados'
                          : filter === 'Entregue na Aeronave'
                            ? 'Entregues'
                            : filter}
                      </button>
                    );
                  })}
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Buscar prefixo, código ou solicitante..."
                    className="w-full min-h-[44px] sm:min-h-[38px] pl-10 pr-3 py-2 bg-[#F8F9FB] border border-slate-200/90 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white"
                  />
                </div>
              </div>

              {/* Orders List (Mobile Cards + Desktop Table) */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-10 sm:p-12 text-center">
                  <p className="text-sm font-semibold text-[#0B1320]">
                    Nenhum pedido encontrado nesta visão
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Os pedidos enviados pelo cardápio público aparecem automaticamente aqui para controle da comissaria.
                  </p>
                  <button
                    type="button"
                    onClick={onBackToStorefront}
                    className="mt-4 min-h-[42px] px-4 py-2 bg-[#0B1320] hover:bg-[#162238] text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Abrir Cardápio Público
                  </button>
                </div>
              ) : (
                <>
                  {/* Mobile Order Cards (< md) */}
                  <div className="md:hidden space-y-3">
                    {filteredOrders.map((order) => {
                      const waUrl = buildWhatsAppUrl(
                        settings.whatsappNumber,
                        buildWhatsAppMessage(order, settings)
                      );
                      return (
                        <article
                          key={order.id}
                          className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                                <span>#{order.code}</span>
                                <span aria-hidden="true">·</span>
                                <span className="tabular-nums">
                                  {order.deliveryTime}
                                </span>
                              </div>
                              <p className="text-base font-bold font-mono text-[#0B1320] mt-0.5">
                                {order.aircraftTail}
                              </p>
                              <p className="text-xs text-slate-600 truncate">
                                {order.requesterName} ·{' '}
                                {order.hangarLocation || 'Pátio não informado'}
                              </p>
                            </div>
                            <span className="text-base font-bold font-mono tabular-nums text-[#0B1320] shrink-0">
                              {formatCurrency(order.total)}
                            </span>
                          </div>

                          <div className="text-xs text-slate-700 space-y-1">
                            <p className="leading-relaxed">
                              {order.items
                                .map((i) => `${i.qty}x ${i.name}`)
                                .join(', ')}
                            </p>
                            <p className="text-slate-500">
                              Pagamento: {order.paymentMethod}
                            </p>
                            {order.notes && (
                              <p className="text-slate-500">
                                Obs: {order.notes}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                            <select
                              aria-label={`Status do pedido ${order.code}`}
                              value={order.status}
                              onChange={(e) =>
                                onUpdateOrderStatus(
                                  order.id,
                                  e.target.value as OrderStatus
                                )
                              }
                              className={`flex-1 min-h-[44px] px-3 py-2 bg-[#F8F9FB] border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B1320] ${getStatusTextColor(
                                order.status
                              )}`}
                            >
                              {ORDER_STATUS_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Reabrir no WhatsApp"
                              aria-label={`Reabrir pedido ${order.code} no WhatsApp`}
                              className="w-11 h-11 flex items-center justify-center text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition shrink-0"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                            <button
                              type="button"
                              onClick={() => onDeleteOrder(order.id)}
                              title="Excluir registro"
                              aria-label={`Excluir pedido ${order.code}`}
                              className="w-11 h-11 flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {/* Desktop Ledger Table (md+) */}
                  <div className="hidden md:block bg-white rounded-2xl border border-slate-200/90 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                            <th className="py-3 px-4 whitespace-nowrap">Pedido</th>
                            <th className="py-3 px-4 whitespace-nowrap">Aeronave</th>
                            <th className="py-3 px-4 whitespace-nowrap">Solicitante / Local</th>
                            <th className="py-3 px-4 whitespace-nowrap">Entrega</th>
                            <th className="py-3 px-4">Itens</th>
                            <th className="py-3 px-4 whitespace-nowrap text-right">
                              Total
                            </th>
                            <th className="py-3 px-4 whitespace-nowrap">Status</th>
                            <th className="py-3 px-4 whitespace-nowrap text-right">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {filteredOrders.map((order) => {
                            const waUrl = buildWhatsAppUrl(
                              settings.whatsappNumber,
                              buildWhatsAppMessage(order, settings)
                            );
                            return (
                              <tr
                                key={order.id}
                                className="hover:bg-slate-50/80 transition"
                              >
                                <td className="py-3.5 px-4 font-mono text-xs text-slate-600 whitespace-nowrap align-top">
                                  #{order.code}
                                </td>
                                <td className="py-3.5 px-4 font-mono font-bold text-[#0B1320] whitespace-nowrap align-top">
                                  {order.aircraftTail}
                                </td>
                                <td className="py-3.5 px-4 align-top">
                                  <p className="font-medium text-[#0B1320]">
                                    {order.requesterName}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {order.hangarLocation || 'Pátio não informado'} ·{' '}
                                    {order.paymentMethod}
                                  </p>
                                </td>
                                <td className="py-3.5 px-4 font-mono tabular-nums text-[#0B1320] whitespace-nowrap align-top">
                                  {order.deliveryTime}
                                </td>
                                <td className="py-3.5 px-4 text-xs text-slate-700 align-top max-w-xs">
                                  {order.items
                                    .map((i) => `${i.qty}x ${i.name}`)
                                    .join(', ')}
                                  {order.notes && (
                                    <p className="text-slate-500 mt-0.5">
                                      Obs: {order.notes}
                                    </p>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 font-mono tabular-nums font-semibold text-[#0B1320] text-right whitespace-nowrap align-top">
                                  {formatCurrency(order.total)}
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap align-top">
                                  <select
                                    aria-label={`Status do pedido ${order.code}`}
                                    value={order.status}
                                    onChange={(e) =>
                                      onUpdateOrderStatus(
                                        order.id,
                                        e.target.value as OrderStatus
                                      )
                                    }
                                    className={`px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B1320] ${getStatusTextColor(
                                      order.status
                                    )}`}
                                  >
                                    {ORDER_STATUS_OPTIONS.map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap text-right align-top">
                                  <div className="inline-flex items-center gap-1.5">
                                    <a
                                      href={waUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Reabrir no WhatsApp"
                                      className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                                    >
                                      <MessageCircle className="w-4 h-4" />
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => onDeleteOrder(order.id)}
                                      title="Excluir registro"
                                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {section === 'reports' && (
            <SalesReport
              orders={orders}
              settings={settings}
              onGoToOrders={() => setSection('orders')}
            />
          )}

          {section === 'menu' && (
            <MenuManager
              items={menuItems}
              onSaveItem={onSaveMenuItem}
              onToggleAvailability={onToggleAvailability}
              onDeleteItem={onDeleteMenuItem}
              onResetDefaultMenu={onResetDefaultMenu}
            />
          )}

          {section === 'access' && (
            <AccessControlPanel
              admins={admins}
              currentUserEmail={authUser.email || ''}
              currentRole={adminRole}
              onAddAdmin={onAddAdmin}
              onUpdateRole={onUpdateAdminRole}
              onRemoveAdmin={onRemoveAdmin}
            />
          )}

          {section === 'whatsapp' && (
            <div className="space-y-6">
              <WhatsAppSettingsPanel
                settings={settings}
                onSaveSettings={(next) =>
                  onSaveSettings({
                    ...settings,
                    ...next,
                  })
                }
              />

              {/* Authenticated Manager Session Info */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-xl space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Sessão e Equipe de Gerência
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    A rota <span className="font-mono text-slate-700">/gerencia</span> exige login Google autorizado. Gerencie novos administradores na aba Controle de Acesso.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs text-slate-500 block">
                      {roleLabel}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 truncate block">
                      {authUser.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSection('access')}
                      className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Equipe ADM</span>
                    </button>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Encerrar Sessão</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
