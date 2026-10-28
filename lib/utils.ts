import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function triggerConfetti() {
  if (typeof window !== 'undefined') {
    import('canvas-confetti').then((confettiModule) => {
      const confetti = confettiModule.default || confettiModule;
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#6366f1', '#06b6d4', '#f59e0b'],
      });
    }).catch(err => console.log('Confetti error:', err));
  }
}
