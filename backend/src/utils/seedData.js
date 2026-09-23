// Pre-populated Indian agricultural data for All-India coverage
const states = [
  { id: 1, name: 'Telangana', code: 'TS' },
  { id: 2, name: 'Andhra Pradesh', code: 'AP' },
  { id: 3, name: 'Maharashtra', code: 'MH' },
  { id: 4, name: 'Karnataka', code: 'KA' },
  { id: 5, name: 'Tamil Nadu', code: 'TN' },
  { id: 6, name: 'Punjab', code: 'PB' },
  { id: 7, name: 'Uttar Pradesh', code: 'UP' },
  { id: 8, name: 'Gujarat', code: 'GJ' },
  { id: 9, name: 'Madhya Pradesh', code: 'MP' },
  { id: 10, name: 'Rajasthan', code: 'RJ' }
];

const districts = [
  // Telangana
  { id: 1, state_id: 1, name: 'Hyderabad' },
  { id: 2, state_id: 1, name: 'Warangal' },
  { id: 3, state_id: 1, name: 'Nizamabad' },
  { id: 4, state_id: 1, name: 'Khammam' },
  { id: 5, state_id: 1, name: 'Karimnagar' },
  // Andhra Pradesh
  { id: 6, state_id: 2, name: 'Guntur' },
  { id: 7, state_id: 2, name: 'Krishna' },
  { id: 8, state_id: 2, name: 'Kurnool' },
  { id: 9, state_id: 2, name: 'Chittoor' },
  // Maharashtra
  { id: 10, state_id: 3, name: 'Nashik' },
  { id: 11, state_id: 3, name: 'Pune' },
  { id: 12, state_id: 3, name: 'Nagpur' },
  { id: 13, state_id: 3, name: 'Solapur' },
  // Karnataka
  { id: 14, state_id: 4, name: 'Bengaluru Urban' },
  { id: 15, state_id: 4, name: 'Kolar' },
  { id: 16, state_id: 4, name: 'Belagavi' },
  { id: 17, state_id: 4, name: 'Dharwad' },
  // Tamil Nadu
  { id: 18, state_id: 5, name: 'Chennai' },
  { id: 19, state_id: 5, name: 'Coimbatore' },
  { id: 20, state_id: 5, name: 'Madurai' },
  // Punjab
  { id: 21, state_id: 6, name: 'Ludhiana' },
  { id: 22, state_id: 6, name: 'Amritsar' },
  // Uttar Pradesh
  { id: 23, state_id: 7, name: 'Varanasi' },
  { id: 24, state_id: 7, name: 'Agra' }
];

const markets = [
  // Telangana
  { id: 1, district_id: 1, name: 'Bowenpally APMC Market' },
  { id: 2, district_id: 1, name: 'Gaddiannaram Fruit Market' },
  { id: 3, district_id: 2, name: 'Enumamula APMC Market' },
  { id: 4, district_id: 3, name: 'Nizamabad Grain & Turmeric Mandi' },
  { id: 5, district_id: 4, name: 'Khammam Chilli Yard' },
  { id: 6, district_id: 5, name: 'Karimnagar Grain Mandi' },
  // Andhra Pradesh
  { id: 7, district_id: 6, name: 'Guntur Mirchi Yard' },
  { id: 8, district_id: 7, name: 'Vijayawada Vegetable Mandi' },
  { id: 9, district_id: 8, name: 'Kurnool APMC Market' },
  { id: 10, district_id: 9, name: 'Madanapalle Tomato Yard' },
  // Maharashtra
  { id: 11, district_id: 10, name: 'Lasalgaon Onion APMC' },
  { id: 12, district_id: 10, name: 'Pimpalgaon APMC' },
  { id: 13, district_id: 11, name: 'Gultekdi Pune APMC' },
  { id: 14, district_id: 12, name: 'Nagpur Orange Mandi' },
  { id: 15, district_id: 13, name: 'Solapur Pomegranate Mandi' },
  // Karnataka
  { id: 16, district_id: 14, name: 'Yeshwanthpur APMC Yard' },
  { id: 17, district_id: 15, name: 'Kolar Tomato Market' },
  { id: 18, district_id: 16, name: 'Belagavi APMC' },
  // Tamil Nadu
  { id: 19, district_id: 18, name: 'Koyambedu Wholesale Market' },
  { id: 20, district_id: 19, name: 'Coimbatore Vegetable Market' },
  // Punjab
  { id: 21, district_id: 21, name: 'Khanna Grain Mandi' },
  { id: 22, district_id: 22, name: 'Amritsar Dana Mandi' },
  // UP
  { id: 23, district_id: 23, name: 'Varanasi APMC Yard' },
  { id: 24, district_id: 24, name: 'Agra Potato Mandi' }
];

const categories = [
  { id: 1, name: 'Vegetables', description: 'Fresh vegetables directly from farm fields' },
  { id: 2, name: 'Fruits', description: 'Fresh seasonal and perennial fruits' },
  { id: 3, name: 'Cereals', description: 'Staple grain crops like rice, wheat, and maize' },
  { id: 4, name: 'Millets', description: 'Nutri-cereals including jowar, bajra, ragi' },
  { id: 5, name: 'Pulses', description: 'Protein-rich lentils like red gram and green gram' },
  { id: 6, name: 'Oilseeds', description: 'Oilseeds like groundnut, mustard, and sesame' },
  { id: 7, name: 'Spices', description: 'Commercial spices like chilli, turmeric, and cumin' },
  { id: 8, name: 'Other Agricultural Crops', description: 'Commercial crops like sugarcane and cotton' }
];

const crops = [
  // Vegetables
  { id: 1, category_id: 1, name: 'Tomato', hindi_name: 'टमाटर', telugu_name: 'టమోటా', unit_default: 'kg', icon: '🍅' },
  { id: 2, category_id: 1, name: 'Onion', hindi_name: 'प्याज', telugu_name: 'ఉల్లిపాయ', unit_default: 'kg', icon: '🧅' },
  { id: 3, category_id: 1, name: 'Potato', hindi_name: 'आलू', telugu_name: 'బంగాళాదుంప', unit_default: 'kg', icon: '🥔' },
  // Fruits
  { id: 4, category_id: 2, name: 'Mango', hindi_name: 'आम', telugu_name: 'మామిడి', unit_default: 'kg', icon: '🥭' },
  { id: 5, category_id: 2, name: 'Banana', hindi_name: 'केला', telugu_name: 'అరటి', unit_default: 'kg', icon: '🍌' },
  // Cereals
  { id: 6, category_id: 3, name: 'Rice (Paddy)', hindi_name: 'चावल (धान)', telugu_name: 'వరి / బియ్యం', unit_default: 'quintal', icon: '🌾' },
  { id: 7, category_id: 3, name: 'Wheat', hindi_name: 'गेहूं', telugu_name: 'గోధుమలు', unit_default: 'quintal', icon: '🌾' },
  { id: 8, category_id: 3, name: 'Maize', hindi_name: 'मक्का', telugu_name: 'మొక్కజొన్న', unit_default: 'quintal', icon: '🌽' },
  // Millets
  { id: 9, category_id: 4, name: 'Jowar (Sorghum)', hindi_name: 'ज्वार', telugu_name: 'జొన్నలు', unit_default: 'quintal', icon: '🌾' },
  { id: 10, category_id: 4, name: 'Bajra (Pearl Millet)', hindi_name: 'बाजरा', telugu_name: 'సజ్జలు', unit_default: 'quintal', icon: '🌾' },
  { id: 11, category_id: 4, name: 'Ragi (Finger Millet)', hindi_name: 'रागी', telugu_name: 'రాగులు', unit_default: 'quintal', icon: '🌾' },
  { id: 12, category_id: 4, name: 'Foxtail Millet', hindi_name: 'कंगनी', telugu_name: 'కొర్రలు', unit_default: 'quintal', icon: '🌾' },
  // Pulses
  { id: 13, category_id: 5, name: 'Red Gram (Tur / Arhar)', hindi_name: 'अरहर / तूर दाल', telugu_name: 'కందులు', unit_default: 'quintal', icon: '🌱' },
  { id: 14, category_id: 5, name: 'Green Gram (Moong)', hindi_name: 'मूंग दाल', telugu_name: 'పెసలు', unit_default: 'quintal', icon: '🌱' },
  // Oilseeds
  { id: 15, category_id: 6, name: 'Groundnut', hindi_name: 'मूंगफली', telugu_name: 'వేరుశెనగ', unit_default: 'quintal', icon: '🥜' },
  { id: 16, category_id: 6, name: 'Sesame', hindi_name: 'तिल', telugu_name: 'నువ్వులు', unit_default: 'quintal', icon: '🌱' },
  // Spices
  { id: 17, category_id: 7, name: 'Chilli', hindi_name: 'लाल मिर्च', telugu_name: 'మిరపకాయ', unit_default: 'quintal', icon: '🌶️' },
  { id: 18, category_id: 7, name: 'Turmeric', hindi_name: 'हल्दी', telugu_name: 'పసుపు', unit_default: 'quintal', icon: '🫚' },
  // Other crops
  { id: 19, category_id: 8, name: 'Cotton', hindi_name: 'कपास', telugu_name: 'పత్తి', unit_default: 'quintal', icon: '☁️' }
];

const cropVarieties = [
  { id: 1, crop_id: 1, name: 'Hybrid (Sahu / Shivam)' },
  { id: 2, crop_id: 1, name: 'Desi Country Tomato' },
  { id: 3, crop_id: 1, name: 'Vaishnavi' },
  { id: 4, crop_id: 2, name: 'Nashik Red' },
  { id: 5, crop_id: 2, name: 'White Onion' },
  { id: 6, crop_id: 3, name: 'Kufri Jyoti' },
  { id: 7, crop_id: 3, name: 'Kufri Pukhraj' },
  { id: 8, crop_id: 4, name: 'Alphonso' },
  { id: 9, crop_id: 4, name: 'Banganapalli' },
  { id: 10, crop_id: 4, name: 'Kesar' },
  { id: 11, crop_id: 5, name: 'Grand Naine (G9)' },
  { id: 12, crop_id: 6, name: 'Sona Masoori' },
  { id: 13, crop_id: 6, name: 'Basmati 1121' },
  { id: 14, crop_id: 7, name: 'Sharbati' },
  { id: 15, crop_id: 13, name: 'Maruti (ICP-8863)' },
  { id: 16, crop_id: 17, name: 'Guntur Sannam (S4)' },
  { id: 17, crop_id: 17, name: 'Byadagi' },
  { id: 18, crop_id: 18, name: 'Salem Turmeric' },
  { id: 19, crop_id: 18, name: 'Nizamabad Bulb' }
];

const sampleMarketPrices = [
  { state: 'Telangana', district: 'Hyderabad', market: 'Bowenpally APMC Market', category: 'Vegetables', crop: 'Tomato', variety: 'Hybrid (Sahu / Shivam)', min_price: 22, max_price: 28, modal_price: 25, unit: 'kg', reported_date: '2026-09-23' },
  { state: 'Telangana', district: 'Hyderabad', market: 'Bowenpally APMC Market', category: 'Vegetables', crop: 'Onion', variety: 'Nashik Red', min_price: 30, max_price: 38, modal_price: 34, unit: 'kg', reported_date: '2026-09-23' },
  { state: 'Telangana', district: 'Warangal', market: 'Enumamula APMC Market', category: 'Vegetables', crop: 'Tomato', variety: 'Hybrid (Sahu / Shivam)', min_price: 20, max_price: 26, modal_price: 23, unit: 'kg', reported_date: '2026-09-23' },
  { state: 'Telangana', district: 'Nizamabad', market: 'Nizamabad Grain & Turmeric Mandi', category: 'Spices', crop: 'Turmeric', variety: 'Nizamabad Bulb', min_price: 13500, max_price: 16200, modal_price: 14800, unit: 'quintal', reported_date: '2026-09-23' },
  { state: 'Telangana', district: 'Nizamabad', market: 'Nizamabad Grain & Turmeric Mandi', category: 'Pulses', crop: 'Red Gram (Tur / Arhar)', variety: 'Maruti (ICP-8863)', min_price: 9200, max_price: 10400, modal_price: 9800, unit: 'quintal', reported_date: '2026-09-23' },
  { state: 'Andhra Pradesh', district: 'Guntur', market: 'Guntur Mirchi Yard', category: 'Spices', crop: 'Chilli', variety: 'Guntur Sannam (S4)', min_price: 18000, max_price: 22500, modal_price: 20200, unit: 'quintal', reported_date: '2026-09-23' },
  { state: 'Andhra Pradesh', district: 'Chittoor', market: 'Madanapalle Tomato Yard', category: 'Vegetables', crop: 'Tomato', variety: 'Desi Country Tomato', min_price: 18, max_price: 24, modal_price: 21, unit: 'kg', reported_date: '2026-09-23' },
  { state: 'Maharashtra', district: 'Nashik', market: 'Lasalgaon Onion APMC', category: 'Vegetables', crop: 'Onion', variety: 'Nashik Red', min_price: 28, max_price: 36, modal_price: 32, unit: 'kg', reported_date: '2026-09-23' },
  { state: 'Karnataka', district: 'Kolar', market: 'Kolar Tomato Market', category: 'Vegetables', crop: 'Tomato', variety: 'Hybrid (Sahu / Shivam)', min_price: 19, max_price: 25, modal_price: 22, unit: 'kg', reported_date: '2026-09-23' },
  { state: 'Punjab', district: 'Ludhiana', market: 'Khanna Grain Mandi', category: 'Cereals', crop: 'Wheat', variety: 'Sharbati', min_price: 2450, max_price: 2750, modal_price: 2600, unit: 'quintal', reported_date: '2026-09-23' }
];

module.exports = {
  states,
  districts,
  markets,
  categories,
  crops,
  cropVarieties,
  sampleMarketPrices
};
