import { createContext, useContext, useState, useCallback } from 'react';

const LightboxContext = createContext(null);

export function LightboxProvider({ children }) {
  const [state, setState] = useState({ isOpen: false, stop: null, index: 0 });

  const openLightbox = useCallback((stop, index = 0) => {
    setState({ isOpen: true, stop, index });
    document.body.style.overflow = 'hidden';
  }, []);
  const closeLightbox = useCallback(() => {
    setState(s => ({ ...s, isOpen: false }));
    document.body.style.overflow = '';
  }, []);
  const setIndex = useCallback((index) => {
    setState(s => ({ ...s, index }));
  }, []);

  return (
    <LightboxContext.Provider value={{
      isOpen: state.isOpen,
      stop: state.stop,
      index: state.index,
      open: openLightbox,
      close: closeLightbox,
      setIndex,
    }}>
      {children}
    </LightboxContext.Provider>
  );
}

export function useLightbox() {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error('useLightbox must be used inside LightboxProvider');
  return ctx;
}
