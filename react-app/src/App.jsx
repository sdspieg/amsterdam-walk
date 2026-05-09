import { Outlet, useLocation } from 'react-router-dom';
import TopNav from './components/TopNav';
import Footer from './components/Footer';
import Lightbox from './components/Lightbox';
import { useEffect } from 'react';
import { LightboxProvider } from './components/LightboxContext';

export default function App() {
  const location = useLocation();
  /* Scroll to top whenever the route changes — eliminates the "scroll-between-stops" feeling. */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <LightboxProvider>
      <a className="skip-link" href="#main">Skip to content</a>
      <TopNav />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <Lightbox />
    </LightboxProvider>
  );
}
