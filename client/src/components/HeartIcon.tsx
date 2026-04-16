import { useState } from 'react';

interface HeartIconProps {
  filled: boolean;
  onClick?: (e: React.MouseEvent) => void;
  size?: number;
}

export default function HeartIcon({ filled, onClick, size = 24 }: HeartIconProps) {
  const [animate, setAnimate] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 400);
    onClick?.(e);
  };

  return (
    <button
      onClick={handleClick}
      className="cursor-pointer bg-transparent border-none p-0 flex items-center justify-center"
      aria-label={filled ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        fill={filled ? '#63D838' : 'none'}
        stroke={filled ? 'none' : '#D1D5DB'}
        strokeWidth={filled ? 0 : 1.5}
        style={{
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), fill 0.2s ease, stroke 0.2s ease',
          transform: animate ? 'scale(1.35)' : 'scale(1)',
        }}
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </button>
  );
}
