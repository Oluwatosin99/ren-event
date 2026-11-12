import type { MenuSubCat } from '~/server/utils/db'

export interface SubCatMeta {
  id: MenuSubCat
  label: string
  shortLabel: string
  badgeClass: string
  gradientClass: string
}

export const SUBCAT_META: Record<MenuSubCat, SubCatMeta> = {
  rice: {
    id: 'rice',
    label: 'Rice Specialties',
    shortLabel: 'Rice',
    badgeClass: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
    gradientClass: 'from-emerald-700 via-emerald-600 to-orange-500'
  },
  swallow: {
    id: 'swallow',
    label: 'Soups & Swallows',
    shortLabel: 'Soups & Swallow',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    gradientClass: 'from-emerald-800 via-teal-700 to-yellow-600'
  },
  noodles: {
    id: 'noodles',
    label: 'Wok & Noodles',
    shortLabel: 'Noodles',
    badgeClass: 'bg-yellow-400/20 text-yellow-800 dark:text-yellow-300 border-yellow-500/30',
    gradientClass: 'from-orange-600 via-amber-500 to-red-600'
  },
  protein: {
    id: 'protein',
    label: 'Proteins & Prawns',
    shortLabel: 'Proteins',
    badgeClass: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
    gradientClass: 'from-red-700 via-orange-600 to-yellow-500'
  },
  sauce: {
    id: 'sauce',
    label: 'Sauces & Sides',
    shortLabel: 'Sauces',
    badgeClass: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
    gradientClass: 'from-amber-600 via-orange-600 to-emerald-700'
  },
  other: {
    id: 'other',
    label: 'Other / Chef Combos',
    shortLabel: 'Combos',
    badgeClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
    gradientClass: 'from-slate-700 via-emerald-700 to-orange-600'
  }
}

export const SUBCAT_OPTIONS: SubCatMeta[] = [
  SUBCAT_META.rice,
  SUBCAT_META.swallow,
  SUBCAT_META.noodles,
  SUBCAT_META.protein,
  SUBCAT_META.sauce,
  SUBCAT_META.other
]

export const QUICK_FLAVOR_TAGS = {
  nigerian: ['All', 'Jollof Rice', 'Coconut Rice', 'Ofada Rice', 'Afang Soup', 'Egusi Soup', 'Native Soup (Banga)', 'Amala'],
  continental: ['All', 'Oriental Fried Rice', 'Special Fried Rice', 'Jambalaya Rice', 'Singapore Noodles', 'Buttery Prawns', 'Garlic Butter Prawns', 'Beef Curry', 'Chicken Curry']
}

export const CURATED_PHOTO_PRESETS = [
  { label: 'Jollof Rice', url: '/images/menu/jollof-rice.jpg' },
  { label: 'Jollof & Coconut Rice', url: '/images/menu/jollof-coconut.jpg' },
  { label: 'Fried Rice', url: '/images/menu/fried-rice.jpg' },
  { label: 'Coconut Rice', url: '/images/menu/coconut-rice.jpg' },
  { label: 'Ofada Rice', url: '/images/menu/ofada-rice.jpg' },
  { label: 'Afang Soup', url: '/images/menu/afang-soup.jpg' },
  { label: 'Egusi Soup', url: '/images/menu/egusi-soup.jpg' },
  { label: 'Banga Soup', url: '/images/menu/banga-soup.jpg' },
  { label: 'Amala & Ewedu', url: '/images/menu/amala-ewedu.jpg' },
  { label: 'Oriental Fried Rice + Prawns', url: '/images/menu/oriental-prawns.jpg' },
  { label: 'Jambalaya Rice', url: '/images/menu/jambalaya-rice.jpg' },
  { label: 'Singapore Noodles', url: '/images/menu/singapore-noodles.jpg' },
  { label: 'Beef Curry Sauce', url: '/images/menu/beef-curry.jpg' },
  { label: 'Chicken Curry Sauce', url: '/images/menu/chicken-curry.jpg' },
  { label: 'Garlic Butter Prawns', url: '/images/menu/prawns-curry.jpg' }
]

