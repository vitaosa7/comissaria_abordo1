# Security Specification — Comissaria Hangar (Multi-Admin RBAC)

## 1. Data Invariants
1. **Tiered Admin Access Control**: Only `vitaosa7@gmail.com` (Primary Owner) or verified emails present in `/admins/{emailLower}` may access `/orders`, `/menuItems` writes, or `/publicSettings` writes.
2. **Privilege Escalation Prevention**: Only `isFullAdmin()` (`owner` or `/admins/{email}` with `role == 'admin'`) can create, update roles for, or remove records in `/admins/{emailId}`. A `'manager'` role cannot promote themselves or modify admin permissions.
3. **Email Spoofing Prevention**: All admin checks enforce `request.auth.token.email_verified == true`.
4. **Public Order Integrity**: Public storefront order creation is strictly locked to `status == 'Enviado no WhatsApp'`, `createdAt == request.time`, bounded string/item lengths, and allowlisted keys.
5. **Owner Protection**: `/admins/vitaosa7@gmail.com` cannot be deleted or modified, and no admin can delete their own `/admins/{email}` record.

## 2. Dirty Dozen Attack Payloads (All Must Return PERMISSION_DENIED)
1. **Unauthenticated `list` on `/orders`**: Client tries to scrape all aircraft orders.
2. **Non-admin `get` on `/orders/{id}`**: Regular Google user not in `/admins` tries to read an order.
3. **Unverified Admin Email Spoof**: Token with `email_verified: false` tries to access `/orders` or `/admins`.
4. **Self-Assigned Admin**: Non-admin user writes `{ email, role: "admin" }` to `/admins/{theirEmail}`.
5. **Manager Self-Promotion**: User with `role: "manager"` tries to update `/admins/{theirEmail}` to `role: "admin"`.
6. **Cross-Email Admin Hijack**: Admin document ID doesn't match `data.email.lower()`.
7. **Order Status Bypass on Create**: Client creates `/orders/ord-1` with `status: "Entregue na Aeronave"`.
8. **Shadow Field Injection on Order Create**: Client adds `isPaid: true` to `/orders/ord-1`.
9. **Timestamp Forgery on Order Create**: Client passes backdated `createdAt` instead of `request.time`.
10. **Oversized Order Payload (DoW)**: Client sends `notes` with 2,000 characters or `items` array with 100 items.
11. **Non-Admin Menu/WhatsApp Tampering**: Client updates `/menuItems/item-1` or `/publicSettings/storefront`.
12. **Primary Admin Deletion Attempt**: Invited `admin` attempts `delete` on `/admins/vitaosa7@gmail.com` or their own record.
