import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  BookMarked,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
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
  CanvasRenderOptions,
  TeluguFontFamily,
  TextAlignOption,
  VerseTextColor,
} from './utils/canvasRenderer';
import { VerseCanvasPreview } from './components/VerseCanvasPreview';

type VerseMode = 'bible' | 'curated' | 'custom';

const TEXT_COLORS: Array<{ label: string; hex: VerseTextColor; swatchBg: string }> = [
  { label: 'White', hex: '#FFFFFF', swatchBg: '#FFFFFF' },
  { label: 'Gold', hex: '#F3D078', swatchBg: '#F3D078' },
  { label: 'Cream', hex: '#FAF0D7', swatchBg: '#FAF0D7' },
];

const INITIAL_JOHN_3_16 =
  'దేవుడు లోకమును ఎంతో ప్రేమించెను. కాగా ఆయన తన అద్వితీయకుమారునిగా పుట్టిన వానియందు విశ్వాసముంచు ప్రతివాడును నశింపక నిత్యజీవము పొందునట్లు ఆయనను అనుగ్రహించెను.';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  // Background & Pollinations.ai / Custom Upload state
  const [selectedThemeId, setSelectedThemeId] = useState<string>(BACKGROUND_THEMES[0].id);
  const [customScenePrompt, setCustomScenePrompt] = useState<string>('');
  const [activePromptOverride, setActivePromptOverride] = useState<string>('');
  const [aiSeed, setAiSeed] = useState<number>(1047);
  const [customUploadUrl, setCustomUploadUrl] = useState<string | null>(null);
  const [customUploadName, setCustomUploadName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Typography & canvas customization state
  const [fontFamily, setFontFamily] = useState<TeluguFontFamily>('Noto Sans Telugu');
  const [fontWeight, setFontWeight] = useState<'400' | '600' | '700'>('600');
  const [fontSize, setFontSize] = useState<number>(46);
  const [textColor, setTextColor] = useState<VerseTextColor>('#FFFFFF');
  const [textAlign, setTextAlign] = useState<TextAlignOption>('center');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.5);

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

  const activePrompt = activePromptOverride.trim() || selectedTheme.englishVisualPrompt;
  const aiImageUrl = useMemo(
    () => buildPollinationsUrl(activePrompt, aiSeed),
    [activePrompt, aiSeed]
  );

  const renderOptions: CanvasRenderOptions = useMemo(
    () => ({
      verseText: activeVerseText,
      referenceText: activeReferenceText,
      fontFamily,
      fontSize,
      fontWeight,
      textColor,
      textAlign,
      overlayOpacity,
      fallbackGradient: selectedTheme.fallbackGradient,
    }),
    [
      activeVerseText,
      activeReferenceText,
      fontFamily,
      fontSize,
      fontWeight,
      textColor,
      textAlign,
      overlayOpacity,
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
    const fileName = `vakyam-${slug}.png`;

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
      setDownloadNotice(`Saved ${fileName} (1080 × 1080 PNG)`);
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

            {/* 2. Background Theme & Custom Image Upload Section */}
            <section ref={themeSectionRef} aria-labelledby="backgrounds-heading" className="scroll-mt-24">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2
                  id="backgrounds-heading"
                  className="font-display text-2xl font-semibold text-[#1E1B18]"
                >
                  2. Background Theme
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
                {/* Font Family Selector */}
                <div>
                  <span className="block text-xs font-medium text-[#5C554D] mb-2">
                    Telugu Font Style
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFontFamily('Noto Sans Telugu')}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                        fontFamily === 'Noto Sans Telugu'
                          ? 'bg-[#F5EFE4] border-[#854D0E]'
                          : 'bg-white border-[#E2DCD2] hover:border-[#C9BFAF]'
                      }`}
                    >
                      <div className="font-telugu-noto text-base font-semibold text-[#1E1B18]">
                        నోటో సాన్స్ తెలుగు
                      </div>
                      <div className="mt-0.5 text-xs text-[#6B6359]">
                        Noto Sans Telugu · Crisp
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFontFamily('Mandali')}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                        fontFamily === 'Mandali'
                          ? 'bg-[#F5EFE4] border-[#854D0E]'
                          : 'bg-white border-[#E2DCD2] hover:border-[#C9BFAF]'
                      }`}
                    >
                      <div className="font-telugu-mandali text-base text-[#1E1B18]">
                        మండలి తెలుగు
                      </div>
                      <div className="mt-0.5 text-xs text-[#6B6359]">
                        Mandali · Classic
                      </div>
                    </button>
                  </div>
                </div>

                {/* Font Weight & Alignment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-medium text-[#5C554D] mb-2">
                      Text Alignment
                    </span>
                    <div className="grid grid-cols-3 p-1 bg-[#EFEAE2] rounded-xl">
                      {(
                        [
                          { id: 'left', label: 'Left', Icon: AlignLeft },
                          { id: 'center', label: 'Center', Icon: AlignCenter },
                          { id: 'right', label: 'Right', Icon: AlignRight },
                        ] as const
                      ).map(({ id, label, Icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setTextAlign(id)}
                          aria-pressed={textAlign === id}
                          className={`inline-flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                            textAlign === id
                              ? 'bg-white text-[#1E1B18] shadow-xs'
                              : 'text-[#5C554D] hover:text-[#1E1B18]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-[#5C554D] mb-2">
                      Font Weight {fontFamily === 'Mandali' ? '(Regular)' : ''}
                    </span>
                    <div className="grid grid-cols-3 p-1 bg-[#EFEAE2] rounded-xl">
                      {(
                        [
                          { id: '400', label: 'Regular' },
                          { id: '600', label: 'Medium' },
                          { id: '700', label: 'Bold' },
                        ] as const
                      ).map((w) => {
                        const disabled = fontFamily === 'Mandali' && w.id !== '400';
                        const active =
                          (fontFamily === 'Mandali' ? '400' : fontWeight) === w.id;
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

                {/* Text Color Picker */}
                <div>
                  <span className="block text-xs font-medium text-[#5C554D] mb-2">
                    Verse Text Color
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {TEXT_COLORS.map((color) => {
                      const active = textColor === color.hex;
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
                            className="w-4 h-4 rounded-full border border-black/15 shrink-0"
                            style={{ backgroundColor: color.swatchBg }}
                          />
                          <span>{color.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Font Size Slider & Overlay Darkness Slider */}
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
                      max={64}
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
                      min={25}
                      max={75}
                      step={5}
                      value={Math.round(overlayOpacity * 100)}
                      onChange={(e) => setOverlayOpacity(Number(e.target.value) / 100)}
                      className="studio-slider w-full cursor-pointer"
                    />
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
          <span>Vakyam Studio · Telugu Christian Scripture Artwork</span>
          <span>Complete 66-Book Telugu Bible · HTML5 Canvas &amp; Pollinations.ai</span>
        </div>
      </footer>
    </div>
  );
}
