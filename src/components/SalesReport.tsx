import {
  BarChart3,
  Check,
  Copy,
  Download,
  FileDown,
  Loader2,
  MessageCircle,
  Printer,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  BRAND_LOGO_SRC,
  buildWhatsAppUrl,
  formatCurrency,
} from '../data/defaultMenu';
import {
  HangarSettings,
  OrderStatus,
  PaymentMethod,
  WhatsAppOrder,
} from '../types/catering';
import { generateSalesReportPdf } from '../utils/pdfReport';

interface SalesReportProps {
  orders: WhatsAppOrder[];
  settings: HangarSettings;
  onGoToOrders: () => void;
}

type DatePreset = 'today' | '7days' | 'month' | 'all' | 'custom';
type StatusScope = 'all' | 'delivered' | 'active_and_delivered';

function toLocalDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function SalesReport({
  orders,
  settings,
  onGoToOrders,
}: SalesReportProps) {
  const todayStr = toLocalDateInput(new Date());

  const [preset, setPreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [aircraftFilter, setAircraftFilter] = useState('Todos');
  const [paymentFilter, setPaymentFilter] = useState<'Todas' | PaymentMethod>(
    'Todas'
  );
  const [statusScope, setStatusScope] = useState<StatusScope>('all');
  const [reportTitle, setReportTitle] = useState(
    'Relatório de Vendas & Comissaria'
  );
  const [copied, setCopied] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const aircraftOptions = useMemo(() => {
    const tails = Array.from(
      new Set(orders.map((o) => o.aircraftTail.trim()).filter(Boolean))
    ).sort();
    return ['Todos', ...tails];
  }, [orders]);

  const applyPreset = (nextPreset: DatePreset) => {
    setPreset(nextPreset);
    const now = new Date();
    const end = toLocalDateInput(now);

    if (nextPreset === 'today') {
      setStartDate(end);
      setEndDate(end);
    } else if (nextPreset === '7days') {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      setStartDate(toLocalDateInput(start));
      setEndDate(end);
    } else if (nextPreset === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(toLocalDateInput(start));
      setEndDate(end);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = toLocalDateInput(new Date(order.createdAt));

      if (preset !== 'all') {
        if (startDate && orderDate < startDate) return false;
        if (endDate && orderDate > endDate) return false;
      }

      if (
        aircraftFilter !== 'Todos' &&
        order.aircraftTail.trim() !== aircraftFilter
      ) {
        return false;
      }

      if (paymentFilter !== 'Todas' && order.paymentMethod !== paymentFilter) {
        return false;
      }

      if (
        statusScope === 'delivered' &&
        order.status !== 'Entregue na Aeronave'
      ) {
        return false;
      }

      if (
        statusScope === 'active_and_delivered' &&
        order.status !== 'Em Preparo' &&
        order.status !== 'Entregue na Aeronave'
      ) {
        return false;
      }

      return true;
    });
  }, [
    orders,
    preset,
    startDate,
    endDate,
    aircraftFilter,
    paymentFilter,
    statusScope,
  ]);

  const analytics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = filteredOrders.length;
    const totalItems = filteredOrders.reduce(
      (sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.qty, 0),
      0
    );
    const averageTicket = orderCount > 0 ? totalRevenue / orderCount : 0;

    // Product breakdown
    const productMap = new Map<
      string,
      { name: string; qty: number; revenue: number }
    >();
    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const current = productMap.get(item.name) || {
          name: item.name,
          qty: 0,
          revenue: 0,
        };
        current.qty += item.qty;
        current.revenue += item.price * item.qty;
        productMap.set(item.name, current);
      });
    });
    const topProducts = Array.from(productMap.values()).sort(
      (a, b) => b.revenue - a.revenue
    );

    // Aircraft breakdown
    const aircraftMap = new Map<
      string,
      { tail: string; orders: number; revenue: number }
    >();
    filteredOrders.forEach((order) => {
      const tail = order.aircraftTail || 'Não informado';
      const current = aircraftMap.get(tail) || {
        tail,
        orders: 0,
        revenue: 0,
      };
      current.orders += 1;
      current.revenue += order.total;
      aircraftMap.set(tail, current);
    });
    const byAircraft = Array.from(aircraftMap.values()).sort(
      (a, b) => b.revenue - a.revenue
    );

    // Payment method breakdown
    const paymentMap = new Map<
      PaymentMethod,
      { method: PaymentMethod; orders: number; revenue: number }
    >();
    filteredOrders.forEach((order) => {
      const current = paymentMap.get(order.paymentMethod) || {
        method: order.paymentMethod,
        orders: 0,
        revenue: 0,
      };
      current.orders += 1;
      current.revenue += order.total;
      paymentMap.set(order.paymentMethod, current);
    });
    const byPayment = Array.from(paymentMap.values()).sort(
      (a, b) => b.revenue - a.revenue
    );

    // Status breakdown
    const statusMap = new Map<OrderStatus, number>();
    filteredOrders.forEach((order) => {
      statusMap.set(order.status, (statusMap.get(order.status) || 0) + 1);
    });

    return {
      totalRevenue,
      orderCount,
      totalItems,
      averageTicket,
      topProducts,
      byAircraft,
      byPayment,
      statusMap,
    };
  }, [filteredOrders]);

  const periodLabel = useMemo(() => {
    if (preset === 'all') return 'Todo o período registrado';
    if (preset === 'today') return `Hoje (${startDate.split('-').reverse().join('/')})`;
    return `${startDate.split('-').reverse().join('/')} até ${endDate
      .split('-')
      .reverse()
      .join('/')}`;
  }, [preset, startDate, endDate]);

  const buildReportText = () => {
    const lines: string[] = [
      `*${reportTitle.toUpperCase()}*`,
      `*${settings.hangarName}*`,
      `Período: ${periodLabel}`,
      `Filtro Aeronave: ${aircraftFilter} | Faturamento: ${paymentFilter}`,
      '',
      `*Resumo Financeiro*`,
      `• Faturamento Total: *${formatCurrency(analytics.totalRevenue)}*`,
      `• Pedidos no Período: *${analytics.orderCount}* (${analytics.totalItems} itens)`,
      `• Ticket Médio: *${formatCurrency(analytics.averageTicket)}*`,
    ];

    if (analytics.byAircraft.length > 0) {
      lines.push('', `*Faturamento por Aeronave*`);
      analytics.byAircraft.forEach((a) => {
        lines.push(
          `• ${a.tail}: ${a.orders} ${a.orders === 1 ? 'pedido' : 'pedidos'} — ${formatCurrency(a.revenue)}`
        );
      });
    }

    if (analytics.byPayment.length > 0) {
      lines.push('', `*Formas de Faturamento*`);
      analytics.byPayment.forEach((p) => {
        lines.push(
          `• ${p.method}: ${p.orders} ${p.orders === 1 ? 'pedido' : 'pedidos'} — ${formatCurrency(p.revenue)}`
        );
      });
    }

    if (analytics.topProducts.length > 0) {
      lines.push('', `*Itens Vendidos*`);
      analytics.topProducts.slice(0, 10).forEach((p) => {
        lines.push(`• ${p.qty}x ${p.name} — ${formatCurrency(p.revenue)}`);
      });
    }

    return lines.join('\n');
  };

  const reportText = buildReportText();
  const waReportUrl = buildWhatsAppUrl(settings.whatsappNumber, reportText);

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleDownloadCsv = () => {
    const summaryRows = [
      ['Relatorio', reportTitle],
      ['Hangar', settings.hangarName],
      ['Periodo', periodLabel],
      ['Faturamento_Total_BRL', analytics.totalRevenue.toFixed(2).replace('.', ',')],
      ['Total_Pedidos', String(analytics.orderCount)],
      ['Total_Itens', String(analytics.totalItems)],
      ['Ticket_Medio_BRL', analytics.averageTicket.toFixed(2).replace('.', ',')],
      [],
      ['Codigo', 'Data', 'Aeronave', 'Solicitante', 'Horario', 'Pagamento', 'Status', 'Total_BRL', 'Itens'],
      ...filteredOrders.map((o) => [
        o.code,
        new Date(o.createdAt).toLocaleString('pt-BR'),
        o.aircraftTail,
        o.requesterName.replace(/;/g, ','),
        o.deliveryTime,
        o.paymentMethod,
        o.status,
        o.total.toFixed(2).replace('.', ','),
        o.items.map((i) => `${i.qty}x ${i.name}`).join(' | ').replace(/;/g, ','),
      ]),
    ];

    const csv = '\uFEFF' + summaryRows.map((r) => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-vendas-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    if (filteredOrders.length === 0 || generatingPdf) return;
    setGeneratingPdf(true);
    try {
      await generateSalesReportPdf({
        reportTitle,
        periodLabel,
        aircraftFilter,
        paymentFilter,
        settings,
        analytics,
        orders: filteredOrders,
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration & Filter Controls (Hidden when printing) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Gerador de Relatório de Vendas
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtre por período, prefixo da aeronave ou faturamento e gere o fechamento em PDF, CSV ou WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              disabled={filteredOrders.length === 0}
              className="min-h-[42px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-[#0B1320] text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Resumo</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={filteredOrders.length === 0}
              className="min-h-[42px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-[#0B1320] text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrintReport}
              disabled={filteredOrders.length === 0}
              className="min-h-[42px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-[#0B1320] text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={filteredOrders.length === 0 || generatingPdf}
              className="min-h-[42px] px-3.5 py-2 bg-[#0B1320] hover:bg-[#162238] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {generatingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A256]" />
              ) : (
                <FileDown className="w-3.5 h-3.5 text-[#C9A256]" />
              )}
              <span>{generatingPdf ? 'Gerando PDF...' : 'Baixar PDF'}</span>
            </button>

            <a
              href={filteredOrders.length > 0 ? waReportUrl : '#'}
              target={filteredOrders.length > 0 ? '_blank' : undefined}
              rel="noopener noreferrer"
              onClick={(e) => {
                if (filteredOrders.length === 0) e.preventDefault();
              }}
              className={`col-span-2 sm:col-span-1 min-h-[42px] px-3.5 py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 ${
                filteredOrders.length > 0
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Enviar no WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Presets & Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {(
              [
                { id: 'all', label: 'Todo o Período' },
                { id: 'today', label: 'Hoje' },
                { id: '7days', label: 'Últimos 7 dias' },
                { id: 'month', label: 'Este Mês' },
                { id: 'custom', label: 'Personalizado' },
              ] as { id: DatePreset; label: string }[]
            ).map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => applyPreset(btn.id)}
                className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition cursor-pointer ${
                  preset === btn.id
                    ? 'bg-[#0B1320] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Título do Relatório
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full min-h-[44px] sm:min-h-[38px] px-3 py-2 bg-[#F8F9FB] border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={startDate}
                disabled={preset === 'all'}
                onChange={(e) => {
                  setPreset('custom');
                  setStartDate(e.target.value);
                }}
                className="w-full min-h-[44px] sm:min-h-[38px] px-3 py-2 bg-[#F8F9FB] border border-slate-200 rounded-xl text-base sm:text-sm font-mono disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={endDate}
                disabled={preset === 'all'}
                onChange={(e) => {
                  setPreset('custom');
                  setEndDate(e.target.value);
                }}
                className="w-full min-h-[44px] sm:min-h-[38px] px-3 py-2 bg-[#F8F9FB] border border-slate-200 rounded-xl text-base sm:text-sm font-mono disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Aeronave (Prefixo)
              </label>
              <select
                value={aircraftFilter}
                onChange={(e) => setAircraftFilter(e.target.value)}
                className="w-full min-h-[44px] sm:min-h-[38px] px-3 py-2 bg-[#F8F9FB] border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white"
              >
                {aircraftOptions.map((tail) => (
                  <option key={tail} value={tail}>
                    {tail}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status / Faturamento
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <select
                  aria-label="Filtrar por status"
                  value={statusScope}
                  onChange={(e) => setStatusScope(e.target.value as StatusScope)}
                  className="w-full min-h-[44px] sm:min-h-[38px] px-2 py-2 bg-[#F8F9FB] border border-slate-200 rounded-xl text-sm sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white"
                >
                  <option value="all">Todos</option>
                  <option value="delivered">Entregues</option>
                  <option value="active_and_delivered">Prep/Entregue</option>
                </select>
                <select
                  aria-label="Filtrar por pagamento"
                  value={paymentFilter}
                  onChange={(e) =>
                    setPaymentFilter(e.target.value as 'Todas' | PaymentMethod)
                  }
                  className="w-full min-h-[44px] sm:min-h-[38px] px-2 py-2 bg-[#F8F9FB] border border-slate-200 rounded-xl text-sm sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white"
                >
                  <option value="Todas">Pgto: Todos</option>
                  <option value="Faturar na Aeronave">Faturar</option>
                  <option value="PIX">PIX</option>
                  <option value="Cartão na Entrega">Cartão</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Printable Report Header (Visible on screen & print) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <img
            src={BRAND_LOGO_SRC}
            alt="Logo Comissaria Hangar"
            referrerPolicy="no-referrer"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">
              {settings.hangarName} · Fechamento Gerencial
            </p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              {reportTitle}
            </h3>
          </div>
        </div>
        <div className="text-left sm:text-right text-xs text-slate-500 space-y-0.5">
          <p>
            Período: <strong className="text-slate-900">{periodLabel}</strong>
          </p>
          <p>
            Emitido em:{' '}
            <span className="font-mono tabular-nums text-slate-700">
              {new Date().toLocaleString('pt-BR')}
            </span>
          </p>
        </div>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <BarChart3 className="w-5 h-5" />
          </div>
          <p className="text-base font-semibold text-slate-800">
            Nenhuma venda encontrada para os filtros selecionados
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Assim que houver pedidos enviados pelo cardápio ou se você ampliar o período acima, o relatório detalhado será calculado automaticamente.
          </p>
          <button
            type="button"
            onClick={onGoToOrders}
            className="mt-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Ver Painel de Pedidos
          </button>
        </div>
      ) : (
        <>
          {/* 4-column Executive KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <span className="text-xs font-medium text-slate-500">
                Faturamento Total
              </span>
              <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {formatCurrency(analytics.totalRevenue)}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <span className="text-xs font-medium text-slate-500">
                Pedidos Computados
              </span>
              <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {analytics.orderCount}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <span className="text-xs font-medium text-slate-500">
                Unidades Vendidas
              </span>
              <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {analytics.totalItems}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <span className="text-xs font-medium text-slate-500">
                Ticket Médio
              </span>
              <p className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
                {formatCurrency(analytics.averageTicket)}
              </p>
            </div>
          </div>

          {/* Two-column Breakdown Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">
                  Desempenho por Produto
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500">
                      <th className="py-2.5 px-4">Item</th>
                      <th className="py-2.5 px-4 text-right">Qtd</th>
                      <th className="py-2.5 px-4 text-right">Part.</th>
                      <th className="py-2.5 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {analytics.topProducts.map((prod) => {
                      const share =
                        analytics.totalRevenue > 0
                          ? (prod.revenue / analytics.totalRevenue) * 100
                          : 0;
                      return (
                        <tr key={prod.name}>
                          <td className="py-2.5 px-4 font-medium text-slate-900">
                            {prod.name}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                            {prod.qty}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-500">
                            {share.toFixed(1)}%
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                            {formatCurrency(prod.revenue)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* By Aircraft & Payment Method */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900">
                    Faturamento por Aeronave (Prefixo)
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500">
                        <th className="py-2.5 px-4">Prefixo</th>
                        <th className="py-2.5 px-4 text-right">Pedidos</th>
                        <th className="py-2.5 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                      {analytics.byAircraft.map((row) => (
                        <tr key={row.tail}>
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                            {row.tail}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                            {row.orders}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                            {formatCurrency(row.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900">
                    Resumo por Forma de Faturamento
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500">
                        <th className="py-2.5 px-4">Modalidade</th>
                        <th className="py-2.5 px-4 text-right">Pedidos</th>
                        <th className="py-2.5 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                      {analytics.byPayment.map((row) => (
                        <tr key={row.method}>
                          <td className="py-2.5 px-4 font-medium text-slate-900">
                            {row.method}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                            {row.orders}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                            {formatCurrency(row.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Text Preview of Report */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 print:hidden">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Prévia do Relatório para WhatsApp
                </h4>
                <p className="text-xs text-slate-500">
                  Texto pronto para enviar à diretoria ou financeiro pelo WhatsApp.
                </p>
              </div>
            </div>

            <pre className="bg-[#0B1320] text-slate-100 rounded-xl p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto border border-slate-800">
              {reportText}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
