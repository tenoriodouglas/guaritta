import { Bell, Car, DoorOpen, LogOut, Package, ShieldCheck, Users } from 'lucide-react';
import { type ComponentType, useEffect, useState } from 'react';
import { usePendingAccess } from './api/queries';
import { useAuth } from './auth/AuthContext';
import { Button, cx } from './components/ui';
import { AccessView } from './features/access/AccessView';
import { DeliveriesView } from './features/deliveries/DeliveriesView';
import { VehiclesView } from './features/vehicles/VehiclesView';
import { VisitorsView } from './features/visitors/VisitorsView';
import { useAccessStream } from './hooks/useAccessStream';
import { LoginPage } from './LoginPage';

type Tab = 'access' | 'visitors' | 'deliveries' | 'vehicles';

const TABS: { id: Tab; label: string; icon: ComponentType<{ className?: string }>; view: ComponentType }[] = [
  { id: 'access', label: 'Acessos', icon: DoorOpen, view: AccessView },
  { id: 'visitors', label: 'Visitantes', icon: Users, view: VisitorsView },
  { id: 'deliveries', label: 'Encomendas', icon: Package, view: DeliveriesView },
  { id: 'vehicles', label: 'Veículos', icon: Car, view: VehiclesView },
];

export function App() {
  const { token } = useAuth();
  return token ? <Console token={token} /> : <LoginPage />;
}

function Console({ token }: { token: string }) {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('access');
  const connected = useAccessStream(token);
  const { data: pending = [] } = usePendingAccess();
  const View = TABS.find((t) => t.id === tab)!.view;

  // Pending count in the browser tab title so the operator notices from other windows.
  useEffect(() => {
    document.title = pending.length ? `(${pending.length}) Guaritta · Portaria` : 'Guaritta · Portaria';
  }, [pending.length]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-6 text-sky-400" />
            <span className="text-lg font-bold">Guaritta</span>
          </div>
          <nav className="flex flex-1 flex-wrap gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cx(
                  'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                  tab === id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white',
                )}
              >
                <Icon className="size-4" />
                {label}
                {id === 'access' && pending.length > 0 && (
                  <span className="rounded-full bg-amber-500 px-1.5 text-xs font-bold text-slate-950">
                    {pending.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <span
            className={cx(
              'inline-flex items-center gap-1.5 text-xs',
              connected ? 'text-emerald-400' : 'text-rose-400',
            )}
            title="Conexão em tempo real"
          >
            <span
              className={cx(
                'size-2 rounded-full',
                connected ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse',
              )}
            />
            {connected ? 'Ao vivo' : 'Reconectando'}
          </span>
          {'Notification' in window && Notification.permission === 'default' && (
            <Button
              variant="ghost"
              onClick={() => void Notification.requestPermission()}
              title="Ativar alertas"
            >
              <Bell className="size-4" />
            </Button>
          )}
          <span className="text-xs text-slate-400">
            {user?.role === 'ADMIN' ? 'Administrador' : 'Porteiro'}
          </span>
          <Button variant="ghost" onClick={logout} title="Sair">
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4">
        <View />
      </main>
    </div>
  );
}
