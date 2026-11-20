import { ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { PRIMARY_ADMIN_EMAIL } from '../firebase';
import { AdminRole, AdminUser, CurrentAdminRole } from '../types/catering';

interface AccessControlPanelProps {
  admins: AdminUser[];
  currentUserEmail: string;
  currentRole: CurrentAdminRole;
  onAddAdmin: (data: {
    email: string;
    displayName: string;
    role: AdminRole;
  }) => Promise<void>;
  onUpdateRole: (emailId: string, role: AdminRole) => Promise<void>;
  onRemoveAdmin: (emailId: string) => Promise<void>;
}

const EMAIL_REGEX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

export function AccessControlPanel({
  admins,
  currentUserEmail,
  currentRole,
  onAddAdmin,
  onUpdateRole,
  onRemoveAdmin,
}: AccessControlPanelProps) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<AdminRole>('manager');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canManageAdmins = currentRole === 'owner' || currentRole === 'admin';
  const normalizedCurrent = currentUserEmail.trim().toLowerCase();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError('Informe um endereço de e-mail Google válido.');
      return;
    }

    if (normalizedEmail === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
      setError('Este e-mail já é o Administrador Principal do sistema.');
      return;
    }

    if (admins.some((a) => a.email.toLowerCase() === normalizedEmail)) {
      setError('Este e-mail já está autorizado na lista de administradores.');
      return;
    }

    setSubmitting(true);
    try {
      await onAddAdmin({
        email: normalizedEmail,
        displayName: displayName.trim(),
        role,
      });
      setEmail('');
      setDisplayName('');
      setRole('manager');
    } catch {
      setError('Não foi possível salvar o administrador. Verifique sua permissão.');
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabel = (r: AdminRole | 'owner') => {
    if (r === 'owner') return 'Administrador Principal';
    if (r === 'admin') return 'Administrador Completo';
    return 'Operador / Gerente';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Add Admin Form / Role Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0B1320] text-[#C9A256] flex items-center justify-center shrink-0">
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-[#0B1320]">
              Autorizar Novo ADM
            </h2>
            <p className="text-xs text-slate-500">
              Libere o login Google em <span className="font-mono">/gerencia</span>.
            </p>
          </div>
        </div>

        {canManageAdmins ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                E-mail Google do Administrador *
              </label>
              <input
                id="admin-email"
                type="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="ex: gerente@gmail.com"
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#F8F9FB] border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="admin-name"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Nome ou Cargo (opcional)
              </label>
              <input
                id="admin-name"
                type="text"
                maxLength={120}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ex: Maria · Comissaria Hangar"
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#F8F9FB] border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="admin-role"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Nível de Permissão
              </label>
              <select
                id="admin-role"
                value={role}
                onChange={(e) => setRole(e.target.value as AdminRole)}
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#F8F9FB] border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1320] focus:bg-white"
              >
                <option value="manager">
                  Operador / Gerente (Pedidos, Relatórios e Cardápio)
                </option>
                <option value="admin">
                  Administrador Completo (Tudo + Equipe)
                </option>
              </select>
            </div>

            {error && (
              <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[46px] py-2.5 px-4 bg-[#0B1320] hover:bg-[#162238] active:scale-[0.98] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition cursor-pointer"
            >
              {submitting ? 'Autorizando...' : 'Autorizar Administrador'}
            </button>
          </form>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 leading-relaxed">
            Você está conectado como{' '}
            <strong className="text-slate-900">Operador / Gerente</strong>. Apenas{' '}
            <strong className="text-slate-900">Administradores Completos</strong>{' '}
            ou o Administrador Principal podem adicionar ou remover acessos.
          </div>
        )}
      </div>

      {/* Authorized Admins List */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-slate-700" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Administradores Autorizados ({admins.length + 1})
              </h3>
              <p className="text-xs text-slate-500">
                Somente estes e-mails Google conseguem acessar o painel de gerência.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Primary Owner Row */}
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {PRIMARY_ADMIN_EMAIL}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Conta raiz do sistema · Acesso permanente
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg self-start sm:self-center shrink-0">
              {roleLabel('owner')}
            </span>
          </div>

          {admins.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Nenhum administrador adicional cadastrado ainda. Use o formulário ao lado para autorizar outra conta Google.
            </div>
          ) : (
            admins.map((admin) => {
              const isSelf = admin.email.toLowerCase() === normalizedCurrent;
              return (
                <div
                  key={admin.email}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {admin.email}
                      {isSelf && (
                        <span className="ml-2 text-xs font-medium text-slate-500">
                          (você)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {admin.displayName ? `${admin.displayName} · ` : ''}
                      Autorizado em{' '}
                      {new Date(admin.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-center shrink-0">
                    {canManageAdmins && !isSelf ? (
                      <>
                        <select
                          aria-label={`Nível de acesso de ${admin.email}`}
                          value={admin.role}
                          onChange={(e) =>
                            onUpdateRole(admin.email, e.target.value as AdminRole)
                          }
                          className="flex-1 sm:flex-initial min-h-[42px] px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm sm:text-xs font-semibold text-[#0B1320] focus:outline-none focus:ring-2 focus:ring-[#0B1320]"
                        >
                          <option value="manager">Operador / Gerente</option>
                          <option value="admin">Administrador Completo</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => onRemoveAdmin(admin.email)}
                          title="Revogar acesso"
                          aria-label={`Revogar acesso de ${admin.email}`}
                          className="w-11 h-11 flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {roleLabel(admin.role)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
