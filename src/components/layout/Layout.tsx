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
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = pathname === '/';
  const isWatchPage = pathname.startsWith('/xem');

  return (
    <div className="relative flex flex-col min-h-screen bg-[#050507] text-[#FFFFFF] overflow-x-hidden selection:bg-white selection:text-[#070709]">
      {/* Subtle Cinema Film Grain & Silver-White Ambient Spatial Diffusion Orbs */}
      <div className="cinema-grain" />
      <div
        className="ambient-orb w-[620px] h-[620px] -top-32 left-1/4"
        style={{ background: 'rgba(255, 255, 255, 0.055)' }}
      />
      <div
        className="ambient-orb w-[520px] h-[520px] top-1/2 -right-28"
        style={{ background: 'rgba(235, 235, 240, 0.04)', animationDelay: '-7s' }}
      />
      <div
        className="ambient-orb w-[500px] h-[500px] -bottom-24 -left-24"
        style={{ background: 'rgba(255, 255, 255, 0.045)', animationDelay: '-13s' }}
      />

      <Header isScrolled={isScrolled} />

      <main
        className={`relative z-10 flex-1 w-full ${
          isHomePage
            ? 'w-full'
            : isWatchPage
            ? 'w-full pt-16 sm:pt-20 md:pt-24 pb-12'
            : 'max-w-[1680px] mx-auto px-4 sm:px-8 md:px-12 pt-24 sm:pt-28 pb-12'
        }`}
      >
        {children}
      </main>

      <Footer />
    </div>
  );
};
