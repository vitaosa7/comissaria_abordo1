import { HangarSettings, MenuItem, WhatsAppOrder } from '../types/catering';

export const DEFAULT_MENU: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Coxinha de Frango com Catupiry',
    price: 14.0,
    category: 'Salgados',
    portion: '130g',
    desc: 'Massa dourada crocante com recheio cremoso preparada sob demanda.',
    iconKey: 'pastry',
    imageUrl: '/src/assets/images/menu_coxinha_1795145782617.jpg',
    available: true,
  },
  {
    id: 'item-2',
    name: 'Folhado de Peito de Peru',
    price: 15.5,
    category: 'Salgados',
    portion: '120g',
    desc: 'Salgado assado em massa folhada leve com queijo branco.',
    iconKey: 'pastry',
    imageUrl: '/src/assets/images/menu_folhado_1795145783026.jpg',
    available: true,
  },
  {
    id: 'item-10',
    name: 'Pão de Queijo Mineiro (6 un.)',
    price: 16.0,
    category: 'Salgados',
    portion: '180g',
    desc: 'Assado na hora com queijo Canastra curado e crosta levemente crocante.',
    iconKey: 'pastry',
    imageUrl: '/src/assets/images/menu_pao_queijo_1795150378683.jpg',
    available: true,
  },
  {
    id: 'item-11',
    name: 'Empada Artesanal de Palmito',
    price: 15.0,
    category: 'Salgados',
    portion: '130g',
    desc: 'Massa podre amanteigada com recheio cremoso de palmito pupunha.',
    iconKey: 'pastry',
    imageUrl: '/src/assets/images/menu_empada_palmito_1795150378937.jpg',
    available: true,
  },
  {
    id: 'item-3',
    name: 'Sanduíche Natural Executivo',
    price: 24.0,
    category: 'Lanches',
    portion: '210g',
    desc: 'Pão ciabatta artesanal, rosbife, rúcula selecionada e mostarda Dijon.',
    iconKey: 'sandwich',
    imageUrl: '/src/assets/images/menu_sanduiche_1795145783857.jpg',
    available: true,
  },
  {
    id: 'item-12',
    name: 'Croissant de Parma e Brie',
    price: 29.0,
    category: 'Lanches',
    portion: '160g',
    desc: 'Croissant francês amanteigado com presunto di Parma, queijo Brie e rúcula.',
    iconKey: 'sandwich',
    imageUrl: '/src/assets/images/menu_croissant_parma_1795150378691.jpg',
    available: true,
  },
  {
    id: 'item-13',
    name: 'Wrap Executivo de Frango',
    price: 26.0,
    category: 'Lanches',
    portion: '220g',
    desc: 'Tortilha leve com tiras de frango grelhado, cream cheese com ervas e folhas frescas.',
    iconKey: 'sandwich',
    imageUrl: '/src/assets/images/menu_wrap_frango_1795150378677.jpg',
    available: true,
  },
  {
    id: 'item-4',
    name: 'Bowl de Frutas da Estação',
    price: 22.0,
    category: 'Refeições',
    portion: '250g',
    desc: 'Seleção de frutas frescas cortadas na hora em embalagem térmica.',
    iconKey: 'meal',
    imageUrl: '/src/assets/images/menu_bowl_frutas_1795145783792.jpg',
    available: true,
  },
  {
    id: 'item-14',
    name: 'Salada Caesar Executiva',
    price: 34.0,
    category: 'Refeições',
    portion: '300g',
    desc: 'Alface romana crocante, peito de frango grelhado, lascas de parmesão e croutons.',
    iconKey: 'meal',
    imageUrl: '/src/assets/images/menu_salada_caesar_1795150378850.jpg',
    available: true,
  },
  {
    id: 'item-15',
    name: 'Tábua Executiva de Frios e Queijos',
    price: 58.0,
    category: 'Refeições',
    portion: '280g',
    desc: 'Seleção de queijos nobres, presunto Parma, uvas frescas, nozes e torradas.',
    iconKey: 'meal',
    imageUrl: '/src/assets/images/menu_tabua_frios_1795150379050.jpg',
    available: true,
  },
  {
    id: 'item-5',
    name: 'Torta de Limão Siciliano',
    price: 18.0,
    category: 'Sobremesas',
    portion: '110g',
    desc: 'Base crocante amanteigada com creme cítrico e merengue leve.',
    iconKey: 'dessert',
    imageUrl: '/src/assets/images/menu_torta_limao_1795145784077.jpg',
    available: true,
  },
  {
    id: 'item-16',
    name: 'Brownie Belga com Nozes',
    price: 19.5,
    category: 'Sobremesas',
    portion: '100g',
    desc: 'Chocolate meio amargo belga intenso com nozes tostadas e textura macia.',
    iconKey: 'dessert',
    imageUrl: '/src/assets/images/menu_brownie_belga_1795150378548.jpg',
    available: true,
  },
  {
    id: 'item-17',
    name: 'Cheesecake de Frutas Vermelhas',
    price: 22.0,
    category: 'Sobremesas',
    portion: '120g',
    desc: 'Creme suave de cream cheese sobre base crocante com calda artesanal de frutas.',
    iconKey: 'dessert',
    imageUrl: '/src/assets/images/menu_cheesecake_frutas_1795150378945.jpg',
    available: true,
  },
  {
    id: 'item-6',
    name: 'Refrigerante Lata',
    price: 8.5,
    category: 'Bebidas',
    portion: '350ml',
    desc: 'Coca-Cola, Guaraná Antarctica ou versões Zero em temperatura ideal.',
    iconKey: 'beverage',
    imageUrl: '/src/assets/images/menu_refrigerante_1795145786088.jpg',
    available: true,
  },
  {
    id: 'item-7',
    name: 'Café Expresso Gourmet',
    price: 9.0,
    category: 'Bebidas',
    portion: 'Garrafa / Dose',
    desc: 'Grãos especiais moídos na hora, acompanha petit-four.',
    iconKey: 'coffee',
    imageUrl: '/src/assets/images/menu_cafe_expresso_1795145785288.jpg',
    available: true,
  },
  {
    id: 'item-18',
    name: 'Garrafa Térmica de Café Especial',
    price: 36.0,
    category: 'Bebidas',
    portion: '1 Litro',
    desc: 'Café arábica recém-coado em garrafa térmica inox para toda a tripulação.',
    iconKey: 'coffee',
    imageUrl: '/src/assets/images/menu_cafe_garrafa_1795150379123.jpg',
    available: true,
  },
  {
    id: 'item-8',
    name: 'Água Mineral Sem Gás',
    price: 6.0,
    category: 'Bebidas',
    portion: '500ml',
    desc: 'Garrafa lacrada gelada ou em temperatura ambiente conforme solicitação.',
    iconKey: 'water',
    imageUrl: '/src/assets/images/menu_agua_mineral_1795145785746.jpg',
    available: true,
  },
  {
    id: 'item-9',
    name: 'Suco Natural de Laranja',
    price: 13.0,
    category: 'Bebidas',
    portion: '300ml',
    desc: '100% natural, espremido minutos antes do embarque.',
    iconKey: 'beverage',
    imageUrl: '/src/assets/images/menu_suco_laranja_1795145785668.jpg',
    available: true,
  },
];

export const EXPANDED_CATALOG_IDS = [
  'item-10',
  'item-11',
  'item-12',
  'item-13',
  'item-14',
  'item-15',
  'item-16',
  'item-17',
  'item-18',
];

export const BRAND_LOGO_SRC =
  '/src/assets/images/sa_aviacoes_logo_1795150378334.jpg';

export const HERO_AVIATION_SRC =
  '/src/assets/images/hero_aviation_hangar_1795149714700.jpg';

export const DEFAULT_SETTINGS: HangarSettings = {
  hangarName: 'Sá Aviações a Bordo',
  whatsappNumber: '5511999999999',
  greetingText: 'Solicitação de Catering a Bordo',
  deliveryLeadMinutes: 60,
  requirePin: false,
  managementPin: '1234',
};

export function formatCurrency(value: number): string {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function sanitizePhoneDigits(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function formatPhoneDisplay(raw: string): string {
  const digits = sanitizePhoneDigits(raw);
  if (digits.length === 13 && digits.startsWith('55')) {
    const ddd = digits.slice(2, 4);
    const p1 = digits.slice(4, 9);
    const p2 = digits.slice(9, 13);
    return `+55 (${ddd}) ${p1}-${p2}`;
  }
  if (digits.length === 12 && digits.startsWith('55')) {
    const ddd = digits.slice(2, 4);
    const p1 = digits.slice(4, 8);
    const p2 = digits.slice(8, 12);
    return `+55 (${ddd}) ${p1}-${p2}`;
  }
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return raw;
}

export function getDefaultDeliveryTime(leadMinutes = 60): string {
  const target = new Date(Date.now() + leadMinutes * 60 * 1000);
  const hours = String(target.getHours()).padStart(2, '0');
  const mins = String(target.getMinutes()).padStart(2, '0');
  return `${hours}:${mins}`;
}

export function generateOrderCode(): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `HB-${random}`;
}

export function buildWhatsAppMessage(
  order: Pick<
    WhatsAppOrder,
    | 'code'
    | 'aircraftTail'
    | 'requesterName'
    | 'deliveryTime'
    | 'hangarLocation'
    | 'notes'
    | 'paymentMethod'
    | 'items'
    | 'total'
  >,
  settings: HangarSettings
): string {
  const lines: string[] = [
    `*${settings.greetingText.toUpperCase()}*`,
    `*${settings.hangarName}*`,
    `Pedido: *#${order.code}*`,
    '',
    `*Dados do Voo e Entrega*`,
    `• Aeronave: *${order.aircraftTail}*`,
    `• Solicitante: ${order.requesterName}`,
    `• Horário Desejado: *${order.deliveryTime}*`,
    `• Local / Posição: ${order.hangarLocation || 'Não informado'}`,
    `• Faturamento: ${order.paymentMethod}`,
  ];

  if (order.notes.trim()) {
    lines.push(`• Observações: ${order.notes.trim()}`);
  }

  lines.push('', `*Itens Solicitados*`);
  order.items.forEach((item) => {
    lines.push(
      `• ${item.qty}x ${item.name} (${item.portion}) — ${formatCurrency(item.price * item.qty)}`
    );
  });

  lines.push('', `*Total Estimado: ${formatCurrency(order.total)}*`);
  lines.push('_Aguardamos confirmação da comissaria._');

  return lines.join('\n');
}

export function buildWhatsAppUrl(phoneDigits: string, message: string): string {
  const clean = sanitizePhoneDigits(phoneDigits);
  const withCountry = clean.length === 10 || clean.length === 11 ? `55${clean}` : clean;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}
