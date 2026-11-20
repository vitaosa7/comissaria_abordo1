import { useEffect, useState } from 'react';
import { IconKey } from '../types/catering';
import { CategoryIcon } from './CategoryIcon';

interface MenuItemImageProps {
  src?: string;
  alt: string;
  iconKey: IconKey;
  className?: string;
  iconClassName?: string;
}

export function MenuItemImage({
  src,
  alt,
  iconKey,
  className = 'w-full aspect-[4/3]',
  iconClassName = 'w-8 h-8',
}: MenuItemImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-[#0B1320]/5 to-[#C9A256]/15 text-[#0B1320]/60 flex flex-col items-center justify-center gap-1.5 select-none`}
      >
        <CategoryIcon iconKey={iconKey} className={iconClassName} />
      </div>
    );
  }

  return (
    <div className={`${className} bg-slate-100 overflow-hidden`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}
