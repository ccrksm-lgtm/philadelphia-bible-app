export interface BibleBookMeta {
  index: number;
  bookEn: string;
  bookTe: string;
  testament: 'OT' | 'NT';
  chapters: number;
}

export interface BibleVerseEntry {
  verse: string;
  text: string;
}

export interface BibleChapterData {
  chapter: string;
  verses: BibleVerseEntry[];
}

export interface BibleBookData {
  bookEn: string;
  bookTe: string;
  chapters: BibleChapterData[];
}

export const BIBLE_BOOKS_66: BibleBookMeta[] = [
  // Old Testament (39)
  { index: 0, bookEn: 'Genesis', bookTe: 'ఆదికాండము', testament: 'OT', chapters: 50 },
  { index: 1, bookEn: 'Exodus', bookTe: 'నిర్గమకాండము', testament: 'OT', chapters: 40 },
  { index: 2, bookEn: 'Leviticus', bookTe: 'లేవీయకాండము', testament: 'OT', chapters: 27 },
  { index: 3, bookEn: 'Numbers', bookTe: 'సంఖ్యాకాండము', testament: 'OT', chapters: 36 },
  { index: 4, bookEn: 'Deuteronomy', bookTe: 'ద్వితీయోపదేశకాండము', testament: 'OT', chapters: 34 },
  { index: 5, bookEn: 'Joshua', bookTe: 'యెహోషువ', testament: 'OT', chapters: 24 },
  { index: 6, bookEn: 'Judges', bookTe: 'న్యాయాధిపతులు', testament: 'OT', chapters: 21 },
  { index: 7, bookEn: 'Ruth', bookTe: 'రూతు', testament: 'OT', chapters: 4 },
  { index: 8, bookEn: '1 Samuel', bookTe: '1 సమూయేలు', testament: 'OT', chapters: 31 },
  { index: 9, bookEn: '2 Samuel', bookTe: '2 సమూయేలు', testament: 'OT', chapters: 24 },
  { index: 10, bookEn: '1 Kings', bookTe: '1 రాజులు', testament: 'OT', chapters: 22 },
  { index: 11, bookEn: '2 Kings', bookTe: '2 రాజులు', testament: 'OT', chapters: 25 },
  { index: 12, bookEn: '1 Chronicles', bookTe: '1 దినవృత్తాంతములు', testament: 'OT', chapters: 29 },
  { index: 13, bookEn: '2 Chronicles', bookTe: '2 దినవృత్తాంతములు', testament: 'OT', chapters: 36 },
  { index: 14, bookEn: 'Ezra', bookTe: 'ఎజ్రా', testament: 'OT', chapters: 10 },
  { index: 15, bookEn: 'Nehemiah', bookTe: 'నెహెమ్యా', testament: 'OT', chapters: 13 },
  { index: 16, bookEn: 'Esther', bookTe: 'ఎస్తేరు', testament: 'OT', chapters: 10 },
  { index: 17, bookEn: 'Job', bookTe: 'యోబు', testament: 'OT', chapters: 42 },
  { index: 18, bookEn: 'Psalms', bookTe: 'కీర్తనలు', testament: 'OT', chapters: 150 },
  { index: 19, bookEn: 'Proverbs', bookTe: 'సామెతలు', testament: 'OT', chapters: 31 },
  { index: 20, bookEn: 'Ecclesiastes', bookTe: 'ప్రసంగి', testament: 'OT', chapters: 12 },
  { index: 21, bookEn: 'Song of Songs', bookTe: 'పరమగీతము', testament: 'OT', chapters: 8 },
  { index: 22, bookEn: 'Isaiah', bookTe: 'యెషయా', testament: 'OT', chapters: 66 },
  { index: 23, bookEn: 'Jeremiah', bookTe: 'యిర్మీయా', testament: 'OT', chapters: 52 },
  { index: 24, bookEn: 'Lamentations', bookTe: 'విలాపవాక్యములు', testament: 'OT', chapters: 5 },
  { index: 25, bookEn: 'Ezekiel', bookTe: 'యెహెజ్కేలు', testament: 'OT', chapters: 48 },
  { index: 26, bookEn: 'Daniel', bookTe: 'దానియేలు', testament: 'OT', chapters: 12 },
  { index: 27, bookEn: 'Hosea', bookTe: 'హోషేయ', testament: 'OT', chapters: 14 },
  { index: 28, bookEn: 'Joel', bookTe: 'యోవేలు', testament: 'OT', chapters: 3 },
  { index: 29, bookEn: 'Amos', bookTe: 'ఆమోసు', testament: 'OT', chapters: 9 },
  { index: 30, bookEn: 'Obadiah', bookTe: 'ఓబద్యా', testament: 'OT', chapters: 1 },
  { index: 31, bookEn: 'Jonah', bookTe: 'యోనా', testament: 'OT', chapters: 4 },
  { index: 32, bookEn: 'Micah', bookTe: 'మీకా', testament: 'OT', chapters: 7 },
  { index: 33, bookEn: 'Nahum', bookTe: 'నహూము', testament: 'OT', chapters: 3 },
  { index: 34, bookEn: 'Habakkuk', bookTe: 'హబక్కూకు', testament: 'OT', chapters: 3 },
  { index: 35, bookEn: 'Zephaniah', bookTe: 'జెఫన్యా', testament: 'OT', chapters: 3 },
  { index: 36, bookEn: 'Haggai', bookTe: 'హగ్గయి', testament: 'OT', chapters: 2 },
  { index: 37, bookEn: 'Zechariah', bookTe: 'జెకర్యా', testament: 'OT', chapters: 14 },
  { index: 38, bookEn: 'Malachi', bookTe: 'మలాకీ', testament: 'OT', chapters: 4 },

  // New Testament (27)
  { index: 39, bookEn: 'Matthew', bookTe: 'మత్తయి', testament: 'NT', chapters: 28 },
  { index: 40, bookEn: 'Mark', bookTe: 'మార్కు', testament: 'NT', chapters: 16 },
  { index: 41, bookEn: 'Luke', bookTe: 'లూకా', testament: 'NT', chapters: 24 },
  { index: 42, bookEn: 'John', bookTe: 'యోహాను', testament: 'NT', chapters: 21 },
  { index: 43, bookEn: 'Acts', bookTe: 'అపొస్తలుల కార్యములు', testament: 'NT', chapters: 28 },
  { index: 44, bookEn: 'Romans', bookTe: 'రోమీయులకు', testament: 'NT', chapters: 16 },
  { index: 45, bookEn: '1 Corinthians', bookTe: '1 కొరింథీయులకు', testament: 'NT', chapters: 16 },
  { index: 46, bookEn: '2 Corinthians', bookTe: '2 కొరింథీయులకు', testament: 'NT', chapters: 13 },
  { index: 47, bookEn: 'Galatians', bookTe: 'గలతీయులకు', testament: 'NT', chapters: 6 },
  { index: 48, bookEn: 'Ephesians', bookTe: 'ఎఫెసీయులకు', testament: 'NT', chapters: 6 },
  { index: 49, bookEn: 'Philippians', bookTe: 'ఫిలిప్పీయులకు', testament: 'NT', chapters: 4 },
  { index: 50, bookEn: 'Colossians', bookTe: 'కొలొస్సయులకు', testament: 'NT', chapters: 4 },
  { index: 51, bookEn: '1 Thessalonians', bookTe: '1 థెస్సలొనీకయులకు', testament: 'NT', chapters: 5 },
  { index: 52, bookEn: '2 Thessalonians', bookTe: '2 థెస్సలొనీకయులకు', testament: 'NT', chapters: 3 },
  { index: 53, bookEn: '1 Timothy', bookTe: '1 తిమోతికి', testament: 'NT', chapters: 6 },
  { index: 54, bookEn: '2 Timothy', bookTe: '2 తిమోతికి', testament: 'NT', chapters: 4 },
  { index: 55, bookEn: 'Titus', bookTe: 'తీతుకు', testament: 'NT', chapters: 3 },
  { index: 56, bookEn: 'Philemon', bookTe: 'ఫిలేమోనుకు', testament: 'NT', chapters: 1 },
  { index: 57, bookEn: 'Hebrews', bookTe: 'హెబ్రీయులకు', testament: 'NT', chapters: 13 },
  { index: 58, bookEn: 'James', bookTe: 'యాకోబు', testament: 'NT', chapters: 5 },
  { index: 59, bookEn: '1 Peter', bookTe: '1 పేతురు', testament: 'NT', chapters: 5 },
  { index: 60, bookEn: '2 Peter', bookTe: '2 పేతురు', testament: 'NT', chapters: 3 },
  { index: 61, bookEn: '1 John', bookTe: '1 యోహాను', testament: 'NT', chapters: 5 },
  { index: 62, bookEn: '2 John', bookTe: '2 యోహాను', testament: 'NT', chapters: 1 },
  { index: 63, bookEn: '3 John', bookTe: '3 యోహాను', testament: 'NT', chapters: 1 },
  { index: 64, bookEn: 'Jude', bookTe: 'యూదా', testament: 'NT', chapters: 1 },
  { index: 65, bookEn: 'Revelation', bookTe: 'ప్రకటన గ్రంథము', testament: 'NT', chapters: 22 },
];

// In-memory cache of loaded books keyed by 0..65 index
const bookCache = new Map<number, BibleBookData>();
let booksIndexNames: string[] | null = null;
let godlytaliasFullPromise: Promise<void> | null = null;

async function fetchJsonWithTimeout<T>(url: string, timeoutMs = 12000): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } finally {
    window.clearTimeout(timer);
  }
}

async function resolveAruljohnBookFileName(bookIndex: number): Promise<string> {
  const meta = BIBLE_BOOKS_66[bookIndex];
  if (!booksIndexNames) {
    try {
      const rawBooks = await fetchJsonWithTimeout<unknown[]>(
        'https://raw.githubusercontent.com/aruljohn/Bible-telugu/main/Books.json',
        7000
      );
      if (Array.isArray(rawBooks) && rawBooks.length === 66) {
        booksIndexNames = rawBooks.map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') {
            const obj = item as Record<string, unknown>;
            if (typeof obj.english === 'string') return obj.english;
            if (obj.book && typeof obj.book === 'object') {
              const inner = obj.book as Record<string, unknown>;
              if (typeof inner.english === 'string') return inner.english;
            }
          }
          return '';
        });
      }
    } catch {
      // Fallback to local canonical bookEn mapping
    }
  }
  const candidate = booksIndexNames?.[bookIndex];
  return candidate && candidate.trim() ? candidate.trim() : meta.bookEn;
}

function normalizeAruljohnBook(raw: unknown, meta: BibleBookMeta): BibleBookData {
  const obj = raw as {
    book?: { english?: string; telugu?: string };
    chapters?: Array<{
      chapter?: string | number;
      verses?: Array<{ verse?: string | number; text?: string }>;
    }>;
  };

  if (!obj || !Array.isArray(obj.chapters)) {
    throw new Error('Invalid book JSON shape');
  }

  return {
    bookEn: obj.book?.english || meta.bookEn,
    bookTe: meta.bookTe,
    chapters: obj.chapters.map((ch, idx) => ({
      chapter: String(ch.chapter ?? idx + 1),
      verses: Array.isArray(ch.verses)
        ? ch.verses.map((v, vIdx) => ({
            verse: String(v.verse ?? vIdx + 1),
            text: String(v.text ?? '').trim(),
          }))
        : [],
    })),
  };
}

async function loadFromGodlytaliasFallback(): Promise<void> {
  if (godlytaliasFullPromise) {
    return godlytaliasFullPromise;
  }

  godlytaliasFullPromise = (async () => {
    const urls = [
      'https://raw.githubusercontent.com/godlytalias/Bible-Database/master/Telugu/bible.json',
      'https://cdn.jsdelivr.net/gh/godlytalias/Bible-Database@master/Telugu/bible.json',
    ];

    let parsed: {
      Book?: Array<{
        Chapter?: Array<{
          Verse?: Array<{ Verse?: string; Verseid?: string | number }>;
        }>;
      }>;
    } | null = null;

    for (const url of urls) {
      try {
        parsed = await fetchJsonWithTimeout(url, 18000);
        if (parsed?.Book && Array.isArray(parsed.Book)) break;
      } catch {
        // Try next mirror
      }
    }

    if (!parsed?.Book || !Array.isArray(parsed.Book)) {
      throw new Error('Unable to load fallback Telugu Bible JSON');
    }

    parsed.Book.forEach((rawBook, bIdx) => {
      const meta = BIBLE_BOOKS_66[bIdx];
      if (!meta || !Array.isArray(rawBook.Chapter)) return;
      const normalized: BibleBookData = {
        bookEn: meta.bookEn,
        bookTe: meta.bookTe,
        chapters: rawBook.Chapter.map((ch, cIdx) => ({
          chapter: String(cIdx + 1),
          verses: Array.isArray(ch.Verse)
            ? ch.Verse.map((v, vIdx) => ({
                verse: String(vIdx + 1),
                text: String(v.Verse ?? '').trim(),
              }))
            : [],
        })),
      };
      bookCache.set(bIdx, normalized);
    });
  })();

  try {
    await godlytaliasFullPromise;
  } catch (err) {
    godlytaliasFullPromise = null;
    throw err;
  }
}

export async function fetchTeluguBibleBook(bookIndex: number): Promise<BibleBookData> {
  const cached = bookCache.get(bookIndex);
  if (cached) return cached;

  const meta = BIBLE_BOOKS_66[bookIndex];
  if (!meta) {
    throw new Error(`Invalid book index: ${bookIndex}`);
  }

  // Primary: aruljohn/Bible-telugu (per-book JSON on GitHub raw + jsDelivr mirror)
  const fileName = await resolveAruljohnBookFileName(bookIndex);
  const encoded = encodeURIComponent(fileName);
  const candidateUrls = [
    `https://raw.githubusercontent.com/aruljohn/Bible-telugu/main/${encoded}.json`,
    `https://cdn.jsdelivr.net/gh/aruljohn/Bible-telugu@main/${encoded}.json`,
  ];

  // Handle Song of Songs alternate filename if needed
  if (meta.bookEn === 'Song of Songs') {
    candidateUrls.push(
      'https://raw.githubusercontent.com/aruljohn/Bible-telugu/main/Song%20of%20Solomon.json'
    );
  }

  for (const url of candidateUrls) {
    try {
      const raw = await fetchJsonWithTimeout<unknown>(url, 10000);
      const normalized = normalizeAruljohnBook(raw, meta);
      bookCache.set(bookIndex, normalized);
      return normalized;
    } catch {
      // Try next URL
    }
  }

  // Secondary fallback: godlytalias/Bible-Database full Telugu JSON
  await loadFromGodlytaliasFallback();
  const fromFallback = bookCache.get(bookIndex);
  if (fromFallback) return fromFallback;

  throw new Error(`Failed to load ${meta.bookEn} (${meta.bookTe}) from Telugu Bible repositories.`);
}
