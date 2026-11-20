// Security Rules Verification Matrix for Comissaria Hangar
// Maps the 12 adversarial payloads from security_spec.md against firestore.rules.

export interface SecurityTestCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_CASES: SecurityTestCase[] = [
  { id: 1, name: 'Unauthenticated list on /orders', operation: 'list', path: '/orders', expected: 'PERMISSION_DENIED' },
  { id: 2, name: 'Non-admin get on /orders/{id}', operation: 'get', path: '/orders/ord-1', expected: 'PERMISSION_DENIED' },
  { id: 3, name: 'Unverified admin email spoof', operation: 'list', path: '/orders', expected: 'PERMISSION_DENIED' },
  { id: 4, name: 'Self-assigned admin write', operation: 'create', path: '/admins/attacker-uid', expected: 'PERMISSION_DENIED' },
  { id: 5, name: 'Order status shortcut on create', operation: 'create', path: '/orders/ord-1', expected: 'PERMISSION_DENIED' },
  { id: 6, name: 'Shadow field injection on order create', operation: 'create', path: '/orders/ord-1', expected: 'PERMISSION_DENIED' },
  { id: 7, name: 'Client timestamp forgery on order create', operation: 'create', path: '/orders/ord-1', expected: 'PERMISSION_DENIED' },
  { id: 8, name: 'ID poisoning on order create', operation: 'create', path: '/orders/bad$id', expected: 'PERMISSION_DENIED' },
  { id: 9, name: 'Oversized notes/items array DoW payload', operation: 'create', path: '/orders/ord-1', expected: 'PERMISSION_DENIED' },
  { id: 10, name: 'Non-admin menu price tampering', operation: 'update', path: '/menuItems/item-1', expected: 'PERMISSION_DENIED' },
  { id: 11, name: 'Non-admin WhatsApp number hijacking', operation: 'update', path: '/publicSettings/storefront', expected: 'PERMISSION_DENIED' },
  { id: 12, name: 'Client update/delete on existing order', operation: 'delete', path: '/orders/ord-1', expected: 'PERMISSION_DENIED' },
];
