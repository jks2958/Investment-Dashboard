import {
  Car,
  Film,
  Heart,
  Home,
  MoreHorizontal,
  Phone,
  Plane,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  groceries: ShoppingCart,
  grocery: ShoppingCart,
  travel: Plane,
  phone: Phone,
  rent: Home,
  housing: Home,
  utilities: Zap,
  dining: Utensils,
  food: Utensils,
  restaurants: Utensils,
  entertainment: Film,
  shopping: ShoppingBag,
  health: Heart,
  healthcare: Heart,
  transport: Car,
  transportation: Car,
  others: MoreHorizontal,
  other: MoreHorizontal,
};

export function iconForCategory(category: string): LucideIcon {
  return CATEGORY_ICONS[category.trim().toLowerCase()] ?? Tag;
}
