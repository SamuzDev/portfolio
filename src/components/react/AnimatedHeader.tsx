import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

interface AnimatedHeaderProps {
  locale: string;
  navAbout: string;
  navWorks: string;
  navContact: string;
}

export default function AnimatedHeader({ locale, navAbout, navWorks, navContact }: AnimatedHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('top');
  const otherLocale = locale === 'en' ? 'es' : 'en';
  const { colors } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -60% 0px' }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const navItems = [
    { label: navAbout, href: `/${locale}/#about`, sectionId: 'about' },
    { label: navWorks, href: `/${locale}/#works`, sectionId: 'works' },
    { label: navContact, href: `/${locale}/#contact`, sectionId: 'contact' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: scrolled ? colors.bgElevated : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? `1px solid ${colors.border}` : '1px solid transparent',
          transition: 'background 0.3s, border-color 0.3s, backdrop-filter 0.3s',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '0 clamp(1.5rem, 3vw, 2.5rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '72px',
          }}
        >
          <a
            href={`/${locale}/`}
            className="logo-wordmark"
            style={{ textDecoration: 'none', color: colors.fg }}
          >
            JG
          </a>

          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${activeSection === item.sectionId ? 'active' : ''}`}
                  style={{
                    color: activeSection === item.sectionId ? colors.fg : colors.fgMuted,
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <a
              href={`/${otherLocale}/`}
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: colors.fgMuted,
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.fg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.fgMuted;
              }}
            >
              {otherLocale.toUpperCase()}
            </a>
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              background: 'transparent',
              border: `1px solid ${colors.border}`,
              borderRadius: '100px',
              cursor: 'pointer',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.fg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="mobile-menu-panel"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '280px',
              maxWidth: '80vw',
              background: colors.bgElevated,
              borderLeft: `1px solid ${colors.border}`,
              zIndex: 100,
              padding: '80px 2rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: activeSection === item.sectionId ? colors.fg : colors.fgMuted,
                  textDecoration: 'none',
                  padding: '0.5rem 0',
                  borderBottom: `1px solid ${colors.border}`,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  transition: 'color 0.2s',
                }}
              >
                {item.label}
              </a>
            ))}

            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: `1px solid ${colors.border}` }}>
              <a
                href={`/${otherLocale}/`}
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: colors.fgMuted,
                  textDecoration: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.fg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.fgMuted;
                }}
              >
                {otherLocale.toUpperCase()}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 90,
          }}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}