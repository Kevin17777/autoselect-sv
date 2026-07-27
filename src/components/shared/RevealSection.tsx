import type { ReactNode } from 'react';
import useReveal from '../../hooks/useReveal';

type Props = {
  children: ReactNode;
  className?: string;
  animation?: 'fade-in-down' | 'slide-in-right';
};

export default function RevealSection({ children, className = '', animation = 'fade-in-down' }: Props) {
  const { ref, visible } = useReveal(0.5);
  return (
    <div ref={ref} className={`${className} ${visible ? `animate-${animation}` : 'opacity-0'}`}>
      {children}
    </div>
  );
}
