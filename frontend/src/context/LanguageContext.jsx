import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    app_name: 'FarmLink India',
    tagline: 'All-India Agricultural Direct Marketplace',
    nav_home: 'Home',
    nav_produce: 'Produce Listings',
    nav_demands: 'Buyer Demands',
    nav_matches: 'Smart Matches',
    nav_offers: 'Offers & Negotiation',
    nav_orders: 'Orders',
    nav_prices: 'Mandi Prices',
    nav_assistant: 'AI Assistant',
    nav_help: 'Farmer Care',
    nav_admin: 'Admin',
    nav_profile: 'Profile',
    nav_login: 'Login',
    nav_register: 'Register',
    nav_logout: 'Logout',

    role_farmer: 'Farmer',
    role_buyer: 'Buyer',
    role_admin: 'Admin',

    btn_publish_produce: '+ Publish Produce',
    btn_publish_demand: '+ Publish Demand',
    btn_combine_supply: 'Combine Multiple Farmers',
    btn_send_offer: 'Send Offer',
    btn_accept_offer: 'Accept & Reserve',
    btn_counter_offer: 'Counter Offer',
    btn_reject_offer: 'Reject Offer',
    btn_confirm_order: 'Confirm Order',
    btn_call_support: 'Call Farmer Care',

    status_available: 'Available',
    status_reserved: 'Reserved',
    status_confirmed: 'Confirmed',
    status_sold_out: 'Sold Out',

    label_crop: 'Crop',
    label_quantity: 'Quantity',
    label_price: 'Price',
    label_location: 'APMC Market / Location',
    label_match_score: 'Match Score',
    label_demo_badge: 'Sample/Demo Data',

    disclaimer_prices: 'Live Agmarknet government API is optional and currently using verified regional mandi benchmark sample data.',
    disclaimer_safeguard: 'Farmer Care customer support cannot sell produce or accept offers on your behalf. Farmer confirmation is strictly required.'
  },
  hi: {
    app_name: 'फार्मलिंक इंडिया',
    tagline: 'अखिल भारतीय कृषि सीधा बाज़ार',
    nav_home: 'होम',
    nav_produce: 'फसल सूची',
    nav_demands: 'खरीदार मांग',
    nav_matches: 'स्मार्ट मैच',
    nav_offers: 'प्रस्ताव और बातचीत',
    nav_orders: 'ऑर्डर',
    nav_prices: 'मंडी भाव',
    nav_assistant: 'एआई सहायक',
    nav_help: 'किसान सेवा',
    nav_admin: 'एडमिन',
    nav_profile: 'प्रोफ़ाइल',
    nav_login: 'लॉग इन',
    nav_register: 'रजिस्टर करें',
    nav_logout: 'लॉग आउट',

    role_farmer: 'किसान',
    role_buyer: 'खरीदार',
    role_admin: 'प्रशासक',

    btn_publish_produce: '+ फसल दर्ज करें',
    btn_publish_demand: '+ मांग दर्ज करें',
    btn_combine_supply: 'कई किसानों की आपूर्ति जोड़ें',
    btn_send_offer: 'प्रस्ताव भेजें',
    btn_accept_offer: 'स्वीकार करें और सुरक्षित करें',
    btn_counter_offer: 'जवाबी प्रस्ताव',
    btn_reject_offer: 'अस्वीकार करें',
    btn_confirm_order: 'ऑर्डर पक्का करें',
    btn_call_support: 'किसान सेवा पर कॉल करें',

    status_available: 'उपलब्ध',
    status_reserved: 'आरक्षित',
    status_confirmed: 'पुष्ट',
    status_sold_out: 'बिक चुका',

    label_crop: 'फसल',
    label_quantity: 'मात्रा',
    label_price: 'कीमत',
    label_location: 'मंडी / स्थान',
    label_match_score: 'मिलान स्कोर',
    label_demo_badge: 'नमूना/डेमो डेटा',

    disclaimer_prices: 'लाइव सरकारी एगमार्कनेट एपीआई वैकल्पिक है और वर्तमान में क्षेत्रीय मंडी बेंचमार्क डेटा का उपयोग कर रहा है।',
    disclaimer_safeguard: 'किसान सेवा प्रतिनिधि आपकी ओर से फसल नहीं बेच सकते। किसान की स्पष्ट पुष्टि सदैव आवश्यक है।'
  },
  te: {
    app_name: 'ఫార్మ్‌లింక్ ఇండియా',
    tagline: 'అఖిల భారత ప్రత్యక్ష వ్యవసాయ మార్కెట్',
    nav_home: 'హోమ్',
    nav_produce: 'పంటల వివరాలు',
    nav_demands: 'కొనుగోలుదారుల డిమాండ్',
    nav_matches: 'స్మార్ట్ మ్యాచెస్',
    nav_offers: 'ఆఫర్లు & బేరసారాలు',
    nav_orders: 'ఆర్డర్లు',
    nav_prices: 'మార్కెట్ ధరలు',
    nav_assistant: 'AI సహాయకుడు',
    nav_help: 'రైతు సేవ',
    nav_admin: 'అడ్మిన్',
    nav_profile: 'ప్రొఫైల్',
    nav_login: 'లాగిన్',
    nav_register: 'నమోదు చేసుకోండి',
    nav_logout: 'లాగౌట్',

    role_farmer: 'రైతు',
    role_buyer: 'కొనుగోలుదారు',
    role_admin: 'అడ్మిన్',

    btn_publish_produce: '+ పంటను నమోదు చేయండి',
    btn_publish_demand: '+ డిమాండ్ నమోదు చేయండి',
    btn_combine_supply: 'రైతుల సరుకును కలపండి',
    btn_send_offer: 'ఆఫర్ పంపండి',
    btn_accept_offer: 'ఆమోదించి రిజర్వ్ చేయండి',
    btn_counter_offer: 'మరొక ధర ఆఫర్ చేయండి',
    btn_reject_offer: 'తిరస్కరించండి',
    btn_confirm_order: 'ఆర్డర్ ఖరారు చేయండి',
    btn_call_support: 'రైతు సేవకు కాల్ చేయండి',

    status_available: 'అందుబాటులో ఉంది',
    status_reserved: 'రిజర్వ్ చేయబడింది',
    status_confirmed: 'ఖరారైంది',
    status_sold_out: 'పూర్తయింది',

    label_crop: 'పంట',
    label_quantity: 'పరిమాణం',
    label_price: 'ధర',
    label_location: 'మార్కెట్ / ప్రాంతం',
    label_match_score: 'సరిపోలిక స్కోరు',
    label_demo_badge: 'నమూనా / డెమో సమాచారం',

    disclaimer_prices: 'లైవ్ అగ్‌మార్క్‌నెట్ ప్రభుత్వ API ప్రస్తుతం నమూనా మార్కెట్ ధరలను చూపిస్తుంది.',
    disclaimer_safeguard: 'రైతు సేవా అధికారులు మీ అనుమతి లేకుండా పంటను విక్రయించలేరు. మీ నిర్ధారణ తప్పనిసరి.'
  },
  ta: {
    app_name: 'ஃபார்ம்லிங்க் இந்தியா',
    tagline: 'அகில இந்திய விவசாய சந்தை',
    nav_home: 'முகப்பு',
    nav_produce: 'விளைபொருட்கள்',
    nav_demands: 'வாங்குபவர் தேவை',
    nav_matches: 'பொருந்தும் வாய்ப்புகள்',
    nav_offers: 'விலை சலுகைகள்',
    nav_orders: 'ஆர்டர்கள்',
    nav_prices: 'சந்தை விலைகள்',
    nav_assistant: 'AI உதவியாளர்',
    nav_help: 'விவசாயி உதவி',
    nav_admin: 'நிர்வாகி',
    nav_profile: 'சுயவிவரம்',
    nav_login: 'உள்நுழைக',
    nav_register: 'பதிவு செய்க',
    nav_logout: 'வெளியேறு',

    role_farmer: 'விவசாயி',
    role_buyer: 'வாங்குபவர்',
    role_admin: 'நிர்வாகி',

    btn_publish_produce: '+ விளைபொருள் சேர்க்க',
    btn_publish_demand: '+ தேவை சேர்க்க',
    btn_combine_supply: 'விவசாயிகள் தொகுப்பு',
    btn_send_offer: 'சலுகை அனுப்பு',
    btn_accept_offer: 'ஏற்கவும் & ஒதுக்கவும்',
    btn_counter_offer: 'மாற்று விலை',
    btn_reject_offer: 'நிராகரி',
    btn_confirm_order: 'உறுதி செய்க',
    btn_call_support: 'உதவி மையத்தை அழைக்கவும்',

    status_available: 'கிடைக்கிறது',
    status_reserved: 'முன்பதிவு',
    status_confirmed: 'உறுதியானது',
    status_sold_out: 'விற்றுத் தீர்ந்தது',

    label_crop: 'பயிர்',
    label_quantity: 'அளவு',
    label_price: 'விலை',
    label_location: 'மண்டி / இடம்',
    label_match_score: 'பொருத்த மதிப்பெண்',
    label_demo_badge: 'மாதிரி தரவு',

    disclaimer_prices: 'மண்டி மாதிரி விலை விவரங்கள் காட்டப்படுகின்றன.',
    disclaimer_safeguard: 'விவசாயியின் ஒப்புதல் இல்லாமல் விற்பனை செய்ய இயலாது.'
  },
  kn: {
    app_name: 'ಫಾರ್ಮ್‌ಲಿಂಕ್ ಇಂಡಿಯಾ',
    tagline: 'ಅಖಿಲ ಭಾರತ ಕೃಷಿ ನೇರ ಮಾರುಕಟ್ಟೆ',
    nav_home: 'ಮುಖಪುಟ',
    nav_produce: 'ಬೆಳೆ ಪಟ್ಟಿ',
    nav_demands: 'ಖರೀದಿದಾರರ ಬೇಡಿಕೆ',
    nav_matches: 'ಹೊಂದಾಣಿಕೆಗಳು',
    nav_offers: 'ಕೊಡುಗೆಗಳು & ಚೌಕಾಸಿ',
    nav_orders: 'ಆರ್ಡರ್‌ಗಳು',
    nav_prices: 'ಮಾರುಕಟ್ಟೆ ದರಗಳು',
    nav_assistant: 'AI ಸಹಾಯಕ',
    nav_help: 'ರೈತ ಮಿತ್ರ',
    nav_admin: 'ನಿರ್ವಾಹಕ',
    nav_profile: 'ಪ್ರೊಫೈಲ್',
    nav_login: 'ಲಾಗಿನ್',
    nav_register: 'ನೋಂದಣಿ',
    nav_logout: 'ಲಾಗ್‌ಔಟ್',

    role_farmer: 'ರೈತ',
    role_buyer: 'ಖರೀದಿದಾರ',
    role_admin: 'ನಿರ್ವಾಹಕ',

    btn_publish_produce: '+ ಬೆಳೆ ಸೇರಿಸಿ',
    btn_publish_demand: '+ ಬೇಡಿಕೆ ಸಲ್ಲಿಸಿ',
    btn_combine_supply: 'ರೈತರ ಪೂರೈಕೆ ಸಂಯೋಜನೆ',
    btn_send_offer: 'ಆಫರ್ ಕಳುಹಿಸಿ',
    btn_accept_offer: 'ಒಪ್ಪಿ ಕಾಯ್ದಿರಿಸಿ',
    btn_counter_offer: 'ಮರು ಪ್ರಸ್ತಾಪ',
    btn_reject_offer: 'ತಿರಸ್ಕರಿಸಿ',
    btn_confirm_order: 'ಆರ್ಡರ್ ದೃಢೀಕರಿಸಿ',
    btn_call_support: 'ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಿ',

    status_available: 'ಲಭ್ಯವಿದೆ',
    status_reserved: 'ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ',
    status_confirmed: 'ದೃಢೀಕರಿಸಲಾಗಿದೆ',
    status_sold_out: 'ಮಾರಾಟವಾಗಿದೆ',

    label_crop: 'ಬೆಳೆ',
    label_quantity: 'ಪ್ರಮಾಣ',
    label_price: 'ಬೆಲೆ',
    label_location: 'ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆ',
    label_match_score: 'ಹೊಂದಾಣಿಕೆ ಸ್ಕೋರ್',
    label_demo_badge: 'ಮಾದರಿ ಮಾಹಿತಿ',

    disclaimer_prices: 'ಪ್ರಾದೇಶಿಕ ಮಂಡಿ ಮಾದರಿ ದರಗಳನ್ನು ಪ್ರದರ್ಶಿಸಲಾಗುತ್ತಿದೆ.',
    disclaimer_safeguard: 'ರೈತರ ನೇರ ದೃಢೀಕರಣವಿಲ್ಲದೆ ಬೆಳೆ ಮಾರಾಟ ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ.'
  },
  mr: {
    app_name: 'फार्मलिंक इंडिया',
    tagline: 'अखिल भारतीय थेट कृषी बाजारपेठ',
    nav_home: 'मुख्यपृष्ठ',
    nav_produce: 'पीक यादी',
    nav_demands: 'खरेदीदार मागणी',
    nav_matches: 'स्मार्ट मॅचेस',
    nav_offers: 'ऑफर आणि वाटाघाटी',
    nav_orders: 'ऑर्डर्स',
    nav_prices: 'बाजारभाव',
    nav_assistant: 'एआय सहाय्यक',
    nav_help: 'शेतकरी सेवा',
    nav_admin: 'प्रशासक',
    nav_profile: 'प्रोफाइल',
    nav_login: 'लॉग इन',
    nav_register: 'नोंदणी करा',
    nav_logout: 'लॉग आउट',

    role_farmer: 'शेतकरी',
    role_buyer: 'खरेदीदार',
    role_admin: 'प्रशासक',

    btn_publish_produce: '+ पीक जोडा',
    btn_publish_demand: '+ मागणी नोंदवा',
    btn_combine_supply: 'अनेक शेतकऱ्यांचा पुरवठा एकत्र करा',
    btn_send_offer: 'ऑफर पाठवा',
    btn_accept_offer: 'स्वीकारा आणि राखीव करा',
    btn_counter_offer: 'प्रति-ऑफर',
    btn_reject_offer: 'नाकारा',
    btn_confirm_order: 'ऑर्डर निश्चित करा',
    btn_call_support: 'शेतकरी सेवेला कॉल करा',

    status_available: 'उपलब्ध',
    status_reserved: 'राखीव',
    status_confirmed: 'निश्चित',
    status_sold_out: 'विकले गेले',

    label_crop: 'पीक',
    label_quantity: 'प्रमाण',
    label_price: 'किंमत',
    label_location: 'बाजार समिती / ठिकाण',
    label_match_score: 'मॅच स्कोअर',
    label_demo_badge: 'डेमो माहिती',

    disclaimer_prices: 'बाजार समितीचे मानक नमुना दर दर्शविले आहेत.',
    disclaimer_safeguard: 'शेतकऱ्यांच्या स्पष्ट मान्यतेशिवाय विक्री केली जाऊ शकत नाही.'
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('farmlink_lang') || 'en';
  });

  const changeLanguage = (newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
      localStorage.setItem('farmlink_lang', newLang);
    }
  };

  const t = (key, fallback = '') => {
    return (translations[lang] && translations[lang][key]) || (translations['en'] && translations['en'][key]) || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t, availableLanguages: [
      { code: 'en', label: 'English' },
      { code: 'hi', label: 'हिन्दी (Hindi)' },
      { code: 'te', label: 'తెలుగు (Telugu)' },
      { code: 'ta', label: 'தமிழ் (Tamil)' },
      { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
      { code: 'mr', label: 'मराठी (Marathi)' }
    ] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export default LanguageContext;
