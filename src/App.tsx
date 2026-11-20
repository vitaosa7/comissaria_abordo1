import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { CatalogSection } from './components/CatalogSection';
import { Header, StorefrontTab } from './components/Header';
import { LanguageBar } from './components/LanguageBar';
import { ManagementPage } from './components/ManagementPage';
import { OrderSidebar } from './components/OrderSidebar';
import { OrdersHistory } from './components/OrdersHistory';
import { WhatsAppModal } from './components/WhatsAppModal';
import {
  BRAND_LOGO_SRC,
  DEFAULT_MENU,
  DEFAULT_SETTINGS,
  EXPANDED_CATALOG_IDS,
  HERO_AVIATION_SRC,
  formatCurrency,
  formatPhoneDisplay,
  generateOrderCode,
  getDefaultDeliveryTime,
  sanitizePhoneDigits,
} from './data/defaultMenu';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  PRIMARY_ADMIN_EMAIL,
} from './firebase';
import {
  ClientLanguage,
  CLIENT_TRANSLATIONS,
  getLocalizedMenuItem,
} from './i18n/clientTranslations';
import {
  AdminRole,
  AdminUser,
  AuthErrorDetails,
  CartItem,
  CurrentAdminRole,
  HangarSettings,
  MenuCategory,
  MenuItem,
  OrderStatus,
  PaymentMethod,
  WhatsAppOrder,
} from './types/catering';

const STORAGE_KEYS = {
  ORDERS: 'hangar_wa_orders_v1',
  CART: 'hangar_wa_cart_v1',
  LANG: 'hangar_client_lang_v1',
  CATALOG_V2_SEEDED: 'hangar_catalog_v2_seeded',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function isManagementRoute(): boolean {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return path.startsWith('/gerencia') || hash.startsWith('#/gerencia');
}

function toIsoDate(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  return new Date().toISOString();
}

function mapFirebaseAuthError(err: unknown): AuthErrorDetails | null {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code?: unknown }).code || '')
      : '';
  const msg = err instanceof Error ? err.message : '';

  if (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request' ||
    msg.includes('popup-closed-by-user')
  ) {
    return null;
  }

  if (
    code === 'auth/unauthorized-domain' ||
    msg.includes('unauthorized-domain')
  ) {
    return {
      code: 'auth/unauthorized-domain',
      unauthorizedDomain: window.location.hostname,
      message: `O domínio "${window.location.hostname}" ainda não foi autorizado no Firebase Authentication.`,
    };
  }

  if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
    return {
      code: 'auth/popup-blocked',
      message:
        'O navegador bloqueou a janela do Google. Permita pop-ups ou use a opção de redirecionamento abaixo.',
    };
  }

  if (code === 'auth/network-request-failed') {
    return {
      code,
      message:
        'Falha de conexão com a internet. Verifique sua rede e tente novamente.',
    };
  }

  return {
    code: code || undefined,
    message:
      'Não foi possível concluir o login com Google. Se estiver usando o navegador interno do WhatsApp/Instagram, abra o link no Chrome ou Safari.',
  };
}

export default function App() {
  const [isManagementPage, setIsManagementPage] = useState<boolean>(() =>
    isManagementRoute()
  );
  const [storefrontTab, setStorefrontTab] = useState<StorefrontTab>('catalog');
  const [clientLanguage, setClientLanguage] = useState<ClientLanguage>(() => {
    const saved = loadFromStorage<string>(STORAGE_KEYS.LANG, 'pt-BR');
    if (
      saved === 'pt-BR' ||
      saved === 'pt-PT' ||
      saved === 'en-US' ||
      saved === 'es'
    ) {
      return saved;
    }
    return 'pt-BR';
  });
  const t = CLIENT_TRANSLATIONS[clientLanguage];

  // Firebase Auth & Manager RBAC state
  const [authReady, setAuthReady] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [adminRole, setAdminRole] = useState<CurrentAdminRole>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<AuthErrorDetails | null>(null);

  // Catalog & settings (synced live from Firestore, defaulting seamlessly)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU);
  const [settings, setSettings] = useState<HangarSettings>(DEFAULT_SETTINGS);
  const hasSeededDefaults = useRef(false);
  const firestoreMenuEmpty = useRef(false);
  const firestoreMissingExpanded = useRef(false);
  const firestoreSettingsEmpty = useRef(false);

  // Client device local orders ("Meus Pedidos") + Manager cloud orders ("/gerencia")
  const [localOrders, setLocalOrders] = useState<WhatsAppOrder[]>(() =>
    loadFromStorage(STORAGE_KEYS.ORDERS, [])
  );
  const [managerOrders, setManagerOrders] = useState<WhatsAppOrder[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.CART, [])
  );

  // Catalog filters
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | MenuCategory>(
    'Todos'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Checkout form fields
  const [aircraftTail, setAircraftTail] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [deliveryTime, setDeliveryTime] = useState(() =>
    getDefaultDeliveryTime(DEFAULT_SETTINGS.deliveryLeadMinutes)
  );
  const [hangarLocation, setHangarLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    'Faturar na Aeronave'
  );

  // Active WhatsApp modal order
  const [modalOrder, setModalOrder] = useState<WhatsAppOrder | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANG, JSON.stringify(clientLanguage));
    if (!isManagementPage) {
      document.documentElement.lang = clientLanguage;
    } else {
      document.documentElement.lang = 'pt-BR';
    }
  }, [clientLanguage, isManagementPage]);

  useEffect(() => {
    const handlePopState = () => {
      setIsManagementPage(isManagementRoute());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Handle Google redirect result when returning from signInWithRedirect (Vercel / mobile)
  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      const mapped = mapFirebaseAuthError(err);
      if (mapped) {
        setAuthError(mapped);
      }
    });
  }, []);

  // Auth listener & email-keyed manager role resolution
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (!user) {
        setIsManager(false);
        setAdminRole(null);
        setAuthReady(true);
        return;
      }

      const emailLower = user.email?.trim().toLowerCase() || '';
      const isPrimary = Boolean(
        user.emailVerified &&
          emailLower === PRIMARY_ADMIN_EMAIL.toLowerCase()
      );

      if (isPrimary) {
        setIsManager(true);
        setAdminRole('owner');
        setAuthReady(true);
        return;
      }

      if (user.emailVerified && emailLower) {
        try {
          const adminSnap = await getDoc(doc(db, 'admins', emailLower));
          if (adminSnap.exists()) {
            const role: AdminRole =
              adminSnap.data()?.role === 'admin' ? 'admin' : 'manager';
            setIsManager(true);
            setAdminRole(role);
          } else {
            setIsManager(false);
            setAdminRole(null);
          }
        } catch {
          setIsManager(false);
          setAdminRole(null);
        }
      } else {
        setIsManager(false);
        setAdminRole(null);
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Public menu listener
  useEffect(() => {
    const defaultImageById = new Map(
      DEFAULT_MENU.map((item) => [item.id, item.imageUrl])
    );

    const unsubscribe = onSnapshot(
      collection(db, 'menuItems'),
      (snapshot) => {
        if (snapshot.empty) {
          firestoreMenuEmpty.current = true;
          setMenuItems(DEFAULT_MENU);
          return;
        }
        firestoreMenuEmpty.current = false;
        const existingIds = new Set(snapshot.docs.map((d) => d.id));
        const hasExpandedItems = EXPANDED_CATALOG_IDS.some((id) =>
          existingIds.has(id)
        );
        const expandedAlreadySeeded =
          localStorage.getItem(STORAGE_KEYS.CATALOG_V2_SEEDED) === '1';

        if (hasExpandedItems) {
          firestoreMissingExpanded.current = false;
          localStorage.setItem(STORAGE_KEYS.CATALOG_V2_SEEDED, '1');
        } else {
          firestoreMissingExpanded.current = !expandedAlreadySeeded;
        }

        const loaded: MenuItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: String(data.name || ''),
            price: Number(data.price || 0),
            category: (data.category || 'Salgados') as MenuCategory,
            portion: String(data.portion || 'Unidade'),
            desc: String(data.desc || ''),
            iconKey: (data.iconKey || 'pastry') as MenuItem['iconKey'],
            imageUrl:
              typeof data.imageUrl === 'string' && data.imageUrl
                ? data.imageUrl
                : defaultImageById.get(d.id),
            available: Boolean(data.available),
          };
        });

        if (!hasExpandedItems && !expandedAlreadySeeded) {
          DEFAULT_MENU.forEach((item) => {
            if (EXPANDED_CATALOG_IDS.includes(item.id) && !existingIds.has(item.id)) {
              loaded.push(item);
            }
          });
        }

        loaded.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        setMenuItems(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'menuItems');
      }
    );

    return () => unsubscribe();
  }, []);

  // Public settings listener
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'publicSettings', 'storefront'),
      (snapshot) => {
        if (!snapshot.exists()) {
          firestoreSettingsEmpty.current = true;
          setSettings(DEFAULT_SETTINGS);
          return;
        }
        firestoreSettingsEmpty.current = false;
        const data = snapshot.data();
        setSettings({
          hangarName: String(data.hangarName || DEFAULT_SETTINGS.hangarName),
          whatsappNumber: String(
            data.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber
          ),
          greetingText: String(
            data.greetingText || DEFAULT_SETTINGS.greetingText
          ),
          deliveryLeadMinutes: Number(
            data.deliveryLeadMinutes || DEFAULT_SETTINGS.deliveryLeadMinutes
          ),
        });
      },
      (error) => {
        handleFirestoreError(
          error,
          OperationType.GET,
          'publicSettings/storefront'
        );
      }
    );

    return () => unsubscribe();
  }, []);

  // Seed default menu & settings to Firestore once when an authorized manager connects
  useEffect(() => {
    if (!authReady || !isManager || hasSeededDefaults.current) return;
    hasSeededDefaults.current = true;

    const seedIfNeeded = async () => {
      if (firestoreMenuEmpty.current) {
        const batch = writeBatch(db);
        DEFAULT_MENU.forEach((item) => {
          const { id, ...rest } = item;
          batch.set(doc(db, 'menuItems', id), {
            ...rest,
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();
        localStorage.setItem(STORAGE_KEYS.CATALOG_V2_SEEDED, '1');
      } else if (
        firestoreMissingExpanded.current &&
        localStorage.getItem(STORAGE_KEYS.CATALOG_V2_SEEDED) !== '1'
      ) {
        const batch = writeBatch(db);
        DEFAULT_MENU.filter((item) =>
          EXPANDED_CATALOG_IDS.includes(item.id)
        ).forEach((item) => {
          const { id, ...rest } = item;
          batch.set(doc(db, 'menuItems', id), {
            ...rest,
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();
        firestoreMissingExpanded.current = false;
        localStorage.setItem(STORAGE_KEYS.CATALOG_V2_SEEDED, '1');
      }
      if (firestoreSettingsEmpty.current) {
        await setDoc(doc(db, 'publicSettings', 'storefront'), {
          hangarName: DEFAULT_SETTINGS.hangarName,
          whatsappNumber: DEFAULT_SETTINGS.whatsappNumber,
          greetingText: DEFAULT_SETTINGS.greetingText,
          deliveryLeadMinutes: DEFAULT_SETTINGS.deliveryLeadMinutes,
          updatedAt: serverTimestamp(),
        });
      }
    };

    seedIfNeeded().catch((err) => {
      console.error('Erro ao inicializar dados no Firestore:', err);
    });
  }, [authReady, isManager]);

  // Manager-only live orders listener
  useEffect(() => {
    if (!authReady || !authUser || !isManager) {
      setManagerOrders([]);
      return;
    }

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: WhatsAppOrder[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            code: String(data.code || ''),
            aircraftTail: String(data.aircraftTail || ''),
            requesterName: String(data.requesterName || ''),
            deliveryTime: String(data.deliveryTime || ''),
            hangarLocation: String(data.hangarLocation || ''),
            notes: String(data.notes || ''),
            paymentMethod: (data.paymentMethod ||
              'Faturar na Aeronave') as PaymentMethod,
            items: Array.isArray(data.items) ? (data.items as CartItem[]) : [],
            total: Number(data.total || 0),
            status: (data.status || 'Enviado no WhatsApp') as OrderStatus,
            createdAt: toIsoDate(data.createdAt),
          };
        });
        setManagerOrders(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'orders');
      }
    );

    return () => unsubscribe();
  }, [authReady, authUser, isManager]);

  // Manager-only live authorized admins listener
  useEffect(() => {
    if (!authReady || !authUser || !isManager) {
      setAdmins([]);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'admins'),
      (snapshot) => {
        const loaded: AdminUser[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            email: String(data.email || d.id).toLowerCase(),
            displayName:
              typeof data.displayName === 'string' && data.displayName.trim()
                ? data.displayName.trim()
                : undefined,
            role: data.role === 'admin' ? 'admin' : 'manager',
            addedBy:
              typeof data.addedBy === 'string' && data.addedBy.trim()
                ? data.addedBy.trim()
                : undefined,
            createdAt: toIsoDate(data.createdAt),
          };
        });
        loaded.sort((a, b) => a.email.localeCompare(b.email, 'pt-BR'));
        setAdmins(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'admins');
      }
    );

    return () => unsubscribe();
  }, [authReady, authUser, isManager]);

  const navigateTo = (target: 'storefront' | 'management') => {
    const nextPath = target === 'management' ? '/gerencia' : '/';
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setIsManagementPage(target === 'management');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(localOrders));
  }, [localOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  // Auth actions
  const handleManagerLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: unknown }).code || '')
          : '';
      const isTopLevelWindow =
        typeof window !== 'undefined' && window.self === window.top;

      if (
        isTopLevelWindow &&
        (code === 'auth/popup-blocked' ||
          code === 'auth/operation-not-supported-in-this-environment')
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          const mapped = mapFirebaseAuthError(redirectErr);
          if (mapped) setAuthError(mapped);
        }
      } else {
        const mapped = mapFirebaseAuthError(err);
        if (mapped) setAuthError(mapped);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleManagerRedirectLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      const mapped = mapFirebaseAuthError(err);
      if (mapped) setAuthError(mapped);
      setAuthLoading(false);
    }
  };

  const handleManagerLogout = async () => {
    await signOut(auth);
    showToast('Sessão de gerência encerrada.');
  };

  const handleSwitchAccount = async () => {
    await signOut(auth);
    await handleManagerLogin();
  };

  // Cart handlers
  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          qty: 1,
          portion: item.portion,
        },
      ];
    });
    const localizedName = getLocalizedMenuItem(item, clientLanguage).name;
    showToast(`${localizedName} ${t.toasts.addedToOrderSuffix}`);
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === itemId ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const handleClearCart = () => {
    setCart([]);
    showToast(t.toasts.clearedCart);
  };

  const handleOpenCart = () => {
    if (storefrontTab !== 'catalog') {
      setStorefrontTab('catalog');
      setTimeout(() => {
        document
          .getElementById('cart-section')
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } else {
      document
        .getElementById('cart-section')
        ?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Submit order -> save to client history + persist in Firestore + open WhatsApp preview modal
  const handleSubmitOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const orderId = `ord-${Date.now()}`;
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const newOrder: WhatsAppOrder = {
      id: orderId,
      code: generateOrderCode(),
      aircraftTail: aircraftTail.trim().toUpperCase(),
      requesterName: requesterName.trim(),
      deliveryTime,
      hangarLocation: hangarLocation.trim(),
      notes: notes.trim(),
      paymentMethod,
      items: [...cart],
      total,
      status: 'Enviado no WhatsApp',
      createdAt: new Date().toISOString(),
    };

    setLocalOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setNotes('');
    setModalOrder(newOrder);

    try {
      await setDoc(doc(db, 'orders', orderId), {
        code: newOrder.code,
        aircraftTail: newOrder.aircraftTail,
        requesterName: newOrder.requesterName,
        deliveryTime: newOrder.deliveryTime,
        hangarLocation: newOrder.hangarLocation,
        notes: newOrder.notes,
        paymentMethod: newOrder.paymentMethod,
        items: newOrder.items,
        total: newOrder.total,
        status: 'Enviado no WhatsApp',
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `orders/${orderId}`);
    }
  };

  // Order history handlers
  const handleUpdateOrderStatus = async (
    orderId: string,
    status: OrderStatus
  ) => {
    setLocalOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    if (isManager) {
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          status,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
      }
    }
    showToast(
      `${t.toasts.statusUpdatedPrefix} "${t.orders.statusShort[status]}".`
    );
  };

  const handleRepeatOrder = (order: WhatsAppOrder) => {
    setCart(order.items);
    setAircraftTail(order.aircraftTail);
    setRequesterName(order.requesterName);
    setHangarLocation(order.hangarLocation);
    setPaymentMethod(order.paymentMethod);
    setNotes(order.notes);
    setDeliveryTime(getDefaultDeliveryTime(settings.deliveryLeadMinutes));
    setStorefrontTab('catalog');
    showToast(
      `${t.toasts.orderRepeatedPrefix} #${order.code} ${t.toasts.orderRepeatedSuffix}`
    );
  };

  const handleDeleteOrder = async (orderId: string) => {
    setLocalOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (isManager) {
      try {
        await deleteDoc(doc(db, 'orders', orderId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `orders/${orderId}`);
      }
    }
    showToast(t.toasts.orderDeleted);
  };

  // Menu management handlers (Manager-only in Firestore)
  const handleSaveMenuItem = async (
    itemData: Omit<MenuItem, 'id'>,
    editId?: string
  ) => {
    const id = editId || `item-${Date.now()}`;
    const payload: Record<string, unknown> = {
      name: itemData.name,
      price: itemData.price,
      category: itemData.category,
      portion: itemData.portion,
      desc: itemData.desc,
      iconKey: itemData.iconKey,
      available: itemData.available,
      updatedAt: serverTimestamp(),
    };
    if (itemData.imageUrl) {
      payload.imageUrl = itemData.imageUrl;
    }

    try {
      await setDoc(doc(db, 'menuItems', id), payload);
      showToast(
        editId
          ? 'Item atualizado no cardápio.'
          : 'Novo item adicionado ao cardápio.'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `menuItems/${id}`);
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    const current = menuItems.find((i) => i.id === itemId);
    if (!current) return;
    try {
      await updateDoc(doc(db, 'menuItems', itemId), {
        available: !current.available,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `menuItems/${itemId}`);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    try {
      await deleteDoc(doc(db, 'menuItems', itemId));
      setCart((prev) => prev.filter((c) => c.id !== itemId));
      showToast('Item removido do cardápio.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `menuItems/${itemId}`);
    }
  };

  const handleResetDefaultMenu = async () => {
    try {
      const batch = writeBatch(db);
      DEFAULT_MENU.forEach((item) => {
        const { id, ...rest } = item;
        batch.set(doc(db, 'menuItems', id), {
          ...rest,
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
      showToast('Cardápio restaurado para os itens padrão.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'menuItems');
    }
  };

  // WhatsApp settings handlers (Manager-only in Firestore)
  const handleSaveSettings = async (next: HangarSettings) => {
    const cleanPhone = sanitizePhoneDigits(next.whatsappNumber);
    try {
      await setDoc(doc(db, 'publicSettings', 'storefront'), {
        hangarName: next.hangarName,
        whatsappNumber: cleanPhone || settings.whatsappNumber,
        greetingText: next.greetingText,
        deliveryLeadMinutes: next.deliveryLeadMinutes,
        updatedAt: serverTimestamp(),
      });
      setDeliveryTime(getDefaultDeliveryTime(next.deliveryLeadMinutes));
      showToast('Configurações de gerência salvas.');
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        'publicSettings/storefront'
      );
    }
  };

  const handleUpdatePhoneQuick = async (phone: string) => {
    if (!isManager) return;
    const clean = sanitizePhoneDigits(phone);
    if (clean.length < 10) return;
    await handleSaveSettings({ ...settings, whatsappNumber: clean });
  };

  // Multi-admin access control handlers (Full Admins & Primary Owner in Firestore)
  const handleAddAdmin = async (data: {
    email: string;
    displayName: string;
    role: AdminRole;
  }) => {
    const emailId = data.email.trim().toLowerCase();
    const payload: Record<string, unknown> = {
      email: emailId,
      role: data.role,
      addedBy:
        authUser?.email?.trim().toLowerCase() ||
        PRIMARY_ADMIN_EMAIL.toLowerCase(),
      createdAt: serverTimestamp(),
    };
    if (data.displayName.trim()) {
      payload.displayName = data.displayName.trim();
    }

    try {
      await setDoc(doc(db, 'admins', emailId), payload);
      showToast(`Acesso autorizado para ${emailId}.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `admins/${emailId}`);
    }
  };

  const handleUpdateAdminRole = async (emailId: string, role: AdminRole) => {
    const normalizedId = emailId.trim().toLowerCase();
    try {
      await updateDoc(doc(db, 'admins', normalizedId), {
        role,
        updatedAt: serverTimestamp(),
      });
      showToast('Nível de acesso atualizado.');
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `admins/${normalizedId}`
      );
    }
  };

  const handleRemoveAdmin = async (emailId: string) => {
    const normalizedId = emailId.trim().toLowerCase();
    try {
      await deleteDoc(doc(db, 'admins', normalizedId));
      showToast(`Acesso revogado para ${normalizedId}.`);
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.DELETE,
        `admins/${normalizedId}`
      );
    }
  };

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <>
      {isManagementPage ? (
        <ManagementPage
          authReady={authReady}
          authUser={authUser}
          isManager={isManager}
          adminRole={adminRole}
          admins={admins}
          authLoading={authLoading}
          authError={authError}
          onLogin={handleManagerLogin}
          onLoginWithRedirect={handleManagerRedirectLogin}
          onLogout={handleManagerLogout}
          onSwitchAccount={handleSwitchAccount}
          orders={managerOrders}
          menuItems={menuItems}
          settings={settings}
          onBackToStorefront={() => navigateTo('storefront')}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onDeleteOrder={handleDeleteOrder}
          onSaveMenuItem={handleSaveMenuItem}
          onToggleAvailability={handleToggleAvailability}
          onDeleteMenuItem={handleDeleteMenuItem}
          onResetDefaultMenu={handleResetDefaultMenu}
          onSaveSettings={handleSaveSettings}
          onAddAdmin={handleAddAdmin}
          onUpdateAdminRole={handleUpdateAdminRole}
          onRemoveAdmin={handleRemoveAdmin}
        />
      ) : (
        <div className="min-h-screen flex flex-col bg-[#F3F5F8] text-[#0B1320]">
          <Header
            brandTitle="Sá Aviações a Bordo"
            language={clientLanguage}
            activeTab={storefrontTab}
            onSelectTab={setStorefrontTab}
            cartCount={cartCount}
            cartTotal={cartTotal}
            onOpenCart={handleOpenCart}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-7">
            <LanguageBar
              language={clientLanguage}
              onChangeLanguage={setClientLanguage}
            />

            {storefrontTab === 'catalog' && (
              <div className="space-y-4 sm:space-y-7">
                {/* Executive Aviation Hero Banner */}
                <section className="relative rounded-2xl overflow-hidden bg-[#0B1320] text-white border border-slate-800/80">
                  <img
                    src={HERO_AVIATION_SRC}
                    alt={settings.hangarName}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-55"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-r from-[#0B1320]/95 via-[#0B1320]/82 to-[#0B1320]/35"
                  />

                  <div className="relative p-3.5 sm:p-7 lg:p-8 flex flex-col lg:flex-row lg:items-end justify-between gap-3 sm:gap-6 min-h-[120px] sm:min-h-[210px]">
                    <div className="flex items-center gap-3 sm:gap-5 max-w-2xl">
                      <img
                        src={BRAND_LOGO_SRC}
                        alt="Logo Sá Aviações a Bordo"
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-contain border border-[#C9A256]/60 bg-[#FAF9F6] shrink-0 shadow-lg"
                      />
                      <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs font-medium text-[#C9A256] tracking-wide truncate">
                          {settings.hangarName} · {t.hero.subtitleSuffix}
                        </p>
                        <h1 className="text-lg sm:text-3xl font-bold tracking-tight text-white mt-0.5 sm:mt-1 text-balance leading-tight">
                          {t.hero.title}
                        </h1>
                      </div>
                    </div>

                    <div className="text-left lg:text-right shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-white/15 flex items-center justify-between lg:block">
                      <span className="text-[11px] sm:text-xs text-slate-300 lg:block">
                        {t.hero.whatsappLabel}
                      </span>
                      <span className="text-xs sm:text-base font-mono font-semibold tabular-nums text-white">
                        {formatPhoneDisplay(settings.whatsappNumber)}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Two-column Catalog + Order Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-7 items-start">
                  <div className="lg:col-span-2">
                    <CatalogSection
                      language={clientLanguage}
                      items={menuItems}
                      cart={cart}
                      selectedCategory={selectedCategory}
                      searchQuery={searchQuery}
                      onSelectCategory={setSelectedCategory}
                      onSearchChange={setSearchQuery}
                      onAddToCart={handleAddToCart}
                      onUpdateQty={handleUpdateQty}
                    />
                  </div>

                  <div>
                    <OrderSidebar
                      language={clientLanguage}
                      menuItems={menuItems}
                      cart={cart}
                      settings={settings}
                      aircraftTail={aircraftTail}
                      requesterName={requesterName}
                      deliveryTime={deliveryTime}
                      hangarLocation={hangarLocation}
                      notes={notes}
                      paymentMethod={paymentMethod}
                      onAircraftTailChange={setAircraftTail}
                      onRequesterNameChange={setRequesterName}
                      onDeliveryTimeChange={setDeliveryTime}
                      onHangarLocationChange={setHangarLocation}
                      onNotesChange={setNotes}
                      onPaymentMethodChange={setPaymentMethod}
                      onUpdateQty={handleUpdateQty}
                      onClearCart={handleClearCart}
                      onSubmitOrder={handleSubmitOrder}
                    />
                  </div>
                </div>
              </div>
            )}

            {storefrontTab === 'orders' && (
              <OrdersHistory
                language={clientLanguage}
                menuItems={menuItems}
                orders={localOrders}
                settings={settings}
                onUpdateStatus={handleUpdateOrderStatus}
                onRepeatOrder={handleRepeatOrder}
                onDeleteOrder={handleDeleteOrder}
                onGoToCatalog={() => setStorefrontTab('catalog')}
              />
            )}
          </main>

          <footer
            className={`border-t border-slate-200/90 bg-white mt-10 sm:mt-12 ${
              storefrontTab === 'catalog' && cartCount > 0
                ? 'pb-20 lg:pb-0'
                : ''
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2.5">
                <img
                  src={BRAND_LOGO_SRC}
                  alt="Logo Sá Aviações a Bordo"
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-lg object-contain border border-slate-200 bg-[#FAF9F6] shrink-0"
                />
                <span className="text-[#0B1320] font-medium">
                  {settings.hangarName} ·{' '}
                  <span className="font-mono text-slate-600">
                    {formatPhoneDisplay(settings.whatsappNumber)}
                  </span>
                </span>
              </div>
              <a
                href="/gerencia"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('management');
                }}
                className="min-h-[36px] inline-flex items-center text-slate-600 hover:text-[#0B1320] underline underline-offset-4 transition"
              >
                {t.footer.restrictedAccess}
              </a>
            </div>
          </footer>

          {/* Mobile Sticky Thumb-Zone Checkout Bar */}
          {storefrontTab === 'catalog' && cartCount > 0 && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0B1320]/95 backdrop-blur-md border-t border-white/10 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-white shadow-2xl">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-white/10 text-[#C9A256] flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-300 font-mono tabular-nums truncate">
                      {cartCount}{' '}
                      {cartCount === 1
                        ? t.sidebar.itemSingular
                        : t.sidebar.itemPlural}
                    </p>
                    <p className="text-sm font-bold font-mono tabular-nums text-white">
                      {formatCurrency(cartTotal)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCart}
                  className="min-h-[42px] px-4 py-2 bg-[#C9A256] hover:bg-[#B89042] active:scale-[0.98] text-[#0B1320] text-xs font-bold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>{t.header.mobileCartCta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <WhatsAppModal
            language={clientLanguage}
            order={modalOrder}
            settings={settings}
            canEditPhone={isManager}
            onUpdatePhone={handleUpdatePhoneQuick}
            onClose={() => setModalOrder(null)}
          />
        </div>
      )}

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-3 sm:right-5 z-50 px-4 py-3 bg-[#0B1320] text-white border border-[#C9A256]/40 text-xs sm:text-sm font-medium rounded-xl shadow-xl ${
            !isManagementPage && storefrontTab === 'catalog' && cartCount > 0
              ? 'bottom-20 lg:bottom-5'
              : 'bottom-5'
          }`}
        >
          {toastMessage}
        </div>
      )}
    </>
  );
}
