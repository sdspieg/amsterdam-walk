import { createContext, useContext, useState, useCallback } from 'react';

const LightboxContext = createContext(null);

export function LightboxProvider({ children }) {
  const [state, setState] = useState({ open: false, stop: null, index: 0 });

  const open = useCallback((stop, index = 0) => {
    setState({ open: true, stop, index });
    document.body.style.overflow = 'hidden';
  }, []);
  const close = useCallback(() => {
    setState(s => ({ ...s, open: false }));
    document.body.style.overflow = '';
  }, []);
  const setIndex = useCallback((index) => {
    setState(s => ({ ...s, index }));
  }, []);

  return (
    <LightboxContext.Provider value={{ ...state, open, close, setIndex }}>
      {children}
    </LightboxContext.Provider>
  );
}

export function useLightbox() {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error('useLightbox must be used inside LightboxProvider');
  return ctx;
}
