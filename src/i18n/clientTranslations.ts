import {
  MenuCategory,
  MenuItem,
  OrderStatus,
  PaymentMethod,
} from '../types/catering';

export type ClientLanguage = 'pt-BR' | 'pt-PT' | 'en-US' | 'es';

export interface LanguageOption {
  id: ClientLanguage;
  label: string;
  shortLabel: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { id: 'pt-BR', label: 'Português (BR)', shortLabel: 'PT-BR', flag: '🇧🇷' },
  { id: 'pt-PT', label: 'Português (PT)', shortLabel: 'PT-PT', flag: '🇵🇹' },
  { id: 'en-US', label: 'English (US)', shortLabel: 'EN-US', flag: '🇺🇸' },
  { id: 'es', label: 'Español', shortLabel: 'ES', flag: '🇪🇸' },
];

export interface ClientTranslationBundle {
  languageBarLabel: string;
  header: {
    menuTab: string;
    ordersTab: string;
    orderBtn: string;
    mobileCartCta: string;
  };
  hero: {
    subtitleSuffix: string;
    title: string;
    whatsappLabel: string;
  };
  footer: {
    restrictedAccess: string;
  };
  catalog: {
    heading: string;
    subheading: string;
    searchPlaceholder: string;
    allCategory: string;
    emptyState: string;
    clearFilters: string;
    add: string;
    addAriaPrefix: string;
    removeAriaPrefix: string;
  };
  sidebar: {
    title: string;
    itemSingular: string;
    itemPlural: string;
    clearOrderTitle: string;
    aircraftTailLabel: string;
    aircraftTailPlaceholder: string;
    deliveryTimeLabel: string;
    requesterLabel: string;
    requesterPlaceholder: string;
    hangarLocationLabel: string;
    hangarLocationPlaceholder: string;
    paymentMethodLabel: string;
    notesLabel: string;
    notesPlaceholder: string;
    emptyCart: string;
    estimatedTotal: string;
    directWhatsappPrefix: string;
    submitButton: string;
    decreaseQtyPrefix: string;
    increaseQtyPrefix: string;
  };
  orders: {
    title: string;
    subtitle: string;
    recordsLabel: string;
    deliveredLabel: string;
    totalVolumeLabel: string;
    emptyTitle: string;
    emptySubtitle: string;
    goToMenuBtn: string;
    deliveryAtPrefix: string;
    locationLabel: string;
    locationMissing: string;
    paymentLabel: string;
    notesPrefix: string;
    orderTotalLabel: string;
    repeatOrderBtn: string;
    resendWhatsappBtn: string;
    deleteOrderAriaPrefix: string;
    statusShort: Record<OrderStatus, string>;
  };
  modal: {
    orderPrefix: string;
    aircraftPrefix: string;
    title: string;
    closeAria: string;
    whatsappLabel: string;
    cancel: string;
    changeNumber: string;
    apply: string;
    messagePreviewLabel: string;
    totalPrefix: string;
    copyText: string;
    copied: string;
    openWhatsapp: string;
  };
  toasts: {
    addedToOrderSuffix: string;
    clearedCart: string;
    statusUpdatedPrefix: string;
    orderRepeatedPrefix: string;
    orderRepeatedSuffix: string;
    orderDeleted: string;
  };
  categories: Record<MenuCategory, string>;
  payments: Record<PaymentMethod, string>;
}

export const CLIENT_TRANSLATIONS: Record<
  ClientLanguage,
  ClientTranslationBundle
> = {
  'pt-BR': {
    languageBarLabel: 'Idioma',
    header: {
      menuTab: 'Cardápio',
      ordersTab: 'Meus Pedidos',
      orderBtn: 'Pedido',
      mobileCartCta: 'Concluir Pedido',
    },
    hero: {
      subtitleSuffix: 'Pernoite e Pré-Voo',
      title: 'Serviços de Bordo',
      whatsappLabel: 'WhatsApp da Comissaria',
    },
    footer: {
      restrictedAccess: 'Acesso Restrito · Gerência',
    },
    catalog: {
      heading: 'Cardápio',
      subheading: 'Selecione os itens para envio via WhatsApp.',
      searchPlaceholder: 'Buscar item...',
      allCategory: 'Todos',
      emptyState: 'Nenhum item encontrado para os filtros aplicados.',
      clearFilters: 'Limpar filtros',
      add: 'Adicionar',
      addAriaPrefix: 'Adicionar uma unidade de',
      removeAriaPrefix: 'Remover uma unidade de',
    },
    sidebar: {
      title: 'Solicitação de Bordo',
      itemSingular: 'item',
      itemPlural: 'itens',
      clearOrderTitle: 'Limpar pedido',
      aircraftTailLabel: 'Prefixo Aeronave *',
      aircraftTailPlaceholder: 'Ex: PT-XYZ',
      deliveryTimeLabel: 'Horário Entrega *',
      requesterLabel: 'Comandante / Solicitante *',
      requesterPlaceholder: 'Ex: Cmte. Carlos Silva',
      hangarLocationLabel: 'Hangar / Posição no Pátio',
      hangarLocationPlaceholder: 'Ex: Hangar 2 · Pátio Sul',
      paymentMethodLabel: 'Forma de Faturamento',
      notesLabel: 'Observações de Bordo',
      notesPlaceholder: 'Ex: Entregar ao comissário, gelo extra',
      emptyCart:
        'Nenhum item selecionado. Adicione produtos do cardápio ao lado.',
      estimatedTotal: 'Total Estimado',
      directWhatsappPrefix: 'Envio direto para WhatsApp:',
      submitButton: 'Enviar Pedido via WhatsApp',
      decreaseQtyPrefix: 'Diminuir quantidade de',
      increaseQtyPrefix: 'Aumentar quantidade de',
    },
    orders: {
      title: 'Histórico de Pedidos via WhatsApp',
      subtitle:
        'Consulte solicitações anteriores, atualize o status de entrega ou reenvie pelo WhatsApp.',
      recordsLabel: 'Registros',
      deliveredLabel: 'Entregues',
      totalVolumeLabel: 'Volume Total',
      emptyTitle: 'Nenhum pedido registrado ainda',
      emptySubtitle:
        'Monte uma solicitação no cardápio e envie para o WhatsApp da comissaria para acompanhá-la aqui.',
      goToMenuBtn: 'Ir para o Cardápio',
      deliveryAtPrefix: 'Entrega às',
      locationLabel: 'Local:',
      locationMissing: 'Não informado',
      paymentLabel: 'Pagamento:',
      notesPrefix: 'Obs:',
      orderTotalLabel: 'Total do Pedido',
      repeatOrderBtn: 'Repetir Pedido',
      resendWhatsappBtn: 'Reenviar WhatsApp',
      deleteOrderAriaPrefix: 'Excluir pedido',
      statusShort: {
        'Enviado no WhatsApp': 'Enviado',
        'Em Preparo': 'Em Preparo',
        'Entregue na Aeronave': 'Entregue',
      },
    },
    modal: {
      orderPrefix: 'Pedido',
      aircraftPrefix: 'Aeronave',
      title: 'Enviar Pedido para o WhatsApp',
      closeAria: 'Fechar janela',
      whatsappLabel: 'WhatsApp da Comissaria',
      cancel: 'Cancelar',
      changeNumber: 'Trocar número',
      apply: 'Aplicar',
      messagePreviewLabel: 'Prévia da mensagem formatada',
      totalPrefix: 'Total:',
      copyText: 'Copiar Texto',
      copied: 'Copiado',
      openWhatsapp: 'Abrir no WhatsApp',
    },
    toasts: {
      addedToOrderSuffix: 'adicionado ao pedido.',
      clearedCart: 'Itens removidos da solicitação.',
      statusUpdatedPrefix: 'Status atualizado para',
      orderRepeatedPrefix: 'Pedido',
      orderRepeatedSuffix: 'carregado no carrinho.',
      orderDeleted: 'Registro de pedido removido.',
    },
    categories: {
      Salgados: 'Salgados',
      Lanches: 'Lanches',
      Refeições: 'Refeições',
      Sobremesas: 'Sobremesas',
      Bebidas: 'Bebidas',
    },
    payments: {
      'Faturar na Aeronave': 'Faturar na Aeronave',
      PIX: 'PIX',
      'Cartão na Entrega': 'Cartão na Entrega',
    },
  },

  'pt-PT': {
    languageBarLabel: 'Idioma',
    header: {
      menuTab: 'Ementa',
      ordersTab: 'Os Meus Pedidos',
      orderBtn: 'Pedido',
      mobileCartCta: 'Concluir Pedido',
    },
    hero: {
      subtitleSuffix: 'Pernoita e Pré-Voo',
      title: 'Serviços de Bordo',
      whatsappLabel: 'WhatsApp da Comissaria',
    },
    footer: {
      restrictedAccess: 'Acesso Restrito · Gerência',
    },
    catalog: {
      heading: 'Ementa',
      subheading: 'Selecione os artigos para envio por WhatsApp.',
      searchPlaceholder: 'Procurar artigo...',
      allCategory: 'Todos',
      emptyState: 'Nenhum artigo encontrado para os filtros aplicados.',
      clearFilters: 'Limpar filtros',
      add: 'Adicionar',
      addAriaPrefix: 'Adicionar uma unidade de',
      removeAriaPrefix: 'Remover uma unidade de',
    },
    sidebar: {
      title: 'Pedido de Bordo',
      itemSingular: 'artigo',
      itemPlural: 'artigos',
      clearOrderTitle: 'Limpar pedido',
      aircraftTailLabel: 'Matrícula Aeronave *',
      aircraftTailPlaceholder: 'Ex: CS-XYZ',
      deliveryTimeLabel: 'Hora de Entrega *',
      requesterLabel: 'Comandante / Requerente *',
      requesterPlaceholder: 'Ex: Cmte. Carlos Silva',
      hangarLocationLabel: 'Hangar / Posição na Placa',
      hangarLocationPlaceholder: 'Ex: Hangar 2 · Placa Sul',
      paymentMethodLabel: 'Modo de Faturação',
      notesLabel: 'Observações de Bordo',
      notesPlaceholder: 'Ex: Entregar ao comissário, gelo extra',
      emptyCart:
        'Nenhum artigo selecionado. Adicione produtos da ementa ao lado.',
      estimatedTotal: 'Total Estimado',
      directWhatsappPrefix: 'Envio direto para WhatsApp:',
      submitButton: 'Enviar Pedido por WhatsApp',
      decreaseQtyPrefix: 'Diminuir quantidade de',
      increaseQtyPrefix: 'Aumentar quantidade de',
    },
    orders: {
      title: 'Histórico de Pedidos por WhatsApp',
      subtitle:
        'Consulte pedidos anteriores, atualize o estado de entrega ou reenvie por WhatsApp.',
      recordsLabel: 'Registos',
      deliveredLabel: 'Entregues',
      totalVolumeLabel: 'Volume Total',
      emptyTitle: 'Ainda sem pedidos registados',
      emptySubtitle:
        'Prepare um pedido na ementa e envie para o WhatsApp da comissaria para o acompanhar aqui.',
      goToMenuBtn: 'Ir para a Ementa',
      deliveryAtPrefix: 'Entrega às',
      locationLabel: 'Local:',
      locationMissing: 'Não indicado',
      paymentLabel: 'Pagamento:',
      notesPrefix: 'Obs:',
      orderTotalLabel: 'Total do Pedido',
      repeatOrderBtn: 'Repetir Pedido',
      resendWhatsappBtn: 'Reenviar WhatsApp',
      deleteOrderAriaPrefix: 'Eliminar pedido',
      statusShort: {
        'Enviado no WhatsApp': 'Enviado',
        'Em Preparo': 'Em Preparação',
        'Entregue na Aeronave': 'Entregue',
      },
    },
    modal: {
      orderPrefix: 'Pedido',
      aircraftPrefix: 'Aeronave',
      title: 'Enviar Pedido para o WhatsApp',
      closeAria: 'Fechar janela',
      whatsappLabel: 'WhatsApp da Comissaria',
      cancel: 'Cancelar',
      changeNumber: 'Alterar número',
      apply: 'Aplicar',
      messagePreviewLabel: 'Pré-visualização da mensagem',
      totalPrefix: 'Total:',
      copyText: 'Copiar Texto',
      copied: 'Copiado',
      openWhatsapp: 'Abrir no WhatsApp',
    },
    toasts: {
      addedToOrderSuffix: 'adicionado ao pedido.',
      clearedCart: 'Artigos removidos do pedido.',
      statusUpdatedPrefix: 'Estado atualizado para',
      orderRepeatedPrefix: 'Pedido',
      orderRepeatedSuffix: 'carregado no carrinho.',
      orderDeleted: 'Registo de pedido eliminado.',
    },
    categories: {
      Salgados: 'Salgados',
      Lanches: 'Sanduíches',
      Refeições: 'Refeições',
      Sobremesas: 'Sobremesas',
      Bebidas: 'Bebidas',
    },
    payments: {
      'Faturar na Aeronave': 'Faturar na Aeronave',
      PIX: 'PIX',
      'Cartão na Entrega': 'Cartão na Entrega',
    },
  },

  'en-US': {
    languageBarLabel: 'Language',
    header: {
      menuTab: 'Menu',
      ordersTab: 'My Orders',
      orderBtn: 'Order',
      mobileCartCta: 'Review & Send',
    },
    hero: {
      subtitleSuffix: 'Overnight & Pre-Flight',
      title: 'Inflight Catering Services',
      whatsappLabel: 'Catering WhatsApp',
    },
    footer: {
      restrictedAccess: 'Restricted Access · Management',
    },
    catalog: {
      heading: 'Menu',
      subheading: 'Select items to send directly via WhatsApp.',
      searchPlaceholder: 'Search item...',
      allCategory: 'All',
      emptyState: 'No items found for the selected filters.',
      clearFilters: 'Clear filters',
      add: 'Add',
      addAriaPrefix: 'Add one unit of',
      removeAriaPrefix: 'Remove one unit of',
    },
    sidebar: {
      title: 'Inflight Order',
      itemSingular: 'item',
      itemPlural: 'items',
      clearOrderTitle: 'Clear order',
      aircraftTailLabel: 'Aircraft Tail *',
      aircraftTailPlaceholder: 'e.g., N123AB',
      deliveryTimeLabel: 'Delivery Time *',
      requesterLabel: 'Captain / Requester *',
      requesterPlaceholder: 'e.g., Capt. Carlos Silva',
      hangarLocationLabel: 'Hangar / Ramp Position',
      hangarLocationPlaceholder: 'e.g., Hangar 2 · South Ramp',
      paymentMethodLabel: 'Billing Method',
      notesLabel: 'Inflight Notes',
      notesPlaceholder: 'e.g., Deliver to flight attendant, extra ice',
      emptyCart: 'No items selected. Add items from the menu.',
      estimatedTotal: 'Estimated Total',
      directWhatsappPrefix: 'Direct WhatsApp dispatch:',
      submitButton: 'Send Order via WhatsApp',
      decreaseQtyPrefix: 'Decrease quantity of',
      increaseQtyPrefix: 'Increase quantity of',
    },
    orders: {
      title: 'WhatsApp Order History',
      subtitle:
        'Review past requests, update delivery status, or resend via WhatsApp.',
      recordsLabel: 'Orders',
      deliveredLabel: 'Delivered',
      totalVolumeLabel: 'Total Volume',
      emptyTitle: 'No orders placed yet',
      emptySubtitle:
        'Build an order from the menu and send it to catering WhatsApp to track it here.',
      goToMenuBtn: 'Go to Menu',
      deliveryAtPrefix: 'Delivery at',
      locationLabel: 'Location:',
      locationMissing: 'Not provided',
      paymentLabel: 'Billing:',
      notesPrefix: 'Notes:',
      orderTotalLabel: 'Order Total',
      repeatOrderBtn: 'Repeat Order',
      resendWhatsappBtn: 'Resend WhatsApp',
      deleteOrderAriaPrefix: 'Delete order',
      statusShort: {
        'Enviado no WhatsApp': 'Sent',
        'Em Preparo': 'Preparing',
        'Entregue na Aeronave': 'Delivered',
      },
    },
    modal: {
      orderPrefix: 'Order',
      aircraftPrefix: 'Aircraft',
      title: 'Send Order to WhatsApp',
      closeAria: 'Close window',
      whatsappLabel: 'Catering WhatsApp',
      cancel: 'Cancel',
      changeNumber: 'Change number',
      apply: 'Apply',
      messagePreviewLabel: 'Formatted message preview',
      totalPrefix: 'Total:',
      copyText: 'Copy Text',
      copied: 'Copied',
      openWhatsapp: 'Open in WhatsApp',
    },
    toasts: {
      addedToOrderSuffix: 'added to order.',
      clearedCart: 'Items cleared from order.',
      statusUpdatedPrefix: 'Status updated to',
      orderRepeatedPrefix: 'Order',
      orderRepeatedSuffix: 'loaded into cart.',
      orderDeleted: 'Order record removed.',
    },
    categories: {
      Salgados: 'Savory Bites',
      Lanches: 'Sandwiches',
      Refeições: 'Meals',
      Sobremesas: 'Desserts',
      Bebidas: 'Beverages',
    },
    payments: {
      'Faturar na Aeronave': 'Bill to Aircraft',
      PIX: 'PIX',
      'Cartão na Entrega': 'Card on Delivery',
    },
  },

  es: {
    languageBarLabel: 'Idioma',
    header: {
      menuTab: 'Menú',
      ordersTab: 'Mis Pedidos',
      orderBtn: 'Pedido',
      mobileCartCta: 'Finalizar Pedido',
    },
    hero: {
      subtitleSuffix: 'Pernocta y Prevuelo',
      title: 'Servicios a Bordo',
      whatsappLabel: 'WhatsApp de Comisariado',
    },
    footer: {
      restrictedAccess: 'Acceso Restringido · Gerencia',
    },
    catalog: {
      heading: 'Menú',
      subheading: 'Seleccione los artículos para enviar por WhatsApp.',
      searchPlaceholder: 'Buscar artículo...',
      allCategory: 'Todos',
      emptyState: 'No se encontraron artículos para los filtros aplicados.',
      clearFilters: 'Limpiar filtros',
      add: 'Agregar',
      addAriaPrefix: 'Agregar una unidad de',
      removeAriaPrefix: 'Quitar una unidad de',
    },
    sidebar: {
      title: 'Solicitud a Bordo',
      itemSingular: 'artículo',
      itemPlural: 'artículos',
      clearOrderTitle: 'Limpiar pedido',
      aircraftTailLabel: 'Matrícula Aeronave *',
      aircraftTailPlaceholder: 'Ej: XA-XYZ',
      deliveryTimeLabel: 'Hora de Entrega *',
      requesterLabel: 'Comandante / Solicitante *',
      requesterPlaceholder: 'Ej: Cmte. Carlos Silva',
      hangarLocationLabel: 'Hangar / Posición en Plataforma',
      hangarLocationPlaceholder: 'Ej: Hangar 2 · Plataforma Sur',
      paymentMethodLabel: 'Forma de Facturación',
      notesLabel: 'Observaciones a Bordo',
      notesPlaceholder: 'Ej: Entregar al sobrecargo, hielo extra',
      emptyCart:
        'Ningún artículo seleccionado. Agregue productos del menú.',
      estimatedTotal: 'Total Estimado',
      directWhatsappPrefix: 'Envío directo a WhatsApp:',
      submitButton: 'Enviar Pedido por WhatsApp',
      decreaseQtyPrefix: 'Disminuir cantidad de',
      increaseQtyPrefix: 'Aumentar cantidad de',
    },
    orders: {
      title: 'Historial de Pedidos por WhatsApp',
      subtitle:
        'Consulte solicitudes anteriores, actualice el estado de entrega o reenvíe por WhatsApp.',
      recordsLabel: 'Registros',
      deliveredLabel: 'Entregados',
      totalVolumeLabel: 'Volumen Total',
      emptyTitle: 'Aún no hay pedidos registrados',
      emptySubtitle:
        'Arme una solicitud en el menú y envíela al WhatsApp de comisariado para seguirla aquí.',
      goToMenuBtn: 'Ir al Menú',
      deliveryAtPrefix: 'Entrega a las',
      locationLabel: 'Ubicación:',
      locationMissing: 'No especificada',
      paymentLabel: 'Facturación:',
      notesPrefix: 'Obs:',
      orderTotalLabel: 'Total del Pedido',
      repeatOrderBtn: 'Repetir Pedido',
      resendWhatsappBtn: 'Reenviar WhatsApp',
      deleteOrderAriaPrefix: 'Eliminar pedido',
      statusShort: {
        'Enviado no WhatsApp': 'Enviado',
        'Em Preparo': 'En Preparación',
        'Entregue na Aeronave': 'Entregado',
      },
    },
    modal: {
      orderPrefix: 'Pedido',
      aircraftPrefix: 'Aeronave',
      title: 'Enviar Pedido a WhatsApp',
      closeAria: 'Cerrar ventana',
      whatsappLabel: 'WhatsApp de Comisariado',
      cancel: 'Cancelar',
      changeNumber: 'Cambiar número',
      apply: 'Aplicar',
      messagePreviewLabel: 'Vista previa del mensaje',
      totalPrefix: 'Total:',
      copyText: 'Copiar Texto',
      copied: 'Copiado',
      openWhatsapp: 'Abrir en WhatsApp',
    },
    toasts: {
      addedToOrderSuffix: 'agregado al pedido.',
      clearedCart: 'Artículos eliminados de la solicitud.',
      statusUpdatedPrefix: 'Estado actualizado a',
      orderRepeatedPrefix: 'Pedido',
      orderRepeatedSuffix: 'cargado en el carrito.',
      orderDeleted: 'Registro de pedido eliminado.',
    },
    categories: {
      Salgados: 'Salados',
      Lanches: 'Sándwiches',
      Refeições: 'Comidas',
      Sobremesas: 'Postres',
      Bebidas: 'Bebidas',
    },
    payments: {
      'Faturar na Aeronave': 'Facturar a la Aeronave',
      PIX: 'PIX',
      'Cartão na Entrega': 'Tarjeta en la Entrega',
    },
  },
};

const MENU_ITEM_TRANSLATIONS: Record<
  string,
  Partial<
    Record<
      ClientLanguage,
      { name: string; desc: string; portion?: string }
    >
  >
> = {
  'item-1': {
    'pt-PT': {
      name: 'Coxinha de Frango com Requeijão',
      desc: 'Massa dourada estaladiça com recheio cremoso preparada por encomenda.',
    },
    'en-US': {
      name: 'Chicken & Cream Cheese Croquette',
      desc: 'Crispy golden dough with creamy shredded chicken filling made to order.',
    },
    es: {
      name: 'Croqueta de Pollo con Queso Crema',
      desc: 'Masa dorada crujiente con relleno cremoso preparada bajo pedido.',
    },
  },
  'item-2': {
    'pt-PT': {
      name: 'Folhado de Peito de Peru',
      desc: 'Salgado assado em massa folhada leve com queijo fresco.',
    },
    'en-US': {
      name: 'Turkey Breast Puff Pastry',
      desc: 'Freshly baked light puff pastry filled with turkey breast and white cheese.',
    },
    es: {
      name: 'Hojaldre de Pechuga de Pavo',
      desc: 'Bocadillo horneado en masa hojaldrada ligera con queso blanco.',
    },
  },
  'item-3': {
    'pt-PT': {
      name: 'Sanduíche Natural Executiva',
      desc: 'Pão ciabatta artesanal, rosbife, rúcula selecionada e mostarda Dijon.',
    },
    'en-US': {
      name: 'Executive Ciabatta Sandwich',
      desc: 'Artisan ciabatta bread, roast beef, fresh arugula, and Dijon mustard.',
    },
    es: {
      name: 'Sándwich Natural Ejecutivo',
      desc: 'Pan ciabatta artesanal, rosbif, rúcula seleccionada y mostaza Dijon.',
    },
  },
  'item-4': {
    'pt-PT': {
      name: 'Taça de Fruta da Época',
      desc: 'Seleção de fruta fresca cortada na hora em embalagem térmica.',
    },
    'en-US': {
      name: 'Seasonal Fresh Fruit Bowl',
      desc: 'Selection of freshly cut seasonal fruits in insulated packaging.',
    },
    es: {
      name: 'Bowl de Frutas de Temporada',
      desc: 'Selección de frutas frescas cortadas al momento en envase térmico.',
    },
  },
  'item-5': {
    'pt-PT': {
      name: 'Tarte de Lima Siciliana',
      desc: 'Base estaladiça amanteigada com creme cítrico e merengue leve.',
    },
    'en-US': {
      name: 'Sicilian Lemon Tart',
      desc: 'Crisp butter crust with citrus curd and light torched meringue.',
    },
    es: {
      name: 'Tarta de Limón Siciliano',
      desc: 'Base crujiente de mantequilla con crema cítrica y merengue ligero.',
    },
  },
  'item-6': {
    'pt-PT': {
      name: 'Refrigerante em Lata',
      desc: 'Coca-Cola, Guaraná Antarctica ou versões Zero à temperatura ideal.',
    },
    'en-US': {
      name: 'Canned Soft Drink',
      desc: 'Coca-Cola, Guaraná Antarctica, or Zero Sugar chilled to ideal temperature.',
    },
    es: {
      name: 'Refresco en Lata',
      desc: 'Coca-Cola, Guaraná Antarctica o versiones Zero a temperatura ideal.',
    },
  },
  'item-7': {
    'pt-PT': {
      name: 'Café Expresso Gourmet',
      desc: 'Grãos especiais moídos na hora, acompanha petit-four.',
      portion: 'Garrafa / Dose',
    },
    'en-US': {
      name: 'Gourmet Espresso Coffee',
      desc: 'Freshly ground specialty beans served with petit-four.',
      portion: 'Flask / Shot',
    },
    es: {
      name: 'Café Expresso Gourmet',
      desc: 'Granos especiales recién molidos, incluye petit-four.',
      portion: 'Termo / Taza',
    },
  },
  'item-8': {
    'pt-PT': {
      name: 'Água Mineral Sem Gás',
      desc: 'Garrafa selada fresca ou à temperatura ambiente conforme pedido.',
    },
    'en-US': {
      name: 'Still Mineral Water',
      desc: 'Sealed bottle served chilled or at room temperature upon request.',
    },
    es: {
      name: 'Agua Mineral Sin Gas',
      desc: 'Botella sellada fría o a temperatura ambiente según solicitud.',
    },
  },
  'item-9': {
    'pt-PT': {
      name: 'Sumo Natural de Laranja',
      desc: '100% natural, espremido minutos antes do embarque.',
    },
    'en-US': {
      name: 'Fresh-Squeezed Orange Juice',
      desc: '100% natural orange juice squeezed minutes before boarding.',
    },
    es: {
      name: 'Jugo Natural de Naranja',
      desc: '100% natural, exprimido minutos antes del embarque.',
    },
  },
  'item-10': {
    'pt-PT': {
      name: 'Pão de Queijo Mineiro (6 un.)',
      desc: 'Assado na hora com queijo curado e crosta ligeiramente estaladiça.',
    },
    'en-US': {
      name: 'Brazilian Cheese Bread (6 pcs)',
      desc: 'Freshly baked warm cheese bread made with aged artisanal cheese.',
      portion: '6 pcs (180g)',
    },
    es: {
      name: 'Pan de Queso Brasileño (6 uds.)',
      desc: 'Horneado al momento con queso curado y corteza ligeramente crujiente.',
      portion: '6 uds (180g)',
    },
  },
  'item-11': {
    'pt-PT': {
      name: 'Empada Artesanal de Palmito',
      desc: 'Massa quebradiça amanteigada com recheio cremoso de palmito.',
    },
    'en-US': {
      name: 'Artisan Heart of Palm Pot Pie',
      desc: 'Flaky butter pastry filled with creamy tender heart of palm.',
    },
    es: {
      name: 'Empanada Artesanal de Palmito',
      desc: 'Masa quebrada de mantequilla con relleno cremoso de palmito.',
    },
  },
  'item-12': {
    'pt-PT': {
      name: 'Croissant de Parma e Brie',
      desc: 'Croissant francês amanteigado com presunto di Parma, queijo Brie e rúcula.',
    },
    'en-US': {
      name: 'Prosciutto di Parma & Brie Croissant',
      desc: 'Flaky French butter croissant with Parma ham, creamy Brie, and arugula.',
    },
    es: {
      name: 'Croissant de Parma y Brie',
      desc: 'Croissant francés de mantequilla con jamón de Parma, queso Brie y rúcula.',
    },
  },
  'item-13': {
    'pt-PT': {
      name: 'Wrap Executivo de Frango',
      desc: 'Tortilha leve com tiras de frango grelhado, queijo creme com ervas e folhas frescas.',
    },
    'en-US': {
      name: 'Executive Grilled Chicken Wrap',
      desc: 'Light tortilla wrap with grilled chicken strips, herb cream cheese, and crisp greens.',
    },
    es: {
      name: 'Wrap Ejecutivo de Pollo',
      desc: 'Tortilla ligera con tiras de pollo a la parrilla, queso crema con hierbas y hojas frescas.',
    },
  },
  'item-14': {
    'pt-PT': {
      name: 'Salada Caesar Executiva',
      desc: 'Alface romana estaladiça, peito de frango grelhado, lascas de parmesão e croutons.',
    },
    'en-US': {
      name: 'Executive Chicken Caesar Salad',
      desc: 'Crisp romaine lettuce, sliced grilled chicken breast, shaved Parmesan, and croutons.',
    },
    es: {
      name: 'Ensalada César Ejecutiva',
      desc: 'Lechuga romana crujiente, pechuga de pollo a la parrilla, lascas de parmesano y picatostes.',
    },
  },
  'item-15': {
    'pt-PT': {
      name: 'Tábua Executiva de Frios e Queijos',
      desc: 'Seleção de queijos nobres, presunto Parma, uvas frescas, nozes e tostas.',
    },
    'en-US': {
      name: 'Executive Cheese & Charcuterie Board',
      desc: 'Curated selection of fine cheeses, Parma prosciutto, fresh grapes, walnuts, and crackers.',
    },
    es: {
      name: 'Tabla Ejecutiva de Quesos y Fiambres',
      desc: 'Selección de quesos finos, jamón de Parma, uvas frescas, nueces y tostadas.',
    },
  },
  'item-16': {
    'pt-PT': {
      name: 'Brownie Belga com Nozes',
      desc: 'Chocolate negro belga intenso com nozes tostadas e textura macia.',
    },
    'en-US': {
      name: 'Belgian Chocolate Walnut Brownie',
      desc: 'Rich Belgian dark chocolate fudge brownie topped with roasted walnuts.',
    },
    es: {
      name: 'Brownie Belga con Nueces',
      desc: 'Chocolate negro belga intenso con nueces tostadas y textura suave.',
    },
  },
  'item-17': {
    'pt-PT': {
      name: 'Cheesecake de Frutos Vermelhos',
      desc: 'Creme suave sobre base estaladiça com compota artesanal de frutos vermelhos.',
    },
    'en-US': {
      name: 'Mixed Berry Cheesecake',
      desc: 'Creamy New York cheesecake on crisp crust topped with fresh berry compote.',
    },
    es: {
      name: 'Cheesecake de Frutos Rojos',
      desc: 'Crema suave sobre base crujiente con salsa artesanal de frutos rojos.',
    },
  },
  'item-18': {
    'pt-PT': {
      name: 'Garrafa Térmica de Café Especial',
      desc: 'Café arábica recém-preparado em termo inox para toda a tripulação.',
      portion: '1 Litro',
    },
    'en-US': {
      name: 'Specialty Coffee Thermal Carafe',
      desc: 'Freshly brewed Arabica coffee in an insulated stainless carafe for the flight crew.',
      portion: '1 Liter',
    },
    es: {
      name: 'Termo de Café Especial',
      desc: 'Café arábica recién preparado en termo de acero inoxidable para toda la tripulación.',
      portion: '1 Litro',
    },
  },
};

export function getLocalizedMenuItem(
  item: MenuItem,
  lang: ClientLanguage
): { name: string; desc: string; portion: string } {
  if (lang === 'pt-BR') {
    return { name: item.name, desc: item.desc, portion: item.portion };
  }
  const override = MENU_ITEM_TRANSLATIONS[item.id]?.[lang];
  if (!override) {
    return { name: item.name, desc: item.desc, portion: item.portion };
  }
  return {
    name: override.name,
    desc: override.desc,
    portion: override.portion || item.portion,
  };
}

export function getLocalizedDateLocale(lang: ClientLanguage): string {
  if (lang === 'en-US') return 'en-US';
  if (lang === 'es') return 'es-ES';
  if (lang === 'pt-PT') return 'pt-PT';
  return 'pt-BR';
}
