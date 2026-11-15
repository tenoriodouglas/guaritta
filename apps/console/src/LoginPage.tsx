import { ShieldCheck } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useAuth } from './auth/AuthContext';
import { Button, ErrorText, Field, Input } from './components/ui';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <form
        onSubmit={submit}
        className="grid w-full max-w-sm gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-8"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-7 text-sky-400" />
          <h1 className="text-2xl font-bold">Guaritta</h1>
        </div>
        <p className="text-sm text-slate-400">Console da portaria</p>
        <Field label="E-mail">
          <Input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Senha">
          <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Button type="submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
        <ErrorText error={error} />
      </form>
    </main>
  );
}
