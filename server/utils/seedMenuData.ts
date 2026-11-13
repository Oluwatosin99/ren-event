import type { MenuItem, MenuSubCat } from './db'

export type SeedMenuRow = [
  id: string,
  cat: 'nigerian' | 'continental',
  subCat: MenuSubCat,
  name: string,
  description: string,
  vendor: string,
  image: string,
  stock: number,
  initialStock: number,
  threshold: number,
  manualClosed: number,
  popular: number,
  spicy: number
]

export const SEED_MENU_DATA: SeedMenuRow[] = [
  // Nigerian Meal Preferences (15 items)
  ['nig_1', 'nigerian', 'rice', 'Jollof Rice + Fried Rice', 'Smoky party firewood Jollof paired with rich Nigerian vegetable fried rice.', 'Lagos Royal Kitchens', '/images/menu/jollof-rice.jpg', 180, 220, 10, 0, 1, 1],
  ['nig_2', 'nigerian', 'rice', 'Jollof Rice + Coconut Rice', 'Classic smoky Jollof served alongside creamy aromatic coconut infused rice.', 'Lagos Royal Kitchens', '/images/menu/jollof-coconut.jpg', 95, 120, 10, 0, 1, 0],
  ['nig_3', 'nigerian', 'rice', 'Fried Rice + Coconut Rice', 'Savory Nigerian liver & sweetcorn fried rice paired with fragrant coconut rice.', 'Lagos Royal Kitchens', '/images/menu/coconut-rice.jpg', 70, 90, 8, 0, 0, 0],
  ['nig_4', 'nigerian', 'rice', 'Ofada Rice + Sauce', 'Local unpolished heritage Ofada rice with rich designer green pepper Ayamase sauce.', 'Iya Oyo Heritage Caterers', '/images/menu/ofada-rice.jpg', 60, 100, 8, 0, 1, 1],
  ['nig_5', 'nigerian', 'swallow', 'Afang Soup + Garri', 'Freshly pounded Afang & waterleaf simmered with periwinkles, stockfish & yellow Garri.', 'Calabar Pot Caterers', '/images/menu/afang-soup.jpg', 65, 80, 5, 0, 0, 0],
  ['nig_6', 'nigerian', 'swallow', 'Afang Soup + Semovita', 'Traditional rich Afang soup served with smooth, hot Semovita swallow.', 'Calabar Pot Caterers', '/images/menu/afang-soup.jpg', 50, 60, 5, 0, 0, 0],
  ['nig_7', 'nigerian', 'swallow', 'Afang Soup + Fufu', 'Authentic Efik Afang soup served with soft, traditional cassava Fufu.', 'Calabar Pot Caterers', '/images/menu/afang-soup.jpg', 45, 50, 5, 0, 0, 0],
  ['nig_8', 'nigerian', 'swallow', 'Egusi Soup + Garri', 'Toasted melon seed Egusi soup cooked with ugu leaves, stockfish & golden Eba (Garri).', 'Iya Oyo Heritage Caterers', '/images/menu/egusi-soup.jpg', 80, 100, 8, 0, 1, 0],
  ['nig_9', 'nigerian', 'swallow', 'Egusi Soup + Semovita', 'Rich slow-simmered Egusi melon soup paired with fluffy Semovita.', 'Iya Oyo Heritage Caterers', '/images/menu/egusi-soup.jpg', 60, 75, 5, 0, 0, 0],
  ['nig_10', 'nigerian', 'swallow', 'Egusi Soup + Fufu', 'Hearty Nigerian Egusi soup with leafy greens and soft Fufu swallow.', 'Iya Oyo Heritage Caterers', '/images/menu/egusi-soup.jpg', 40, 50, 5, 0, 0, 0],
  ['nig_11', 'nigerian', 'swallow', 'Native Soup (Banga) + Garri', 'Delta-style palm nut Banga soup infused with Beletete spice & yellow Garri.', 'Delta Spice Collective', '/images/menu/banga-soup.jpg', 55, 70, 5, 0, 0, 0],
  ['nig_12', 'nigerian', 'swallow', 'Native Soup (Banga) + Semo', 'Aromatic Niger-Delta Banga soup paired with smooth Semovita.', 'Delta Spice Collective', '/images/menu/banga-soup.jpg', 45, 60, 5, 0, 0, 0],
  ['nig_13', 'nigerian', 'swallow', 'Native Soup (Banga) + Fufu', 'Rich palm fruit Banga soup served hot with traditional Fufu.', 'Delta Spice Collective', '/images/menu/banga-soup.jpg', 8, 45, 10, 0, 0, 0],
  ['nig_14', 'nigerian', 'swallow', 'Gbegiri + Amala', 'Velvety slow-cooked honey bean Gbegiri soup with rich buka stew & hot dark Amala.', 'Iya Oyo Heritage Caterers', '/images/menu/amala-ewedu.jpg', 90, 110, 10, 0, 1, 1],
  ['nig_15', 'nigerian', 'swallow', 'Ewedu + Amala', 'Traditional smooth jute-leaf Ewedu & pepper stew paired with fluffy Amala.', 'Iya Oyo Heritage Caterers', '/images/menu/amala-ewedu.jpg', 85, 100, 10, 0, 1, 0],

  // Continental Meal Preferences (16 items)
  ['cont_1', 'continental', 'rice', 'Oriental Fried Rice + Buttery Prawns', 'Wok-tossed basmati rice with sesame & scallions, topped with jumbo butter-poached prawns.', 'Victoria Island Bistro', '/images/menu/oriental-prawns.jpg', 85, 100, 10, 0, 1, 0],
  ['cont_2', 'continental', 'rice', 'Oriental Fried Rice + Garlic Butter Prawns', 'Fragrant Asian-style fried rice served with roasted garlic & herb king prawns.', 'Victoria Island Bistro', '/images/menu/prawns-curry.jpg', 60, 80, 8, 0, 0, 0],
  ['cont_3', 'continental', 'rice', 'Oriental Fried Rice + Beef Curry Sauce', 'Wok-seared Oriental basmati rice paired with tender prime beef strips in velvety curry.', 'Victoria Island Bistro', '/images/menu/beef-curry.jpg', 75, 90, 8, 0, 0, 0],
  ['cont_4', 'continental', 'rice', 'Oriental Fried Rice + Chicken Curry Sauce', 'Golden wok fried rice with supreme chicken breast simmered in aromatic golden curry.', 'Victoria Island Bistro', '/images/menu/chicken-curry.jpg', 90, 110, 10, 0, 0, 0],
  ['cont_5', 'continental', 'rice', 'Special Fried Rice + Buttery Prawns', 'Chef signature special basmati fried rice with pan-seared buttery tiger prawns.', 'Eko Continental Culinary', '/images/menu/fried-rice.jpg', 55, 85, 8, 0, 0, 0],
  ['cont_6', 'continental', 'rice', 'Special Fried Rice + Garlic Butter Prawns', 'Loaded special basmati rice paired with sizzling lemon-garlic butter prawns.', 'Eko Continental Culinary', '/images/menu/oriental-prawns.jpg', 50, 70, 6, 0, 0, 0],
  ['cont_7', 'continental', 'rice', 'Special Fried Rice + Beef Curry Sauce', 'Signature special fried rice served with slow-braised tenderloin beef curry.', 'Eko Continental Culinary', '/images/menu/beef-curry.jpg', 65, 80, 8, 0, 0, 0],
  ['cont_8', 'continental', 'rice', 'Special Fried Rice + Chicken Curry Sauce', 'Special vegetable & shrimp fried rice topped with rich coconut chicken curry.', 'Eko Continental Culinary', '/images/menu/chicken-curry.jpg', 80, 95, 8, 0, 0, 0],
  ['cont_9', 'continental', 'rice', 'Jambalaya Rice + Buttery Prawns', 'Cajun-spiced Creole Jambalaya rice with roasted peppers & buttery jumbo prawns.', 'Victoria Island Bistro', '/images/menu/jambalaya-rice.jpg', 65, 80, 6, 0, 1, 1],
  ['cont_10', 'continental', 'rice', 'Jambalaya Rice + Garlic Butter Prawns', 'Richly seasoned Jambalaya rice served with succulent garlic herb prawns.', 'Victoria Island Bistro', '/images/menu/jambalaya-rice.jpg', 50, 65, 6, 0, 0, 0],
  ['cont_11', 'continental', 'rice', 'Jambalaya Rice + Beef Curry Sauce', 'Spiced Creole Jambalaya rice paired with tender beef strips in savory curry sauce.', 'Victoria Island Bistro', '/images/menu/beef-curry.jpg', 45, 60, 6, 0, 0, 1],
  ['cont_12', 'continental', 'rice', 'Jambalaya Rice + Chicken Curry Sauce', 'Signature Jambalaya rice served with succulent spiced chicken curry sauce.', 'Victoria Island Bistro', '/images/menu/chicken-curry.jpg', 55, 70, 6, 0, 0, 0],
  ['cont_13', 'continental', 'noodles', 'Singapore Noodles + Buttery Prawns', 'Fine rice vermicelli stir-fried with curry spices, julienne veggies & buttery prawns.', 'Eko Continental Culinary', '/images/menu/singapore-noodles.jpg', 55, 75, 8, 0, 1, 0],
  ['cont_14', 'continental', 'noodles', 'Singapore Noodles + Garlic Butter Prawns', 'Golden wok Singapore noodles tossed with crispy vegetables & garlic butter prawns.', 'Eko Continental Culinary', '/images/menu/singapore-noodles.jpg', 45, 65, 8, 0, 0, 0],
  ['cont_15', 'continental', 'noodles', 'Singapore Noodles + Beef Curry Sauce', 'Stir-fried Singapore vermicelli noodles paired with slow-simmered beef curry sauce.', 'Eko Continental Culinary', '/images/menu/beef-curry.jpg', 50, 70, 8, 0, 0, 0],
  ['cont_16', 'continental', 'noodles', 'Singapore Noodles + Chicken Curry Sauce', 'Wok-fried Singapore vermicelli noodles accompanied by savory chicken curry.', 'Eko Continental Culinary', '/images/menu/chicken-curry.jpg', 70, 85, 8, 0, 0, 0]
]

export function getFallbackMenuItems(): MenuItem[] {
  return SEED_MENU_DATA.map(row => ({
    id: row[0],
    cat: row[1],
    subCat: row[2],
    name: row[3],
    description: row[4],
    vendor: row[5],
    image: row[6],
    imageMode: 'photo',
    stock: row[7],
    initialStock: row[8],
    threshold: row[9],
    manualClosed: Boolean(row[10]),
    popular: Boolean(row[11]),
    spicy: Boolean(row[12])
  }))
}

