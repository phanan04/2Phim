import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-[#0E0E10] text-[#F5F5F7] overflow-x-hidden">
      <Header isScrolled={isScrolled} />
      <main className={`flex-1 w-full ${isHomePage ? 'w-full' : 'max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 pt-24 sm:pt-28 pb-12'}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};
