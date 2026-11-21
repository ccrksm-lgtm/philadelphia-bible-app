import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookMarked,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  Palette,
  PenLine,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import {
  BACKGROUND_THEMES,
  CURATED_VERSES,
  buildPollinationsUrl,
} from './data/verses';
import {
  BIBLE_BOOKS_66,
  BibleBookData,
  fetchTeluguBibleBook,
} from './data/teluguBible';
import {
  ASPECT_RATIO_CONFIG,
  CanvasAspectRatio,
  CanvasRenderOptions,
  TeluguFontFamily,
  TextAlignOption,
  TextShadowOption,
  TextVerticalOption,
} from './utils/canvasRenderer';
import { VerseCanvasPreview } from './components/VerseCanvasPreview';

type VerseMode = 'bible' | 'curated' | 'custom';

const TEXT_COLORS: Array<{ label: string; hex: string }> = [
  { label: 'White', hex: '#FFFFFF' },
  { label: 'Gold', hex: '#F5D061' },
  { label: 'Cream', hex: '#FDF6E3' },
];

const OUTLINE_COLORS: Array<{ label: string; value: string; swatch?: string }> = [
  { label: 'None', value: 'none' },
  { label: 'Black', value: '#000000', swatch: '#000000' },
  { label: 'Gold', value: '#D4AF37', swatch: '#D4AF37' },
];

const TELUGU_FONTS: Array<{
  family: TeluguFontFamily;
  teluguName: string;
  styleHint: string;
}> = [
  {
    family: 'Noto Sans Telugu',
    teluguName: 'నోటో సాన్స్ తెలుగు',
    styleHint: 'Crisp · Multi-weight',
  },
  {
    family: 'Mandali',
    teluguName: 'మండలి',
    styleHint: 'Clean Book',
  },
  {
    family: 'NTR',
    teluguName: 'ఎన్.టి.ఆర్',
    styleHint: 'Soft Rounded',
  },
  {
    family: 'Ramabhadra',
    teluguName: 'రామభద్ర',
    styleHint: 'Bold Display',
  },
  {
    family: 'Suranna',
    teluguName: 'సురన్న',
    styleHint: 'Classic Serif',
  },
  {
    family: 'Sree Krushnadevaraya',
    teluguName: 'శ్రీ కృష్ణదేవరాయ',
    styleHint: 'Editorial · Calligraphic',
  },
  {
    family: 'Timmana',
    teluguName: 'తిమ్మన',
    styleHint: 'Compact',
  },
  {
    family: 'Mallanna',
    teluguName: 'మల్లన్న',
    styleHint: 'Friendly',
  },
  {
    family: 'Gurajada',
    teluguName: 'గురజాడ',
    styleHint: 'Handwriting · Poster',
  },
  {
    family: 'Tenali Ramakrishna',
    teluguName: 'తెనాలి రామకృష్ణ',
    styleHint: 'Traditional Print',
  },
  {
    family: 'Gidugu',
    teluguName: 'గిడుగు',
    styleHint: 'Headline Display',
  },
  {
    family: 'Peddana',
    teluguName: 'పెద్దన',
    styleHint: 'Transitional Serif',
  },
  {
    family: 'Suravaram',
    teluguName: 'సురవరం',
    styleHint: 'Brush Script',
  },
  {
    family: 'Sirivennela',
    teluguName: 'సిరివెన్నెల',
    styleHint: 'Poetic Script',
  },
  {
    family: 'Ponnala',
    teluguName: 'పొన్నాల',
    styleHint: 'Elegant Display',
  },
];

const INITIAL_JOHN_3_16 =
  'దేవుడు లోకమును ఎంతో ప్రేమించెను. కాగా ఆయన తన అద్వితీయకుమారునిగా పుట్టిన వానియందు విశ్వాసముంచు ప్రతివాడును నశింపక నిత్యజీవము పొందునట్లు ఆయనను అనుగ్రహించెను.';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const verseSectionRef = useRef<HTMLElement | null>(null);
  const themeSectionRef = useRef<HTMLElement | null>(null);
  const styleSectionRef = useRef<HTMLElement | null>(null);

  // Scripture mode: Full 66-Book Bible, 15 Popular Verses, or Custom Verse
  const [verseMode, setVerseMode] = useState<VerseMode>('bible');

  // Full 66-book Telugu Bible state (defaults to John 3:16)
  const [selectedBookIndex, setSelectedBookIndex] = useState<number>(42); // John
  const [selectedChapterNum, setSelectedChapterNum] = useState<number>(3);
  const [selectedVerseNum, setSelectedVerseNum] = useState<number>(16);
  const [loadedBookData, setLoadedBookData] = useState<BibleBookData | null>(null);
  const [bibleLoading, setBibleLoading] = useState<boolean>(false);
  const [bibleError, setBibleError] = useState<string | null>(null);
  const [bibleReloadToken, setBibleReloadToken] = useState<number>(0);

  // Popular 15 verses state
  const [selectedCuratedId, setSelectedCuratedId] = useState<string>(CURATED_VERSES[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Custom verse state
  const [customBookTe, setCustomBookTe] = useState<string>('కీర్తనలు');
  const [customChapter, setCustomChapter] = useState<string>('23');
  const [customVerseNumText, setCustomVerseNumText] = useState<string>('1');
  const [customTextTe, setCustomTextTe] = useState<string>(
    'యెహోవా నా కాపరి; నాకు లేమి కలుగదు.\nపచ్చికగల చోట్ల ఆయన నన్ను పరుండజేయుచున్నాడు.'
  );

  // Canvas Aspect Ratio & Background state
  const [aspectRatio, setAspectRatio] = useState<CanvasAspectRatio>('square');
  const [selectedThemeId, setSelectedThemeId] = useState<string>(BACKGROUND_THEMES[0].id);
  const [customScenePrompt, setCustomScenePrompt] = useState<string>('');
  const [activePromptOverride, setActivePromptOverride] = useState<string>('');
  const [aiSeed, setAiSeed] = useState<number>(1047);
  const [customUploadUrl, setCustomUploadUrl] = useState<string | null>(null);
  const [customUploadName, setCustomUploadName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Typography, Color, Outline & Shadow customization state
  const [fontFamily, setFontFamily] = useState<TeluguFontFamily>('Noto Sans Telugu');
  const [fontWeight, setFontWeight] = useState<'400' | '600' | '700'>('600');
  const [fontSize, setFontSize] = useState<number>(46);
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [textAlign, setTextAlign] = useState<TextAlignOption>('center');
  const [verticalAlign, setVerticalAlign] = useState<TextVerticalOption>('middle');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.45);
  const [outlineColor, setOutlineColor] = useState<string>('none');
  const [outlineWidth, setOutlineWidth] = useState<number>(0);
  const [textShadow, setTextShadow] = useState<TextShadowOption>('soft');

  // Church Logo & Full-Width Footer Banner state
  const [churchLogoUrl, setChurchLogoUrl] = useState<string | null>(null);
  const [churchLogoName, setChurchLogoName] = useState<string | null>(null);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [footerBannerUrl, setFooterBannerUrl] = useState<string | null>(null);
  const [footerBannerName, setFooterBannerName] = useState<string | null>(null);
  const [bannerUploadError, setBannerUploadError] = useState<string | null>(null);

  // Download feedback state
  const [downloadBusy, setDownloadBusy] = useState<boolean>(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Fetch the selected book from the 66-book Telugu Bible GitHub repositories
  useEffect(() => {
    let cancelled = false;
    setBibleLoading(true);
    setBibleError(null);

    fetchTeluguBibleBook(selectedBookIndex)
      .then((bookData) => {
        if (cancelled) return;
        setLoadedBookData(bookData);
        setBibleLoading(false);

        // Clamp chapter & verse safely within the loaded book
        const maxCh = bookData.chapters.length || 1;
        setSelectedChapterNum((prevCh) => {
          const validCh = prevCh >= 1 && prevCh <= maxCh ? prevCh : 1;
          const chapterObj = bookData.chapters[validCh - 1];
          const maxV = chapterObj?.verses.length || 1;
          setSelectedVerseNum((prevV) => (prevV >= 1 && prevV <= maxV ? prevV : 1));
          return validCh;
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setBibleLoading(false);
        setBibleError(
          err instanceof Error
            ? err.message
            : 'Unable to fetch Telugu Bible data right now.'
        );
      });

    return () => {
      cancelled = true;
    };
  }, [selectedBookIndex, bibleReloadToken]);

  const selectedBookMeta = BIBLE_BOOKS_66[selectedBookIndex] ?? BIBLE_BOOKS_66[42];

  const availableChapters = useMemo(() => {
    if (loadedBookData && loadedBookData.bookEn.toLowerCase() === selectedBookMeta.bookEn.toLowerCase()) {
      return loadedBookData.chapters;
    }
    // Provide canonical chapter count placeholders while fetching
    return Array.from({ length: selectedBookMeta.chapters }, (_, i) => ({
      chapter: String(i + 1),
      verses: [],
    }));
  }, [loadedBookData, selectedBookMeta]);

  const activeChapterData = useMemo(() => {
    return availableChapters[selectedChapterNum - 1] ?? availableChapters[0];
  }, [availableChapters, selectedChapterNum]);

  const availableVerses = useMemo(() => {
    return activeChapterData?.verses ?? [];
  }, [activeChapterData]);

  const activeBibleVerseText = useMemo(() => {
    const found = availableVerses[selectedVerseNum - 1];
    if (found?.text) return found.text;
    // Instant fallback for default John 3:16 while JSON finishes loading
    if (selectedBookIndex === 42 && selectedChapterNum === 3 && selectedVerseNum === 16) {
      return INITIAL_JOHN_3_16;
    }
    return '';
  }, [availableVerses, selectedVerseNum, selectedBookIndex, selectedChapterNum]);

  const selectedCuratedVerse = useMemo(
    () => CURATED_VERSES.find((v) => v.id === selectedCuratedId) ?? CURATED_VERSES[0],
    [selectedCuratedId]
  );

  const selectedTheme = useMemo(
    () => BACKGROUND_THEMES.find((t) => t.id === selectedThemeId) ?? BACKGROUND_THEMES[0],
    [selectedThemeId]
  );

  const filteredCuratedVerses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CURATED_VERSES;
    return CURATED_VERSES.filter(
      (v) =>
        v.bookTe.toLowerCase().includes(q) ||
        v.bookEn.toLowerCase().includes(q) ||
        v.textTe.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        `${v.chapter}:${v.verse}`.includes(q)
    );
  }, [searchQuery]);

  const activeVerseText = useMemo(() => {
    if (verseMode === 'bible') {
      return activeBibleVerseText || INITIAL_JOHN_3_16;
    }
    if (verseMode === 'curated') {
      return selectedCuratedVerse.textTe;
    }
    return customTextTe;
  }, [verseMode, activeBibleVerseText, selectedCuratedVerse, customTextTe]);

  const activeReferenceText = useMemo(() => {
    if (verseMode === 'bible') {
      return `${selectedBookMeta.bookTe} ${selectedChapterNum}:${selectedVerseNum}`;
    }
    if (verseMode === 'curated') {
      return `${selectedCuratedVerse.bookTe} ${selectedCuratedVerse.chapter}:${selectedCuratedVerse.verse}`;
    }
    const book = customBookTe.trim();
    const chap = customChapter.trim();
    const ver = customVerseNumText.trim();
    if (!book && !chap && !ver) return '';
    if (book && chap && ver) return `${book} ${chap}:${ver}`;
    if (book && chap) return `${book} ${chap}`;
    return [book, chap, ver].filter(Boolean).join(' ');
  }, [
    verseMode,
    selectedBookMeta,
    selectedChapterNum,
    selectedVerseNum,
    selectedCuratedVerse,
    customBookTe,
    customChapter,
    customVerseNumText,
  ]);

  const activeDimensions = ASPECT_RATIO_CONFIG[aspectRatio];
  const activePrompt = activePromptOverride.trim() || selectedTheme.englishVisualPrompt;
  const aiImageUrl = useMemo(
    () =>
      buildPollinationsUrl(
        activePrompt,
        aiSeed,
        activeDimensions.width,
        activeDimensions.height
      ),
    [activePrompt, aiSeed, activeDimensions.width, activeDimensions.height]
  );

  const renderOptions: CanvasRenderOptions = useMemo(
    () => ({
      aspectRatio,
      verseText: activeVerseText,
      referenceText: activeReferenceText,
      fontFamily,
      fontSize,
      fontWeight,
      textColor,
      textAlign,
      verticalAlign,
      overlayOpacity,
      outlineColor,
      outlineWidth,
      textShadow,
      fallbackGradient: selectedTheme.fallbackGradient,
    }),
    [
      aspectRatio,
      activeVerseText,
      activeReferenceText,
      fontFamily,
      fontSize,
      fontWeight,
      textColor,
      textAlign,
      verticalAlign,
      overlayOpacity,
      outlineColor,
      outlineWidth,
      textShadow,
      selectedTheme.fallbackGradient,
    ]
  );

  const handleBookChange = (newBookIndex: number) => {
    setSelectedBookIndex(newBookIndex);
    setSelectedChapterNum(1);
    setSelectedVerseNum(1);
  };

  const handleChapterChange = (newChapterNum: number) => {
    setSelectedChapterNum(newChapterNum);
    setSelectedVerseNum(1);
  };

  const handleStepVerse = (delta: -1 | 1) => {
    const maxV = availableVerses.length || 1;
    const next = selectedVerseNum + delta;
    if (next >= 1 && next <= maxV) {
      setSelectedVerseNum(next);
    }
  };

  const handleSelectTheme = (themeId: string) => {
    setCustomUploadUrl(null);
    setCustomUploadName(null);
    setUploadError(null);
    setSelectedThemeId(themeId);
    setActivePromptOverride('');
    setAiSeed((prev) => prev + 1);
  };

  const handleApplyCustomPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customScenePrompt.trim();
    if (!cleaned) return;
    setCustomUploadUrl(null);
    setCustomUploadName(null);
    setUploadError(null);
    setActivePromptOverride(
      `${cleaned}, peaceful spiritual landscape, soft atmospheric lighting, no text`
    );
    setAiSeed(Math.floor(Math.random() * 90000) + 1000);
  };

  const handleRegenerateAi = () => {
    setCustomUploadUrl(null);
    setCustomUploadName(null);
    setAiSeed(Math.floor(Math.random() * 90000) + 1000);
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomUploadUrl(reader.result);
        setCustomUploadName(file.name);
      }
    };
    reader.onerror = () => {
      setUploadError('Could not read the selected image. Please try another file.');
    };
    reader.readAsDataURL(file);
    // Reset input so re-selecting the same file works
    e.target.value = '';
  };

  const handleClearCustomUpload = () => {
    setCustomUploadUrl(null);
    setCustomUploadName(null);
    setUploadError(null);
  };

  const handleUploadChurchLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoUploadError('Please select a valid PNG or JPG logo image.');
      return;
    }

    setLogoUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setChurchLogoUrl(reader.result);
        setChurchLogoName(file.name);
      }
    };
    reader.onerror = () => {
      setLogoUploadError('Could not read the logo file. Please try another image.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClearChurchLogo = () => {
    setChurchLogoUrl(null);
    setChurchLogoName(null);
    setLogoUploadError(null);
  };

  const handleUploadFooterBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setBannerUploadError('Please select a valid PNG or JPG footer banner image.');
      return;
    }

    setBannerUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFooterBannerUrl(reader.result);
        setFooterBannerName(file.name);
      }
    };
    reader.onerror = () => {
      setBannerUploadError('Could not read the footer banner file. Please try another image.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClearFooterBanner = () => {
    setFooterBannerUrl(null);
    setFooterBannerName(null);
    setBannerUploadError(null);
  };

  const handleSelectOutlineColor = (colorValue: string) => {
    setOutlineColor(colorValue);
    if (colorValue !== 'none' && outlineWidth === 0) {
      setOutlineWidth(3);
    } else if (colorValue === 'none') {
      setOutlineWidth(0);
    }
  };

  const handleOutlineWidthChange = (nextWidth: number) => {
    setOutlineWidth(nextWidth);
    if (nextWidth > 0 && outlineColor === 'none') {
      setOutlineColor('#000000');
    } else if (nextWidth === 0 && outlineColor !== 'none') {
      setOutlineColor('none');
    }
  };

  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloadBusy(true);
    setDownloadNotice(null);

    const slug =
      verseMode === 'bible'
        ? `${selectedBookMeta.bookEn.toLowerCase().replace(/\s+/g, '-')}-${selectedChapterNum}-${selectedVerseNum}`
        : verseMode === 'curated'
          ? selectedCuratedVerse.id
          : 'custom-telugu-verse';
    const fileName = `vakyam-${slug}-${aspectRatio}.png`;

    const triggerLinkDownload = (href: string, revoke?: () => void) => {
      const link = document.createElement('a');
      link.download = fileName;
      link.href = href;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (revoke) {
        window.setTimeout(revoke, 1000);
      }
      setDownloadBusy(false);
      setDownloadNotice(
        `Saved ${fileName} (${activeDimensions.width} × ${activeDimensions.height} PNG)`
      );
      window.setTimeout(() => setDownloadNotice(null), 3500);
    };

    try {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            triggerLinkDownload(url, () => URL.revokeObjectURL(url));
          } else {
            const dataUrl = canvas.toDataURL('image/png');
            triggerLinkDownload(dataUrl);
          }
        },
        'image/png',
        1.0
      );
    } catch {
      setDownloadBusy(false);
      setDownloadNotice('Unable to export PNG in this browser session. Please try again.');
    }
  };

  const scrollToSection = (
    ref: React.RefObject<HTMLElement | null>,
    targetMode?: VerseMode
  ) => {
    if (targetMode) {
      setVerseMode(targetMode);
    }
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const oldTestamentBooks = useMemo(
    () => BIBLE_BOOKS_66.filter((b) => b.testament === 'OT'),
    []
  );
  const newTestamentBooks = useMemo(
    () => BIBLE_BOOKS_66.filter((b) => b.testament === 'NT'),
    []
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1E1B18]">
      {/* Strict 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-sm border-b border-[#E6E0D6]">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="font-display text-2xl font-semibold tracking-tight text-[#1E1B18] whitespace-nowrap shrink-0"
          >
            Philadelphia Prardhana Mandiram 
          </a>

          <nav
            aria-label="Studio Sections"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5C554D]"
          >
            <button
              type="button"
              onClick={() => scrollToSection(verseSectionRef, 'bible')}
              className="hover:text-[#1E1B18] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Full Bible
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(verseSectionRef, 'curated')}
              className="hover:text-[#1E1B18] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Popular Verses
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(verseSectionRef, 'custom')}
              className="hover:text-[#1E1B18] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Custom Verse
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(themeSectionRef)}
              className="hover:text-[#1E1B18] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Backgrounds
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(styleSectionRef)}
              className="hover:text-[#1E1B18] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Typography
            </button>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={downloadBusy}
              className="px-4 py-2 rounded-lg bg-[#854D0E] hover:bg-[#713F12] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#854D0E]"
            >
              Download Image
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Container */}
      <main id="top" className="flex-1 max-w-[1320px] w-full mx-auto px-5 sm:px-8 py-8 lg:py-10">
        {/* Editorial Studio Intro */}
        <div className="mb-8 pb-7 border-b border-[#E6E0D6] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-wide text-[#854D0E] mb-2">
              Telugu Christian Scripture Artwork
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#1E1B18] [text-wrap:balance]">
              Telugu Bible Verse AI Image Generator
            </h1>
            <p className="mt-2.5 text-sm sm:text-base text-[#5C554D] leading-relaxed">
              Browse all 66 books of the Telugu Holy Bible, choose from curated verses or write your own, pair with AI landscapes or personal photos, and download a crisp PNG.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#6B6359] shrink-0">
            <span className="tabular-nums">66 Books</span>
            <span aria-hidden="true">·</span>
            <span>AI &amp; Custom Uploads</span>
            <span aria-hidden="true">·</span>
            <span>1080p PNG</span>
          </div>
        </div>

        {/* Two-Column Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Scripture, Backgrounds & Typography Controls */}
          <div className="lg:col-span-5 flex flex-col gap-9">
            {/* 1. Scripture Selector Section */}
            <section ref={verseSectionRef} aria-labelledby="scripture-heading" className="scroll-mt-24">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2
                  id="scripture-heading"
                  className="font-display text-2xl font-semibold text-[#1E1B18]"
                >
                  1. Choose Scripture
                </h2>

                {/* 3-Tab Segmented Mode Toggle */}
                <div
                  role="tablist"
                  aria-label="Verse Source"
                  className="inline-flex items-center p-1 bg-[#EFEAE2] rounded-lg"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={verseMode === 'bible'}
                    onClick={() => setVerseMode('bible')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      verseMode === 'bible'
                        ? 'bg-white text-[#1E1B18] shadow-xs'
                        : 'text-[#5C554D] hover:text-[#1E1B18]'
                    }`}
                  >
                    <BookMarked className="w-3.5 h-3.5" />
                    <span>All 66 Books</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={verseMode === 'curated'}
                    onClick={() => setVerseMode('curated')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      verseMode === 'curated'
                        ? 'bg-white text-[#1E1B18] shadow-xs'
                        : 'text-[#5C554D] hover:text-[#1E1B18]'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Popular (15)</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={verseMode === 'custom'}
                    onClick={() => setVerseMode('custom')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      verseMode === 'custom'
                        ? 'bg-white text-[#1E1B18] shadow-xs'
                        : 'text-[#5C554D] hover:text-[#1E1B18]'
                    }`}
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    <span>Custom</span>
                  </button>
                </div>
              </div>

              {verseMode === 'bible' && (
                <div className="bg-white border border-[#E2DCD2] rounded-xl p-4 flex flex-col gap-4">
                  {/* Select Book (పుస్తకం) */}
                  <div>
                    <label
                      htmlFor="bible-book-select"
                      className="block text-xs font-medium text-[#5C554D] mb-1.5"
                    >
                      Select Book (పుస్తకం)
                    </label>
                    <select
                      id="bible-book-select"
                      value={selectedBookIndex}
                      onChange={(e) => handleBookChange(Number(e.target.value))}
                      className="w-full px-3 py-2.5 text-sm font-telugu-noto bg-[#FAF8F5] border border-[#E2DCD2] rounded-lg text-[#1E1B18] focus:outline-none focus:border-[#854D0E] cursor-pointer"
                    >
                      <optgroup label="పాత నిబంధన · Old Testament (39)">
                        {oldTestamentBooks.map((book) => (
                          <option key={book.index} value={book.index}>
                            {book.index + 1}. {book.bookTe} ({book.bookEn})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="కొత్త నిబంధన · New Testament (27)">
                        {newTestamentBooks.map((book) => (
                          <option key={book.index} value={book.index}>
                            {book.index + 1}. {book.bookTe} ({book.bookEn})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Select Chapter (అధ్యాయం) & Select Verse (వచనం) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="bible-chapter-select"
                        className="block text-xs font-medium text-[#5C554D] mb-1.5"
                      >
                        Select Chapter (అధ్యాయం)
                      </label>
                      <select
                        id="bible-chapter-select"
                        value={selectedChapterNum}
                        onChange={(e) => handleChapterChange(Number(e.target.value))}
                        className="w-full px-3 py-2.5 text-sm tabular-nums bg-[#FAF8F5] border border-[#E2DCD2] rounded-lg text-[#1E1B18] focus:outline-none focus:border-[#854D0E] cursor-pointer"
                      >
                        {availableChapters.map((ch, idx) => (
                          <option key={idx} value={idx + 1}>
                            అధ్యాయం {ch.chapter || idx + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="bible-verse-select"
                        className="block text-xs font-medium text-[#5C554D] mb-1.5"
                      >
                        Select Verse (వచనం)
                      </label>
                      <select
                        id="bible-verse-select"
                        value={selectedVerseNum}
                        disabled={availableVerses.length === 0}
                        onChange={(e) => setSelectedVerseNum(Number(e.target.value))}
                        className="w-full px-3 py-2.5 text-sm tabular-nums bg-[#FAF8F5] border border-[#E2DCD2] rounded-lg text-[#1E1B18] focus:outline-none focus:border-[#854D0E] cursor-pointer disabled:opacity-60"
                      >
                        {availableVerses.length === 0 ? (
                          <option value={selectedVerseNum}>వచనం {selectedVerseNum}</option>
                        ) : (
                          availableVerses.map((v, idx) => (
                            <option key={idx} value={idx + 1}>
                              వచనం {v.verse || idx + 1}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Verse Preview & Quick Stepper */}
                  <div className="pt-3 border-t border-[#ECE7DF]">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-telugu-noto text-xs font-semibold text-[#854D0E]">
                        {selectedBookMeta.bookTe} {selectedChapterNum}:{selectedVerseNum}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStepVerse(-1)}
                          disabled={selectedVerseNum <= 1 || availableVerses.length === 0}
                          aria-label="Previous verse"
                          className="p-1.5 rounded-lg border border-[#E2DCD2] bg-[#FAF8F5] hover:bg-[#EFEAE2] text-[#1E1B18] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStepVerse(1)}
                          disabled={
                            availableVerses.length === 0 ||
                            selectedVerseNum >= availableVerses.length
                          }
                          aria-label="Next verse"
                          className="p-1.5 rounded-lg border border-[#E2DCD2] bg-[#FAF8F5] hover:bg-[#EFEAE2] text-[#1E1B18] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {bibleLoading ? (
                      <div className="flex items-center gap-2 py-2 text-xs text-[#6B6359]">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#854D0E]" />
                        <span>Loading {selectedBookMeta.bookTe} ({selectedBookMeta.bookEn})…</span>
                      </div>
                    ) : bibleError ? (
                      <div className="py-2 text-xs text-[#991B1B] flex flex-col gap-2">
                        <span>{bibleError}</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setBibleReloadToken((t) => t + 1)}
                            className="font-semibold text-[#854D0E] hover:underline cursor-pointer"
                          >
                            Retry
                          </button>
                          <button
                            type="button"
                            onClick={() => setVerseMode('curated')}
                            className="font-medium text-[#5C554D] hover:underline cursor-pointer"
                          >
                            Use Popular (15) Offline
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="font-telugu-noto text-sm text-[#3E3730] leading-relaxed">
                        {activeBibleVerseText || INITIAL_JOHN_3_16}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {verseMode === 'curated' && (
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#7D7469] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter by book, topic, or Telugu word…"
                      aria-label="Filter curated Telugu Bible verses"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E2DCD2] rounded-xl text-[#1E1B18] placeholder:text-[#8E857A] focus:outline-none focus:border-[#854D0E]"
                    />
                  </div>

                  <div className="max-h-[340px] overflow-y-auto pr-1 divide-y divide-[#ECE7DF] border border-[#E2DCD2] rounded-xl bg-white">
                    {filteredCuratedVerses.length === 0 ? (
                      <div className="p-6 text-center text-sm text-[#6B6359]">
                        No matching verses found. Try clearing your filter or switch to All 66 Books.
                      </div>
                    ) : (
                      filteredCuratedVerses.map((verse) => {
                        const isActive = verse.id === selectedCuratedVerse.id;
                        return (
                          <button
                            key={verse.id}
                            type="button"
                            onClick={() => setSelectedCuratedId(verse.id)}
                            className={`w-full text-left px-4 py-3.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#854D0E] ${
                              isActive
                                ? 'bg-[#F5EFE4]'
                                : 'bg-white hover:bg-[#FAF7F2]'
                            }`}
                          >
                            <div className="flex items-baseline justify-between gap-3">
                              <span className="font-telugu-noto text-sm font-semibold text-[#1E1B18]">
                                {verse.bookTe} {verse.chapter}:{verse.verse}
                              </span>
                              <span className="text-xs text-[#6B6359] whitespace-nowrap shrink-0">
                                {verse.bookEn} · {verse.category}
                              </span>
                            </div>
                            <p className="mt-1 font-telugu-noto text-sm text-[#4A433B] line-clamp-2 leading-relaxed">
                              {verse.textTe}
                            </p>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {verseMode === 'custom' && (
                <div className="bg-white border border-[#E2DCD2] rounded-xl p-4 flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label
                        htmlFor="custom-book"
                        className="block text-xs font-medium text-[#5C554D] mb-1.5"
                      >
                        Book (పుస్తకము)
                      </label>
                      <input
                        id="custom-book"
                        type="text"
                        value={customBookTe}
                        onChange={(e) => setCustomBookTe(e.target.value)}
                        placeholder="యోహాను"
                        className="w-full px-3 py-2 text-sm font-telugu-noto bg-[#FAF8F5] border border-[#E2DCD2] rounded-lg focus:outline-none focus:border-[#854D0E]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="custom-chapter"
                        className="block text-xs font-medium text-[#5C554D] mb-1.5"
                      >
                        Chapter (అధ్యాయము)
                      </label>
                      <input
                        id="custom-chapter"
                        type="text"
                        value={customChapter}
                        onChange={(e) => setCustomChapter(e.target.value)}
                        placeholder="3"
                        className="w-full px-3 py-2 text-sm tabular-nums bg-[#FAF8F5] border border-[#E2DCD2] rounded-lg focus:outline-none focus:border-[#854D0E]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="custom-verse-num"
                        className="block text-xs font-medium text-[#5C554D] mb-1.5"
                      >
                        Verse (వచనము)
                      </label>
                      <input
                        id="custom-verse-num"
                        type="text"
                        value={customVerseNumText}
                        onChange={(e) => setCustomVerseNumText(e.target.value)}
                        placeholder="16"
                        className="w-full px-3 py-2 text-sm tabular-nums bg-[#FAF8F5] border border-[#E2DCD2] rounded-lg focus:outline-none focus:border-[#854D0E]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="custom-verse-text"
                        className="text-xs font-medium text-[#5C554D]"
                      >
                        Telugu Bible Verse Text
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomBookTe(selectedBookMeta.bookTe);
                          setCustomChapter(String(selectedChapterNum));
                          setCustomVerseNumText(String(selectedVerseNum));
                          setCustomTextTe(activeBibleVerseText || INITIAL_JOHN_3_16);
                        }}
                        className="text-xs font-medium text-[#854D0E] hover:underline cursor-pointer"
                      >
                        Load current Bible verse
                      </button>
                    </div>
                    <textarea
                      id="custom-verse-text"
                      rows={4}
                      value={customTextTe}
                      onChange={(e) => setCustomTextTe(e.target.value)}
                      placeholder="మీకు కావలసిన తెలుగు బైబిల్ వచనమును ఇక్కడ టైప్ చేయండి లేదా పేస్ట్ చేయండి…"
                      className="w-full px-3.5 py-2.5 text-sm font-telugu-noto leading-relaxed bg-[#FAF8F5] border border-[#E2DCD2] rounded-lg focus:outline-none focus:border-[#854D0E] resize-y"
                    />
                  </div>
                </div>
              )}
            </section>

            <hr className="border-[#E6E0D6]" />

            {/* 2. Aspect Ratio & Background Theme Section */}
            <section ref={themeSectionRef} aria-labelledby="backgrounds-heading" className="scroll-mt-24">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2
                  id="backgrounds-heading"
                  className="font-display text-2xl font-semibold text-[#1E1B18]"
                >
                  2. Canvas Size &amp; Background
                </h2>
                <button
                  type="button"
                  onClick={handleRegenerateAi}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#854D0E] hover:text-[#6B3D0A] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate AI</span>
                </button>
              </div>

              {/* Image Orientation / Aspect Ratio Selector */}
              <div className="mb-4">
                <span className="block text-xs font-medium text-[#5C554D] mb-2">
                  Image Orientation &amp; Size
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['square', 'landscape', 'portrait'] as const).map((ratioKey) => {
                    const cfg = ASPECT_RATIO_CONFIG[ratioKey];
                    const active = aspectRatio === ratioKey;
                    return (
                      <button
                        key={ratioKey}
                        type="button"
                        onClick={() => setAspectRatio(ratioKey)}
                        aria-pressed={active}
                        className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#F5EFE4] border-[#854D0E]'
                            : 'bg-white border-[#E2DCD2] hover:border-[#C9BFAF]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-[#1E1B18] capitalize">
                            {ratioKey}
                          </span>
                          <span className="text-[11px] tabular-nums text-[#854D0E] font-medium">
                            {cfg.shortLabel}
                          </span>
                        </div>
                        <div className="mt-0.5 text-[11px] tabular-nums text-[#6B6359]">
                          {cfg.width}×{cfg.height}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BACKGROUND_THEMES.map((theme) => {
                  const isSelected =
                    !customUploadUrl &&
                    !activePromptOverride &&
                    selectedThemeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#854D0E] ${
                        isSelected
                          ? 'bg-[#F5EFE4] border-[#854D0E]'
                          : 'bg-white border-[#E2DCD2] hover:border-[#C9BFAF]'
                      }`}
                    >
                      <img
                        src={theme.fallbackImage}
                        alt={theme.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover shrink-0 bg-[#E6E0D6]"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#1E1B18] truncate">
                          {theme.name}
                        </div>
                        <div className="text-xs text-[#6B6359] truncate">
                          {theme.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Upload Your Own Image */}
              <div className="mt-3.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadFile}
                  className="hidden"
                />

                {customUploadUrl ? (
                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#F5EFE4] border border-[#854D0E]">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={customUploadUrl}
                        alt="Uploaded custom background"
                        className="w-11 h-11 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#1E1B18] truncate">
                          {customUploadName || 'Custom Background'}
                        </div>
                        <div className="text-xs text-[#6B6359]">
                          Using your uploaded photo
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E2DCD2] text-xs font-medium text-[#1E1B18] hover:bg-[#FAF8F5] cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleClearCustomUpload}
                        aria-label="Remove uploaded image"
                        className="p-1.5 rounded-lg bg-white border border-[#E2DCD2] text-[#5C554D] hover:text-[#1E1B18] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-[#FAF7F2] border border-dashed border-[#C9BFAF] text-sm font-medium text-[#1E1B18] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#854D0E]"
                  >
                    <Upload className="w-4 h-4 text-[#854D0E]" />
                    <span>Upload Your Own Image</span>
                  </button>
                )}

                {uploadError && (
                  <p className="mt-1.5 text-xs text-[#991B1B]">{uploadError}</p>
                )}
              </div>

              {/* Custom English Scene Prompt for Pollinations.ai */}
              <form onSubmit={handleApplyCustomPrompt} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={customScenePrompt}
                  onChange={(e) => setCustomScenePrompt(e.target.value)}
                  placeholder="Or describe an AI scene in English (e.g., quiet lakeside at dawn)…"
                  aria-label="Custom English visual prompt for AI background"
                  className="flex-1 min-w-0 px-3.5 py-2.5 text-sm bg-white border border-[#E2DCD2] rounded-xl text-[#1E1B18] placeholder:text-[#8E857A] focus:outline-none focus:border-[#854D0E]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1E1B18] hover:bg-[#332E29] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Generate</span>
                </button>
              </form>
            </section>

            <hr className="border-[#E6E0D6]" />

            {/* 3. Typography & Visual Customization Section */}
            <section ref={styleSectionRef} aria-labelledby="typography-heading" className="scroll-mt-24">
              <div className="flex items-center justify-between gap-3 mb-5">
                <h2
                  id="typography-heading"
                  className="font-display text-2xl font-semibold text-[#1E1B18]"
                >
                  3. Typography & Style
                </h2>
                <SlidersHorizontal className="w-4 h-4 text-[#6B6359]" aria-hidden="true" />
              </div>

              <div className="flex flex-col gap-6">
                {/* Compact HTML Select Dropdown for 15 Telugu Google Fonts */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="telugu-font-select"
                      className="text-xs font-medium text-[#5C554D]"
                    >
                      Telugu Font Style (15 Fonts)
                    </label>
                    <span className="text-[11px] text-[#6B6359]">
                      {TELUGU_FONTS.find((f) => f.family === fontFamily)?.styleHint}
                    </span>
                  </div>
                  <select
                    id="telugu-font-select"
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value as TeluguFontFamily)}
                    className="w-full px-3.5 py-2.5 text-sm font-telugu-noto bg-white border border-[#E2DCD2] rounded-xl text-[#1E1B18] focus:outline-none focus:border-[#854D0E] cursor-pointer"
                  >
                    {TELUGU_FONTS.map((font) => (
                      <option key={font.family} value={font.family}>
                        {font.teluguName} — {font.family} ({font.styleHint})
                      </option>
                    ))}
                  </select>
                  <p
                    className="mt-2 px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#ECE7DF] text-sm text-[#1E1B18] truncate"
                    style={{
                      fontFamily: `"${fontFamily}", "Noto Sans Telugu", sans-serif`,
                      fontWeight: fontFamily === 'Noto Sans Telugu' ? fontWeight : '400',
                    }}
                  >
                    దేవుడు ప్రేమయై యున్నాడు · {fontFamily}
                  </p>
                </div>

                {/* 3x3 Text Alignment & Placement Grid + Font Weight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[#5C554D]">
                        Alignment &amp; Placement
                      </span>
                      <span className="text-[11px] font-medium text-[#854D0E] capitalize">
                        {verticalAlign}-{textAlign}
                      </span>
                    </div>

                    <div
                      role="group"
                      aria-label="9-Position Text Alignment and Placement Grid"
                      className="inline-grid grid-cols-3 gap-1.5 p-1.5 bg-[#EFEAE2] rounded-xl border border-[#E2DCD2]"
                    >
                      {(['top', 'middle', 'bottom'] as const).map((vPos) =>
                        (['left', 'center', 'right'] as const).map((hPos) => {
                          const isActive =
                            verticalAlign === vPos && textAlign === hPos;
                          const label = `${vPos}-${hPos}`;
                          const verticalFlex =
                            vPos === 'top'
                              ? 'justify-start'
                              : vPos === 'bottom'
                                ? 'justify-end'
                                : 'justify-center';
                          const horizontalFlex =
                            hPos === 'left'
                              ? 'items-start'
                              : hPos === 'right'
                                ? 'items-end'
                                : 'items-center';

                          return (
                            <button
                              key={label}
                              type="button"
                              title={`Place text at ${vPos} ${hPos}`}
                              aria-label={`Place text at ${vPos} ${hPos}`}
                              aria-pressed={isActive}
                              onClick={() => {
                                setVerticalAlign(vPos);
                                setTextAlign(hPos);
                              }}
                              className={`w-10 h-10 p-1.5 rounded-lg flex flex-col gap-[2.5px] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#854D0E] ${verticalFlex} ${horizontalFlex} ${
                                isActive
                                  ? 'bg-[#854D0E] shadow-xs'
                                  : 'bg-white/85 hover:bg-white border border-[#E2DCD2]/70'
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`h-[2px] w-4 rounded-full ${
                                  isActive ? 'bg-white' : 'bg-[#786F65]'
                                }`}
                              />
                              <span
                                aria-hidden="true"
                                className={`h-[2px] w-2.5 rounded-full ${
                                  isActive ? 'bg-white/90' : 'bg-[#786F65]'
                                }`}
                              />
                              <span
                                aria-hidden="true"
                                className={`h-[2px] w-3.5 rounded-full ${
                                  isActive ? 'bg-white' : 'bg-[#786F65]'
                                }`}
                              />
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-[#5C554D] mb-2">
                      Font Weight {fontFamily !== 'Noto Sans Telugu' ? '(Regular)' : ''}
                    </span>
                    <div className="grid grid-cols-3 p-1 bg-[#EFEAE2] rounded-xl">
                      {(
                        [
                          { id: '400', label: 'Regular' },
                          { id: '600', label: 'Medium' },
                          { id: '700', label: 'Bold' },
                        ] as const
                      ).map((w) => {
                        const disabled =
                          fontFamily !== 'Noto Sans Telugu' && w.id !== '400';
                        const active =
                          (fontFamily !== 'Noto Sans Telugu' ? '400' : fontWeight) === w.id;
                        return (
                          <button
                            key={w.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => setFontWeight(w.id)}
                            className={`py-2 px-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                              disabled
                                ? 'text-[#A0978B] cursor-not-allowed'
                                : active
                                  ? 'bg-white text-[#1E1B18] shadow-xs cursor-pointer'
                                  : 'text-[#5C554D] hover:text-[#1E1B18] cursor-pointer'
                            }`}
                          >
                            {w.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Verse Text Color (3 Presets + Custom Native Color Picker) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-[#5C554D]">
                      Verse Text Color
                    </span>
                    <span className="text-[11px] font-mono text-[#6B6359] uppercase">
                      {textColor}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TEXT_COLORS.map((color) => {
                      const active = textColor.toUpperCase() === color.hex;
                      return (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => setTextColor(color.hex)}
                          aria-pressed={active}
                          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                            active
                              ? 'bg-[#F5EFE4] border-[#854D0E] text-[#1E1B18]'
                              : 'bg-white border-[#E2DCD2] text-[#5C554D] hover:text-[#1E1B18]'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span>{color.label}</span>
                        </button>
                      );
                    })}

                    <label
                      className={`relative flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap overflow-hidden ${
                        !TEXT_COLORS.some((c) => c.hex === textColor.toUpperCase())
                          ? 'bg-[#F5EFE4] border-[#854D0E] text-[#1E1B18]'
                          : 'bg-white border-[#E2DCD2] text-[#5C554D] hover:text-[#1E1B18]'
                      }`}
                    >
                      <Palette className="w-3.5 h-3.5 text-[#854D0E] shrink-0" />
                      <span>Custom</span>
                      <span
                        aria-hidden="true"
                        className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: textColor }}
                      />
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        aria-label="Pick custom verse text color"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Font Size Slider & Backdrop Scrim Slider (0% - 90%) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <label htmlFor="font-size-slider" className="font-medium text-[#5C554D]">
                        Font Size
                      </label>
                      <span className="tabular-nums font-semibold text-[#1E1B18]">
                        {fontSize} px
                      </span>
                    </div>
                    <input
                      id="font-size-slider"
                      type="range"
                      min={30}
                      max={72}
                      step={2}
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="studio-slider w-full cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <label htmlFor="overlay-slider" className="font-medium text-[#5C554D]">
                        Backdrop Scrim
                      </label>
                      <span className="tabular-nums font-semibold text-[#1E1B18]">
                        {Math.round(overlayOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      id="overlay-slider"
                      type="range"
                      min={0}
                      max={90}
                      step={5}
                      value={Math.round(overlayOpacity * 100)}
                      onChange={(e) => setOverlayOpacity(Number(e.target.value) / 100)}
                      className="studio-slider w-full cursor-pointer"
                    />
                  </div>
                </div>

                {/* Text Outline (Stroke) & Shadow Controls */}
                <div className="pt-4 border-t border-[#ECE7DF] flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1E1B18]">
                      Text Outline (Stroke) &amp; Shadow
                    </span>
                    <span className="text-[11px] text-[#6B6359]">
                      Keeps Telugu crisp on bright scenes
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[#5C554D]">
                        Outline Color
                      </span>
                      <span className="text-[11px] font-mono text-[#6B6359] uppercase">
                        {outlineColor === 'none' ? 'None' : outlineColor}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {OUTLINE_COLORS.map((item) => {
                        const active =
                          outlineColor.toUpperCase() === item.value.toUpperCase();
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => handleSelectOutlineColor(item.value)}
                            aria-pressed={active}
                            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                              active
                                ? 'bg-[#F5EFE4] border-[#854D0E] text-[#1E1B18]'
                                : 'bg-white border-[#E2DCD2] text-[#5C554D] hover:text-[#1E1B18]'
                            }`}
                          >
                            {item.swatch && (
                              <span
                                aria-hidden="true"
                                className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                                style={{ backgroundColor: item.swatch }}
                              />
                            )}
                            <span>{item.label}</span>
                          </button>
                        );
                      })}

                      <label
                        className={`relative flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap overflow-hidden ${
                          outlineColor !== 'none' &&
                          !OUTLINE_COLORS.some(
                            (c) => c.value.toUpperCase() === outlineColor.toUpperCase()
                          )
                            ? 'bg-[#F5EFE4] border-[#854D0E] text-[#1E1B18]'
                            : 'bg-white border-[#E2DCD2] text-[#5C554D] hover:text-[#1E1B18]'
                        }`}
                      >
                        <Palette className="w-3.5 h-3.5 text-[#854D0E] shrink-0" />
                        <span>Custom</span>
                        {outlineColor !== 'none' && (
                          <span
                            aria-hidden="true"
                            className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: outlineColor }}
                          />
                        )}
                        <input
                          type="color"
                          value={outlineColor === 'none' ? '#000000' : outlineColor}
                          onChange={(e) => handleSelectOutlineColor(e.target.value)}
                          aria-label="Pick custom outline color"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <label htmlFor="outline-width-slider" className="font-medium text-[#5C554D]">
                          Outline Thickness
                        </label>
                        <span className="tabular-nums font-semibold text-[#1E1B18]">
                          {outlineWidth} px
                        </span>
                      </div>
                      <input
                        id="outline-width-slider"
                        type="range"
                        min={0}
                        max={8}
                        step={0.5}
                        value={outlineWidth}
                        onChange={(e) => handleOutlineWidthChange(Number(e.target.value))}
                        className="studio-slider w-full cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="block text-xs font-medium text-[#5C554D] mb-2">
                        Text Shadow
                      </span>
                      <div className="grid grid-cols-3 p-1 bg-[#EFEAE2] rounded-xl">
                        {(
                          [
                            { id: 'none', label: 'Off' },
                            { id: 'soft', label: 'Soft' },
                            { id: 'strong', label: 'Strong' },
                          ] as const
                        ).map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setTextShadow(s.id)}
                            aria-pressed={textShadow === s.id}
                            className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                              textShadow === s.id
                                ? 'bg-white text-[#1E1B18] shadow-xs'
                                : 'text-[#5C554D] hover:text-[#1E1B18]'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Church Branding & Footer Section (Logo + Telugu Address OR Full-Width Custom Banner) */}
                <div className="pt-4 border-t border-[#ECE7DF] flex flex-col gap-3.5">
                  <div>
                    <span className="block text-xs font-semibold text-[#1E1B18]">
                      Church Branding &amp; Bottom Footer
                    </span>
                    <span className="block text-xs text-[#6B6359] mt-0.5">
                      Use the Telugu address footer with your logo, or upload a full-width custom footer banner.
                    </span>
                  </div>

                  {/* Full-Width Custom Footer Banner Image Upload */}
                  <div>
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/*"
                      onChange={handleUploadFooterBanner}
                      className="hidden"
                    />

                    {footerBannerUrl ? (
                      <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#F5EFE4] border border-[#854D0E]">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={footerBannerUrl}
                            alt="Uploaded full-width footer banner"
                            className="w-16 h-10 rounded-lg object-cover bg-[#1C1917] shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-[#1E1B18] truncate">
                              {footerBannerName || 'Custom Footer Banner'}
                            </div>
                            <div className="text-xs text-[#6B6359]">
                              Full-width bottom church footer active
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => bannerInputRef.current?.click()}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E2DCD2] text-xs font-medium text-[#1E1B18] hover:bg-[#FAF8F5] cursor-pointer"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={handleClearFooterBanner}
                            aria-label="Remove full-width footer banner"
                            className="p-1.5 rounded-lg bg-white border border-[#E2DCD2] text-[#5C554D] hover:text-[#1E1B18] cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-[#FAF7F2] border border-dashed border-[#C9BFAF] text-sm font-medium text-[#1E1B18] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#854D0E]"
                      >
                        <Upload className="w-4 h-4 text-[#854D0E]" />
                        <span>Upload Full-Width Footer Banner Image</span>
                      </button>
                    )}

                    {bannerUploadError && (
                      <p className="mt-1.5 text-xs text-[#991B1B]">{bannerUploadError}</p>
                    )}
                  </div>

                  {/* Church Logo Upload (used with built-in Telugu Address Footer when no full-width banner is active) */}
                  <div className={footerBannerUrl ? 'opacity-55' : ''}>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/*"
                      onChange={handleUploadChurchLogo}
                      className="hidden"
                    />

                    {churchLogoUrl ? (
                      <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#F5EFE4] border border-[#854D0E]">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={churchLogoUrl}
                            alt="Uploaded church logo"
                            className="w-10 h-10 rounded-lg object-contain bg-[#1C1917] p-1 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-[#1E1B18] truncate">
                              {churchLogoName || 'Church Logo'}
                            </div>
                            <div className="text-xs text-[#6B6359]">
                              {footerBannerUrl
                                ? 'Paused while custom banner is active'
                                : 'Shown beside Telugu address footer'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E2DCD2] text-xs font-medium text-[#1E1B18] hover:bg-[#FAF8F5] cursor-pointer"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={handleClearChurchLogo}
                            aria-label="Remove church logo"
                            className="p-1.5 rounded-lg bg-white border border-[#E2DCD2] text-[#5C554D] hover:text-[#1E1B18] cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-[#FAF7F2] border border-dashed border-[#C9BFAF] text-sm font-medium text-[#1E1B18] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#854D0E]"
                      >
                        <Upload className="w-4 h-4 text-[#854D0E]" />
                        <span>Upload Church Logo (With Address Text)</span>
                      </button>
                    )}

                    {logoUploadError && (
                      <p className="mt-1.5 text-xs text-[#991B1B]">{logoUploadError}</p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Dominant Focal Canvas Stage */}
          <div className="lg:col-span-7 lg:sticky lg:top-24">
            <VerseCanvasPreview
              canvasRef={canvasRef}
              renderOptions={renderOptions}
              aiImageUrl={aiImageUrl}
              fallbackImageUrl={selectedTheme.fallbackImage}
              customImageUrl={customUploadUrl}
              customImageName={customUploadName}
              churchLogoUrl={churchLogoUrl}
              footerBannerUrl={footerBannerUrl}
              themeLabel={
                activePromptOverride
                  ? 'Custom AI Scene'
                  : selectedTheme.name
              }
              onRegenerateAi={handleRegenerateAi}
              onClearCustomImage={handleClearCustomUpload}
              onDownload={handleDownloadImage}
              downloadBusy={downloadBusy}
            />

            {downloadNotice && (
              <p
                role="status"
                aria-live="polite"
                className="mt-3 text-xs font-medium text-[#854D0E] text-center sm:text-left"
              >
                {downloadNotice}
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#E6E0D6] mt-12">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B6359]">
          <span>Philadelphia Prardhana Mandiram · Telugu Christian Scripture Artwork</span>
          <span>Complete 66-Book Telugu Bible · HTML5 Canvas &amp; Pollinations.ai</span>
        </div>
      </footer>
    </div>
  );
}
