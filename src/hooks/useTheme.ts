import { useState, useEffect } from 'react';

interface ThemeColors {
  bg: string;
  bgElevated: string;
  bgHover: string;
  border: string;
  borderHover: string;
  fg: string;
  fgMuted: string;
  fgSubtle: string;
  card: string;
}

function getComputedColors(): ThemeColors {
  if (typeof window === 'undefined') {
    return {
      bg: '#f7f7f7',
      bgElevated: '#ececec',
      bgHover: '#e0e0e0',
      border: '#d4d4d4',
      borderHover: '#b0b0b0',
      fg: '#1a1a1a',
      fgMuted: '#555555',
      fgSubtle: '#888888',
      card: 'rgba(0,0,0,0.03)',
    };
  }
  const style = getComputedStyle(document.documentElement);
  return {
    bg: style.getPropertyValue('--color-bg').trim() || '#f7f7f7',
    bgElevated: style.getPropertyValue('--color-bg-elevated').trim() || '#ececec',
    bgHover: style.getPropertyValue('--color-bg-hover').trim() || '#e0e0e0',
    border: style.getPropertyValue('--color-border').trim() || '#d4d4d4',
    borderHover: style.getPropertyValue('--color-border-hover').trim() || '#b0b0b0',
    fg: style.getPropertyValue('--color-fg').trim() || '#1a1a1a',
    fgMuted: style.getPropertyValue('--color-fg-muted').trim() || '#555555',
    fgSubtle: style.getPropertyValue('--color-fg-subtle').trim() || '#888888',
    card: style.getPropertyValue('--color-card').trim() || 'rgba(0,0,0,0.03)',
  };
}

export function useTheme() {
  const [isDark, setIsDark] = useState(false);
  const [colors, setColors] = useState<ThemeColors>(getComputedColors());

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches);
    setColors(getComputedColors());

    const handler = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      setColors(getComputedColors());
    };

    mq.addEventListener('change', handler);

    const observer = new MutationObserver(() => {
      setColors(getComputedColors());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });

    return () => {
      mq.removeEventListener('change', handler);
      observer.disconnect();
    };
  }, []);

  return { isDark, colors };
}
