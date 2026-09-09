import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroAnimationProps {
  name: string;
  onComplete: () => void;
}

const STORAGE_KEY = 'intro-animation-seen';

function getThemeColors() {
  if (typeof window === 'undefined') {
    return { bg: '#f7f7f7', fg: '#1a1a1a', fgSubtle: '#888888', border: '#d4d4d4' };
  }
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const style = getComputedStyle(document.documentElement);
  return {
    bg: style.getPropertyValue('--color-bg').trim() || (isDark ? '#0a0a0a' : '#f7f7f7'),
    fg: style.getPropertyValue('--color-fg').trim() || (isDark ? '#e8e8e8' : '#1a1a1a'),
    fgSubtle: style.getPropertyValue('--color-fg-subtle').trim() || (isDark ? '#666666' : '#888888'),
    border: style.getPropertyValue('--color-border').trim() || (isDark ? '#222222' : '#d4d4d4'),
  };
}

function hasSeenIntro(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function markIntroSeen() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {}
}

export default function IntroAnimation({ name, onComplete }: IntroAnimationProps) {
  const [phase, setPhase] = useState<'loading' | 'reveal' | 'done'>('loading');
  const [progress, setProgress] = useState(0);
  const [colors, setColors] = useState(getThemeColors());
  const [mounted, setMounted] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    if (hasSeenIntro()) {
      setShouldAnimate(false);
      onComplete();
      return;
    }

    setColors(getThemeColors());
    markIntroSeen();

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setColors(getThemeColors());
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [onComplete]);

  useEffect(() => {
    if (!shouldAnimate) return;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setPhase('reveal'), 200);
          setTimeout(() => {
            setPhase('done');
            onComplete();
          }, 1400);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [onComplete, shouldAnimate]);

  if (!mounted || !shouldAnimate) {
    return null;
  }

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: colors.bg,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
            }}
          >
            <motion.p
              style={{
                fontSize: '0.75rem',
                fontFamily: '"Inter", system-ui, sans-serif',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: colors.fgSubtle,
                margin: 0,
              }}
            >
              {phase === 'loading' ? 'loading' : 'welcome'}
            </motion.p>

            <motion.h1
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                fontFamily: '"Inter", system-ui, sans-serif',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: colors.fg,
                margin: 0,
              }}
            >
              {name}
            </motion.h1>

            <div
              style={{
                width: '120px',
                height: '2px',
                background: colors.border,
                borderRadius: '1px',
                overflow: 'hidden',
              }}
            >
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
                style={{
                  height: '100%',
                  background: colors.fg,
                  borderRadius: '1px',
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}