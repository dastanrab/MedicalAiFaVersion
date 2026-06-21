import {
  Home,
  Sparkles,
  Stethoscope,
  User,
  MessageCircle,
  Calendar,
  UtensilsCrossed,
  Ruler,
  HeartPulse,
  Crown,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

export const mainNavItems: NavItem[] = [
  { icon: Home, label: 'خانه', path: '/home' },
  { icon: Sparkles, label: 'تشخیص هوشمند', path: '/symptoms' },
  { icon: Stethoscope, label: 'پزشکان', path: '/doctors' },
  { icon: User, label: 'پروفایل', path: '/profile' },
];

export const sidebarNavItems: NavItem[] = [
  ...mainNavItems,
  { icon: HeartPulse, label: 'خدمات درمانی', path: '/services' },
  { icon: MessageCircle, label: 'پیام‌ها', path: '/chats' },
  { icon: Calendar, label: 'تقویم قاعدگی', path: '/period-tracker' },
  { icon: Ruler, label: 'اندازه‌گیری بدن', path: '/body-measurement' },
  { icon: UtensilsCrossed, label: 'برنامه غذایی', path: '/meal-plan' },
  { icon: Crown, label: 'پلن‌ها', path: '/plans' },
  { icon: Wallet, label: 'مالی', path: '/finance' },
];
