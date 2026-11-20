import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BRAND_LOGO_SRC, formatCurrency } from '../data/defaultMenu';
import { HangarSettings, PaymentMethod, WhatsAppOrder } from '../types/catering';

export interface SalesAnalyticsSummary {
  totalRevenue: number;
  orderCount: number;
  totalItems: number;
  averageTicket: number;
  topProducts: { name: string; qty: number; revenue: number }[];
  byAircraft: { tail: string; orders: number; revenue: number }[];
  byPayment: { method: PaymentMethod; orders: number; revenue: number }[];
}

export interface GenerateSalesPdfParams {
  reportTitle: string;
  periodLabel: string;
  aircraftFilter: string;
  paymentFilter: string;
  settings: HangarSettings;
  analytics: SalesAnalyticsSummary;
  orders: WhatsAppOrder[];
}

type JsPdfWithAutoTable = jsPDF & {
  lastAutoTable?: { finalY: number };
};

function loadImageAsDataUrl(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 256;
        canvas.height = img.naturalHeight || 256;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function getNextY(doc: JsPdfWithAutoTable, fallbackY: number): number {
  return (doc.lastAutoTable?.finalY ?? fallbackY) + 8;
}

export async function generateSalesReportPdf({
  reportTitle,
  periodLabel,
  aircraftFilter,
  paymentFilter,
  settings,
  analytics,
  orders,
}: GenerateSalesPdfParams): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  }) as JsPdfWithAutoTable;

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const logoDataUrl = await loadImageAsDataUrl(BRAND_LOGO_SRC);

  let cursorY = 14;

  // Header block
  const textStartX = logoDataUrl ? margin + 22 : margin;
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'JPEG', margin, cursorY, 18, 18);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${settings.hangarName} · Fechamento Gerencial`, textStartX, cursorY + 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(reportTitle || 'Relatório de Vendas & Comissaria', textStartX, cursorY + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Período: ${periodLabel}   |   Aeronave: ${aircraftFilter}   |   Pgto: ${paymentFilter}`,
    textStartX,
    cursorY + 16
  );

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Emitido em ${new Date().toLocaleString('pt-BR')}`,
    pageWidth - margin,
    cursorY + 4,
    { align: 'right' }
  );

  cursorY += 22;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 6;

  // 4-Column KPI Summary Boxes
  const kpiGap = 3;
  const kpiW = (contentWidth - kpiGap * 3) / 4;
  const kpiH = 16;
  const kpis = [
    { label: 'Faturamento Total', value: formatCurrency(analytics.totalRevenue) },
    { label: 'Pedidos', value: String(analytics.orderCount) },
    { label: 'Unidades Vendidas', value: String(analytics.totalItems) },
    { label: 'Ticket Médio', value: formatCurrency(analytics.averageTicket) },
  ];

  kpis.forEach((kpi, idx) => {
    const x = margin + idx * (kpiW + kpiGap);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, cursorY, kpiW, kpiH, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 3, cursorY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.value, x + 3, cursorY + 12.2);
  });

  cursorY += kpiH + 8;

  // Section: Desempenho por Produto
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Desempenho por Produto', margin, cursorY);
  cursorY += 2.5;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [['Item', 'Qtd', 'Part.', 'Subtotal']],
    body: analytics.topProducts.map((p) => {
      const share =
        analytics.totalRevenue > 0
          ? ((p.revenue / analytics.totalRevenue) * 100).toFixed(1)
          : '0.0';
      return [p.name, String(p.qty), `${share}%`, formatCurrency(p.revenue)];
    }),
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: 255,
      fontSize: 8.5,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 2.5,
    },
    columnStyles: {
      1: { halign: 'right', cellWidth: 16 },
      2: { halign: 'right', cellWidth: 20 },
      3: { halign: 'right', cellWidth: 32 },
    },
  });

  cursorY = getNextY(doc, cursorY + 20);

  // Section: Faturamento por Aeronave
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Faturamento por Aeronave (Prefixo)', margin, cursorY);
  cursorY += 2.5;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [['Prefixo', 'Pedidos', 'Total']],
    body: analytics.byAircraft.map((a) => [
      a.tail,
      String(a.orders),
      formatCurrency(a.revenue),
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontSize: 8.5,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 2.5,
    },
    columnStyles: {
      1: { halign: 'right', cellWidth: 24 },
      2: { halign: 'right', cellWidth: 36 },
    },
  });

  cursorY = getNextY(doc, cursorY + 20);

  // Section: Resumo por Forma de Faturamento
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Resumo por Forma de Faturamento', margin, cursorY);
  cursorY += 2.5;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [['Modalidade', 'Pedidos', 'Total']],
    body: analytics.byPayment.map((p) => [
      p.method,
      String(p.orders),
      formatCurrency(p.revenue),
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontSize: 8.5,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 2.5,
    },
    columnStyles: {
      1: { halign: 'right', cellWidth: 24 },
      2: { halign: 'right', cellWidth: 36 },
    },
  });

  cursorY = getNextY(doc, cursorY + 20);

  // Section: Detalhamento de Pedidos
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Detalhamento de Pedidos (${orders.length})`, margin, cursorY);
  cursorY += 2.5;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [['Pedido', 'Data', 'Aeronave', 'Solicitante', 'Pgto', 'Status', 'Total']],
    body: orders.map((o) => [
      `#${o.code}`,
      new Date(o.createdAt).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      o.aircraftTail,
      o.requesterName,
      o.paymentMethod,
      o.status,
      formatCurrency(o.total),
    ]),
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 19 },
      1: { cellWidth: 24 },
      2: { cellWidth: 21 },
      6: { halign: 'right', cellWidth: 24 },
    },
  });

  // Footer pagination on all pages
  const totalPages = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(settings.hangarName, margin, pageHeight - 8);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 8, {
      align: 'right',
    });
  }

  const filename = `relatorio-vendas-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
