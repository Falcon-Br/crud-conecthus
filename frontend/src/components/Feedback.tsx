import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle, X } from 'lucide-react';
const ToastContext = createContext<(message: string) => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  function notify(text: string) {
    clearTimeout(timer.current);
    setMessage(text);
    timer.current = setTimeout(() => setMessage(''), 6000);
  }
  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {message && (
          <div className="toast">
            <CheckCircle2 size={20} />
            <span>{message}</span>
            <button
              className="icon-button"
              onClick={() => setMessage('')}
              aria-label="Fechar notificação"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);
export function Loading({ label = 'Carregando informações…' }: { label?: string }) {
  return (
    <div className="state-panel" role="status">
      <LoaderCircle className="spin" size={25} />
      <p>{label}</p>
    </div>
  );
}
export function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="state-panel" role="alert">
      <AlertCircle size={30} />
      <h2>Não foi possível carregar</h2>
      <p>{message}</p>
      <button className="button secondary" onClick={retry}>
        Tentar novamente
      </button>
    </div>
  );
}
