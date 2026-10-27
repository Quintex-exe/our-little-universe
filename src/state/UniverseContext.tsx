import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { universeService as defaultService, type UniverseService } from '../services/data';
import { EMPTY_UNIVERSE, type UniverseData } from '../types/universe';

type Status = 'loading' | 'ready' | 'failed';

interface UniverseContextValue {
  status: Status;
  data: UniverseData;
  nextAdventure(): Promise<void>;
  toggleFavourite(id: string): Promise<void>;
  retry(): void;
}

const UniverseContext = createContext<UniverseContextValue | null>(null);

export function UniverseProvider({ children, service = defaultService }: { children: ReactNode; service?: UniverseService }) {
  const [status, setStatus] = useState<Status>('loading');
  const [data, setData] = useState<UniverseData>(EMPTY_UNIVERSE);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    service
      .getData()
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('failed'));
    return () => {
      cancelled = true;
    };
  }, [service, attempt]);

  const nextAdventure = useCallback(async () => setData(await service.nextAdventure()), [service]);
  const toggleFavourite = useCallback(async (id: string) => setData(await service.toggleFavourite(id)), [service]);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const value = useMemo(
    () => ({ status, data, nextAdventure, toggleFavourite, retry }),
    [status, data, nextAdventure, toggleFavourite, retry],
  );
  return <UniverseContext.Provider value={value}>{children}</UniverseContext.Provider>;
}

export function useUniverse(): UniverseContextValue {
  const ctx = useContext(UniverseContext);
  if (!ctx) throw new Error('useUniverse must be used inside <UniverseProvider>.');
  return ctx;
}
