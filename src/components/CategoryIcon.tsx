import {
  Coffee,
  Croissant,
  CupSoda,
  Droplets,
  Sandwich,
  Salad,
  CakeSlice,
} from 'lucide-react';
import { IconKey } from '../types/catering';

interface CategoryIconProps {
  iconKey: IconKey;
  className?: string;
}

export function CategoryIcon({ iconKey, className = 'w-5 h-5' }: CategoryIconProps) {
  switch (iconKey) {
    case 'pastry':
      return <Croissant className={className} />;
    case 'sandwich':
      return <Sandwich className={className} />;
    case 'beverage':
      return <CupSoda className={className} />;
    case 'coffee':
      return <Coffee className={className} />;
    case 'water':
      return <Droplets className={className} />;
    case 'meal':
      return <Salad className={className} />;
    case 'dessert':
      return <CakeSlice className={className} />;
    default:
      return <Croissant className={className} />;
  }
}
