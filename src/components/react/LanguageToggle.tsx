import { useState } from 'react';
import { motion } from 'framer-motion';

interface LanguageToggleProps {
  locale: string;
}

export default function LanguageToggle({ locale }: LanguageToggleProps) {
  const [hovered, setHovered] = useState<'en' | 'es' | null>(null);

  const enHref = locale === 'en' ? undefined : pathname('en');
  const esHref = locale === 'es' ? undefined : pathname('es');

  function pathname(target: string) {
    if (typeof window === 'undefined') return `/${target}/`;
    const path = window.location.pathname;
    if (target === 'en') return path.replace('/es/', '/') || '/en/';
    return path === '/' ? '/es/' : path.replace('/en/', '/es/');
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1px solid #2a2a2a',
      }}
    >
      <a
        href={locale === 'en' ? undefined : '/en/' + (typeof window !== 'undefined' ? window.location.pathname.replace(/^\/es/, '').replace(/^\//, '') : '')}
        onMouseEnter={() => setHovered('en')}
        onMouseLeave={() => setHovered(null)}
        style={{
          position: 'relative',
          padding: '0.375rem 0.625rem',
          fontSize: '0.6875rem',
          fontWeight: 500,
          letterSpacing: '0.05em',
          color: locale === 'en' ? '#0d0d0d' : '#888888',
          textDecoration: 'none',
          transition: 'color 0.2s',
          zIndex: 1,
        }}
      >
        {locale === 'en' && (
          <motion.div
            layoutId="lang-active"
            style={{
              position: 'absolute',
              inset: 0,
              background: '#f5f5f5',
              borderRadius: '3px',
              zIndex: -1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        EN
      </a>
      <a
        href={locale === 'es' ? undefined : '/es/' + (typeof window !== 'undefined' ? window.location.pathname.replace(/^\/en/, '').replace(/^\//, '') : '')}
        onMouseEnter={() => setHovered('es')}
        onMouseLeave={() => setHovered(null)}
        style={{
          position: 'relative',
          padding: '0.375rem 0.625rem',
          fontSize: '0.6875rem',
          fontWeight: 500,
          letterSpacing: '0.05em',
          color: locale === 'es' ? '#0d0d0d' : '#888888',
          textDecoration: 'none',
          transition: 'color 0.2s',
          zIndex: 1,
        }}
      >
        {locale === 'es' && (
          <motion.div
            layoutId="lang-active"
            style={{
              position: 'absolute',
              inset: 0,
              background: '#f5f5f5',
              borderRadius: '3px',
              zIndex: -1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        ES
      </a>
    </div>
  );
}
