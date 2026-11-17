export interface BibleVerse {
  id: string;
  bookTe: string;
  bookEn: string;
  chapter: string;
  verse: string;
  textTe: string;
  category: string;
}

export interface BackgroundTheme {
  id: string;
  name: string;
  subtitle: string;
  englishVisualPrompt: string;
  fallbackImage: string;
  accentHex: string;
  fallbackGradient: [string, string, string];
}

export const CURATED_VERSES: BibleVerse[] = [
  {
    id: 'john-3-16',
    bookTe: 'యోహాను',
    bookEn: 'John',
    chapter: '3',
    verse: '16',
    textTe:
      'దేవుడు లోకమును ఎంతో ప్రేమించెను. కాగా ఆయన తన అద్వితీయకుమారునిగా పుట్టిన వానియందు విశ్వాసముంచు ప్రతివాడును నశింపక నిత్యజీవము పొందునట్లు ఆయనను అనుగ్రహించెను.',
    category: 'Love & Salvation',
  },
  {
    id: 'psalms-23-1',
    bookTe: 'కీర్తనలు',
    bookEn: 'Psalms',
    chapter: '23',
    verse: '1',
    textTe: 'యెహోవా నా కాపరి; నాకు లేమి కలుగదు.',
    category: 'Peace & Guidance',
  },
  {
    id: 'philippians-4-13',
    bookTe: 'ఫిలిప్పీయులకు',
    bookEn: 'Philippians',
    chapter: '4',
    verse: '13',
    textTe: 'నన్ను బలపరచువానియందే నేను సమస్తమును చేయగలను.',
    category: 'Strength',
  },
  {
    id: 'jeremiah-29-11',
    bookTe: 'యిర్మీయా',
    bookEn: 'Jeremiah',
    chapter: '29',
    verse: '11',
    textTe:
      'నేను మిమ్మును గూర్చి ఉద్దేశించిన సంగతులను నేనెరుగుదును; రాబోవు కాలమందు మీకు నిరీక్షణ కలుగునట్లుగా అవి సమాధానకరమైన ఉద్దేశములే గాని హానికరమైనవి కావు; ఇదే యెహోవా వాక్కు.',
    category: 'Hope & Future',
  },
  {
    id: 'proverbs-3-5-6',
    bookTe: 'సామెతలు',
    bookEn: 'Proverbs',
    chapter: '3',
    verse: '5-6',
    textTe:
      'నీ స్వబుద్ధిని ఆధారము చేసికొనక నీ పూర్ణహృదయముతో యెహోవాయందు నమ్మకముంచుము. నీ ప్రవర్తన అంతటియందు ఆయన అధికారమునకు ఒప్పుకొనుము; అప్పుడు ఆయన నీ త్రోవలను సరాళము చేయును.',
    category: 'Trust & Wisdom',
  },
  {
    id: 'isaiah-41-10',
    bookTe: 'యెషయా',
    bookEn: 'Isaiah',
    chapter: '41',
    verse: '10',
    textTe:
      'నీవు భయపడకుము నేను నీకు తోడైయున్నాను; దిగులుపడకుము నేను నీ దేవుడనై యున్నాను; నేను నిన్ను బలపరతును; నీకు సహాయము చేయువాడను నేనే; నీతియను నా దక్షిణహస్తముతో నిన్ను ఆదుకొందును.',
    category: 'Courage',
  },
  {
    id: 'romans-8-28',
    bookTe: 'రోమీయులకు',
    bookEn: 'Romans',
    chapter: '8',
    verse: '28',
    textTe:
      'దేవుని ప్రేమించువారికి, అనగా ఆయన సంకల్పము చొప్పున పిలువబడినవారికి, మేలు కలుగుటకై సమస్తమును సమకూడి జరుగుచున్నవని యెరుగుదుము.',
    category: 'Faith & Purpose',
  },
  {
    id: 'matthew-11-28',
    bookTe: 'మత్తయి',
    bookEn: 'Matthew',
    chapter: '11',
    verse: '28',
    textTe:
      'ప్రయాసపడి భారము మోసికొనుచున్న సమస్త జనులారా, నా యొద్దకు రండి; నేను మీకు విశ్రాంతి కలుగజేతును.',
    category: 'Rest & Comfort',
  },
  {
    id: 'psalms-46-1',
    bookTe: 'కీర్తనలు',
    bookEn: 'Psalms',
    chapter: '46',
    verse: '1',
    textTe:
      'దేవుడు మనకు ఆశ్రయమును దుర్గమునై యున్నాడు; ఆపత్కాలములో ఆయన నమ్ముకొనదగిన సహాయకుడు.',
    category: 'Refuge',
  },
  {
    id: 'joshua-1-9',
    bookTe: 'యెహోషువ',
    bookEn: 'Joshua',
    chapter: '1',
    verse: '9',
    textTe:
      'నిన్ను బలపరచుకొనుము; ధైర్యము తెచ్చుకొనుము; దిగులుపడకుము జడియకుము; నీవు నడుచు మార్గమంతటిలో నీ దేవుడైన యెహోవా నీకు తోడైయుండును.',
    category: 'Courage',
  },
  {
    id: 'psalms-119-105',
    bookTe: 'కీర్తనలు',
    bookEn: 'Psalms',
    chapter: '119',
    verse: '105',
    textTe: 'నీ వాక్యము నా పాదములకు దీపమును నా త్రోవకు వెలుగునై యున్నది.',
    category: 'Guidance',
  },
  {
    id: '2-corinthians-12-9',
    bookTe: '2 కొరింథీయులకు',
    bookEn: '2 Corinthians',
    chapter: '12',
    verse: '9',
    textTe:
      'నా కృప నీకు చాలును; బలహీనతయందు నా శక్తి పరిపూర్ణమగుచున్నదని ఆయన నాతో చెప్పెను.',
    category: 'Grace',
  },
  {
    id: 'galatians-5-22-23',
    bookTe: 'గలతీయులకు',
    bookEn: 'Galatians',
    chapter: '5',
    verse: '22-23',
    textTe:
      'అయితే ఆత్మ ఫలమేమనగా, ప్రేమ, ఆనందము, సమాధానము, దీర్ఘశాంతము, దయాళుత్వము, మంచితనము, విశ్వాసము, సాత్వికము, ఆశానిగ్రహము.',
    category: 'Fruit of the Spirit',
  },
  {
    id: 'psalms-91-1-2',
    bookTe: 'కీర్తనలు',
    bookEn: 'Psalms',
    chapter: '91',
    verse: '1-2',
    textTe:
      'మహోన్నతుని చాటున నివసించువాడే సర్వశక్తుని నీడను విశ్రమించువాడు. ఆయన నాకు ఆశ్రయము నా కోట నేను నమ్ముకొను నా దేవుడు అని నేను యెహోవానుగూర్చి చెప్పుచున్నాను.',
    category: 'Protection',
  },
  {
    id: 'romans-15-13',
    bookTe: 'రోమీయులకు',
    bookEn: 'Romans',
    chapter: '15',
    verse: '13',
    textTe:
      'కాగా మీకు సమస్తానందమును సమాధానమును కలుగునట్లుగా నిరీక్షణకర్తయగు దేవుడు పరిశుద్ధాత్మ శక్తివలన మీకు విస్తారముగా నిరీక్షణ కలుగజేయును గాక.',
    category: 'Joy & Peace',
  },
];

export const BACKGROUND_THEMES: BackgroundTheme[] = [
  {
    id: 'sunrise-hope',
    name: 'Sunrise / Hope',
    subtitle: 'Golden dawn over misty hills',
    englishVisualPrompt:
      'serene golden hour sunrise breaking over misty rolling hills warm amber light rays peaceful spiritual atmosphere landscape photography no text',
    fallbackImage: '/src/assets/images/theme_sunrise_hope_1794921844499.jpg',
    accentHex: '#F3D078',
    fallbackGradient: ['#4A2C18', '#8C5427', '#1E140E'],
  },
  {
    id: 'peaceful-nature',
    name: 'Peaceful Nature',
    subtitle: 'Still waters & olive meadow',
    englishVisualPrompt:
      'tranquil still river beside ancient olive trees soft morning mist warm diffused sunlight peaceful contemplative nature photography no text',
    fallbackImage: '/src/assets/images/theme_peaceful_nature_1794921844710.jpg',
    accentHex: '#FAF0D7',
    fallbackGradient: ['#1E352B', '#3E6251', '#121E19'],
  },
  {
    id: 'night-stars',
    name: 'Night Sky / Stars',
    subtitle: 'Luminous Milky Way cosmos',
    englishVisualPrompt:
      'deep indigo starry night sky with luminous milky way above calm dark mountain silhouettes peaceful quiet astrophotography no text',
    fallbackImage: '/src/assets/images/theme_night_stars_1794921845125.jpg',
    accentHex: '#FFFFFF',
    fallbackGradient: ['#0D1630', '#1E2D58', '#080C1A'],
  },
  {
    id: 'cross-light',
    name: 'Cross / Light',
    subtitle: 'Hilltop cross in warm light',
    englishVisualPrompt:
      'minimalist weathered wooden cross silhouette on a peaceful grassy hilltop at golden hour soft sunbeams through clouds reverent photography no text',
    fallbackImage: '/src/assets/images/theme_cross_light_1794921846084.jpg',
    accentHex: '#F3D078',
    fallbackGradient: ['#38281D', '#6D4B32', '#17120E'],
  },
  {
    id: 'mountain-majesty',
    name: 'Mountain',
    subtitle: 'Peaks above morning clouds',
    englishVisualPrompt:
      'majestic calm snow-dusted mountain peaks rising above a soft sea of morning clouds warm muted dawn light editorial landscape photography no text',
    fallbackImage: '/src/assets/images/theme_mountain_majesty_1794921846366.jpg',
    accentHex: '#FAF0D7',
    fallbackGradient: ['#233240', '#4A6275', '#131B24'],
  },
];

export function buildPollinationsUrl(englishPrompt: string, seed: number): string {
  const cleanPrompt = englishPrompt.trim().replace(/\s+/g, ' ');
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1080&height=1080&nologo=true&seed=${seed}`;
}
