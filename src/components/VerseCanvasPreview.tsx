import React, { useEffect, useState } from 'react';
import { Check, Copy, Download, Loader2, RefreshCw } from 'lucide-react';
import {
  ASPECT_RATIO_CONFIG,
  CanvasRenderOptions,
  ensureCanvasFontsLoaded,
  renderVerseToCanvas,
} from '../utils/canvasRenderer';

interface VerseCanvasPreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  renderOptions: CanvasRenderOptions;
  aiImageUrl: string;
  fallbackImageUrl: string;
  customImageUrl: string | null;
  customImageName: string | null;
  churchLogoUrl: string | null;
  footerBannerUrl: string | null;
  themeLabel: string;
  onRegenerateAi: () => void;
  onClearCustomImage: () => void;
  onDownload: () => void;
  downloadBusy: boolean;
}

type BackdropStatus = 'loading-ai' | 'ai-ready' | 'fallback-active' | 'custom-upload';

export const VerseCanvasPreview: React.FC<VerseCanvasPreviewProps> = ({
  canvasRef,
  renderOptions,
  aiImageUrl,
  fallbackImageUrl,
  customImageUrl,
  customImageName,
  churchLogoUrl,
  footerBannerUrl,
  themeLabel,
  onRegenerateAi,
  onClearCustomImage,
  onDownload,
  downloadBusy,
}) => {
  const [activeImage, setActiveImage] = useState<HTMLImageElement | null>(null);
  const [churchLogoImage, setChurchLogoImage] = useState<HTMLImageElement | null>(null);
  const [footerBannerImage, setFooterBannerImage] = useState<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<BackdropStatus>('loading-ai');
  const [copied, setCopied] = useState(false);

  const dims = ASPECT_RATIO_CONFIG[renderOptions.aspectRatio];

  // Load either user's uploaded photo OR Pollinations.ai image with instant studio/gradient fallback
  useEffect(() => {
    let cancelled = false;

    if (customImageUrl) {
      const customImg = new Image();
      customImg.onload = () => {
        if (!cancelled && customImg.naturalWidth > 0) {
          setActiveImage(customImg);
          setStatus('custom-upload');
        }
      };
      customImg.onerror = () => {
        if (!cancelled) {
          setActiveImage(null);
          setStatus('fallback-active');
        }
      };
      customImg.src = customImageUrl;

      return () => {
        cancelled = true;
      };
    }

    let aiResolved = false;

    const fb = new Image();
    fb.crossOrigin = 'anonymous';
    fb.onload = () => {
      if (!cancelled && !aiResolved) {
        setActiveImage(fb);
      }
    };
    fb.onerror = () => {
      if (!cancelled && !aiResolved) {
        setActiveImage(null);
      }
    };
    fb.src = fallbackImageUrl;

    setStatus('loading-ai');

    const aiImg = new Image();
    aiImg.crossOrigin = 'anonymous';

    const timeoutId = window.setTimeout(() => {
      if (!cancelled && !aiResolved) {
        setStatus('fallback-active');
      }
    }, 12000);

    aiImg.onload = () => {
      window.clearTimeout(timeoutId);
      if (!cancelled && aiImg.naturalWidth > 0) {
        aiResolved = true;
        setActiveImage(aiImg);
        setStatus('ai-ready');
      }
    };

    aiImg.onerror = () => {
      window.clearTimeout(timeoutId);
      if (!cancelled && !aiResolved) {
        setStatus('fallback-active');
      }
    };

    aiImg.src = aiImageUrl;

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [aiImageUrl, fallbackImageUrl, customImageUrl]);

  // Load optional Church Logo image from user upload
  useEffect(() => {
    if (!churchLogoUrl) {
      setChurchLogoImage(null);
      return;
    }

    let cancelled = false;
    const logoImg = new Image();
    logoImg.onload = () => {
      if (!cancelled && logoImg.naturalWidth > 0) {
        setChurchLogoImage(logoImg);
      }
    };
    logoImg.onerror = () => {
      if (!cancelled) {
        setChurchLogoImage(null);
      }
    };
    logoImg.src = churchLogoUrl;

    return () => {
      cancelled = true;
    };
  }, [churchLogoUrl]);

  // Load optional Full-Width Custom Footer Banner image from user upload
  useEffect(() => {
    if (!footerBannerUrl) {
      setFooterBannerImage(null);
      return;
    }

    let cancelled = false;
    const bannerImg = new Image();
    bannerImg.onload = () => {
      if (!cancelled && bannerImg.naturalWidth > 0) {
        setFooterBannerImage(bannerImg);
      }
    };
    bannerImg.onerror = () => {
      if (!cancelled) {
        setFooterBannerImage(null);
      }
    };
    bannerImg.src = footerBannerUrl;

    return () => {
      cancelled = true;
    };
  }, [footerBannerUrl]);

  // Re-render canvas whenever image, logo, banner, aspect ratio, verse, or typography options change
  useEffect(() => {
    let cancelled = false;

    const draw = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      await ensureCanvasFontsLoaded(renderOptions.fontFamily, renderOptions.fontSize);
      if (!cancelled) {
        renderVerseToCanvas(
          canvas,
          activeImage,
          renderOptions,
          churchLogoImage,
          footerBannerImage
        );
      }
    };

    draw();

    return () => {
      cancelled = true;
    };
  }, [canvasRef, activeImage, churchLogoImage, footerBannerImage, renderOptions]);

  const handleCopyVerse = async () => {
    const content = renderOptions.referenceText
      ? `${renderOptions.verseText.trim()}\n— ${renderOptions.referenceText.trim()}`
      : renderOptions.verseText.trim();
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failures in restricted frames
    }
  };

  const frameClass =
    renderOptions.aspectRatio === 'landscape'
      ? 'w-full aspect-video'
      : renderOptions.aspectRatio === 'portrait'
        ? 'h-[600px] sm:h-[660px] max-w-full aspect-[9/16] mx-auto'
        : 'w-full aspect-square';

  return (
    <div className="flex flex-col gap-5">
      {/* Studio Artwork Frame */}
      <div className="relative bg-white p-3 sm:p-4 rounded-2xl border border-[#E6E0D6] shadow-sm">
        <div
          className={`relative overflow-hidden rounded-xl bg-[#1C1917] flex items-center justify-center ${frameClass}`}
        >
          <canvas
            ref={canvasRef}
            width={dims.width}
            height={dims.height}
            aria-label="Telugu Bible Verse Canvas Preview"
            className="w-full h-full block object-contain"
          />

          {/* Centered Spinner while Pollinations AI image is loading */}
          {status === 'loading-ai' && (
            <div
              role="status"
              aria-live="polite"
              className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[1px]"
            >
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#1C1917]/88 text-white text-xs font-medium shadow-md border border-white/15">
                <Loader2 className="w-4 h-4 animate-spin text-[#F3D078]" />
                <span>Generating AI background…</span>
              </div>
            </div>
          )}
        </div>

        {/* Clean Unboxed Canvas Metadata & Regenerate Action */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 px-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B6359]">
            <span className="font-medium text-[#1E1B18]">
              {status === 'custom-upload'
                ? customImageName || 'Custom Photo'
                : themeLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {dims.width} × {dims.height} px
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {status === 'custom-upload'
                ? 'Uploaded Photo'
                : status === 'ai-ready'
                  ? 'Pollinations AI'
                  : status === 'loading-ai'
                    ? 'Loading AI Scene…'
                    : 'Studio Gradient Fallback'}
            </span>
          </div>

          {status === 'custom-upload' ? (
            <button
              type="button"
              onClick={onClearCustomImage}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#854D0E] hover:text-[#6B3D0A] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#854D0E]"
            >
              <span>Use AI Theme</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onRegenerateAi}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#EFEAE2] border border-[#E2DCD2] text-xs font-semibold text-[#854D0E] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#854D0E]"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${status === 'loading-ai' ? 'animate-spin' : ''}`}
              />
              <span>Regenerate</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Action Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          type="button"
          onClick={onDownload}
          disabled={downloadBusy}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#854D0E] hover:bg-[#713F12] active:scale-[0.99] text-white text-sm font-semibold transition-all duration-150 cursor-pointer disabled:opacity-60 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#854D0E]"
        >
          <Download className="w-4 h-4" />
          <span>{downloadBusy ? 'Preparing PNG…' : 'Download Image'}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyVerse}
          className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-[#F5F1EB] border border-[#E2DCD2] text-[#1E1B18] text-sm font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#854D0E]"
        >
          {copied ? (
            <Check className="w-4 h-4 text-[#854D0E]" />
          ) : (
            <Copy className="w-4 h-4 text-[#6B6359]" />
          )}
          <span>{copied ? 'Verse Copied' : 'Copy Verse'}</span>
        </button>
      </div>
    </div>
  );
};
