export type CanvasAspectRatio = 'square' | 'landscape' | 'portrait';

export type TeluguFontFamily =
  | 'Noto Sans Telugu'
  | 'Mandali'
  | 'NTR'
  | 'Ramabhadra'
  | 'Suranna'
  | 'Sree Krushnadevaraya'
  | 'Timmana'
  | 'Mallanna'
  | 'Gurajada'
  | 'Tenali Ramakrishna'
  | 'Gidugu'
  | 'Peddana'
  | 'Suravaram'
  | 'Sirivennela'
  | 'Ponnala';

export type TextAlignOption = 'left' | 'center' | 'right';
export type TextShadowOption = 'none' | 'soft' | 'strong';

export const ASPECT_RATIO_CONFIG: Record<
  CanvasAspectRatio,
  { width: number; height: number; label: string; shortLabel: string; hint: string }
> = {
  square: {
    width: 1080,
    height: 1080,
    label: 'Square (1:1)',
    shortLabel: '1:1',
    hint: '1080 × 1080 · Instagram & Facebook',
  },
  landscape: {
    width: 1920,
    height: 1080,
    label: 'Landscape (16:9)',
    shortLabel: '16:9',
    hint: '1920 × 1080 · YouTube, TV & Slides',
  },
  portrait: {
    width: 1080,
    height: 1920,
    label: 'Portrait (9:16)',
    shortLabel: '9:16',
    hint: '1080 × 1920 · WhatsApp Status & Reels',
  },
};

export interface CanvasRenderOptions {
  aspectRatio: CanvasAspectRatio;
  verseText: string;
  referenceText: string;
  fontFamily: TeluguFontFamily;
  fontSize: number;
  fontWeight: '400' | '600' | '700';
  textColor: string;
  textAlign: TextAlignOption;
  overlayOpacity: number; // 0 to 0.90
  outlineColor: string; // 'none' or hex color
  outlineWidth: number; // 0 to 8
  textShadow: TextShadowOption;
  fallbackGradient?: [string, string, string];
}

const CHURCH_TITLE_TE = 'ఫిలదెల్ఫియ ప్రార్ధన మందిరం';
const CHURCH_ADDRESS_TE =
  'బెహార్లా వీధి, మహాలక్ష్మినగర్, జగన్నాధపురం, కాకినాడ - 533002';

/**
 * Wraps Telugu text cleanly at whitespace/word boundaries so Telugu words and
 * vowel signs (గుణింతాలు / ఒత్తులు) are never sliced in half.
 */
function wrapTeluguLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): { lines: string[]; maxTokenOverflow: boolean } {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) {
    return { lines: [], maxTokenOverflow: false };
  }

  const paragraphs = normalized.split('\n');
  const lines: string[] = [];
  let maxTokenOverflow = false;

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) {
      lines.push('');
      continue;
    }

    const words = trimmedParagraph.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      if (ctx.measureText(word).width > maxWidth) {
        maxTokenOverflow = true;
      }

      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        currentLine = candidate;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return { lines, maxTokenOverflow };
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const targetRatio = targetWidth / targetHeight;

  let drawWidth = targetWidth;
  let drawHeight = targetHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (imgRatio > targetRatio) {
    drawHeight = targetHeight;
    drawWidth = targetHeight * imgRatio;
    offsetX = (targetWidth - drawWidth) / 2;
  } else {
    drawWidth = targetWidth;
    drawHeight = targetWidth / imgRatio;
    offsetY = (targetHeight - drawHeight) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

export async function ensureCanvasFontsLoaded(
  fontFamily: TeluguFontFamily,
  fontSize: number
): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  try {
    const teluguSample = 'అఆఇఈకఖగఘదేవుడు వాక్యము';
    const loads: Promise<FontFace[]>[] = [
      document.fonts.load(`400 ${fontSize}px "${fontFamily}"`, teluguSample),
      document.fonts.load(`700 28px "Noto Sans Telugu"`, teluguSample),
      document.fonts.load(`400 21px "Noto Sans Telugu"`, teluguSample),
      document.fonts.load(`600 28px "Plus Jakarta Sans"`),
    ];

    if (fontFamily === 'Noto Sans Telugu') {
      loads.push(
        document.fonts.load(`600 ${fontSize}px "Noto Sans Telugu"`, teluguSample),
        document.fonts.load(`700 ${fontSize}px "Noto Sans Telugu"`, teluguSample)
      );
    }

    await Promise.all(loads);
    await document.fonts.ready;
  } catch {
    // Continue safely if font loading API throws in restricted contexts
  }
}

function applyTextShadow(
  ctx: CanvasRenderingContext2D,
  shadowOption: TextShadowOption
) {
  if (shadowOption === 'none') {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  } else if (shadowOption === 'strong') {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.88)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
  } else {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.56)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;
  }
}

export function renderVerseToCanvas(
  canvas: HTMLCanvasElement,
  backgroundImage: HTMLImageElement | null,
  options: CanvasRenderOptions,
  churchLogoImage?: HTMLImageElement | null,
  footerBannerImage?: HTMLImageElement | null
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { width: canvasWidth, height: canvasHeight } =
    ASPECT_RATIO_CONFIG[options.aspectRatio];

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // 1. Draw background image (cover fit) or serene multi-stop theme gradient fallback
  if (backgroundImage && backgroundImage.complete && backgroundImage.naturalWidth > 0) {
    drawImageCover(ctx, backgroundImage, canvasWidth, canvasHeight);
  } else {
    const [cTop, cMid, cBottom] = options.fallbackGradient ?? [
      '#2B1D14',
      '#5B3A24',
      '#1A1412',
    ];
    const bgGrad = ctx.createLinearGradient(0, 0, canvasWidth * 0.6, canvasHeight);
    bgGrad.addColorStop(0, cTop);
    bgGrad.addColorStop(0.55, cMid);
    bgGrad.addColorStop(1, cBottom);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const horizonGlow = ctx.createRadialGradient(
      canvasWidth * 0.5,
      canvasHeight * 0.38,
      40,
      canvasWidth * 0.5,
      canvasHeight * 0.38,
      Math.max(canvasWidth, canvasHeight) * 0.58
    );
    horizonGlow.addColorStop(0, 'rgba(255, 224, 178, 0.22)');
    horizonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // 2. Apply Backdrop Scrim (supports 0% to 90%)
  const baseOpacity = Math.min(Math.max(options.overlayOpacity, 0), 0.9);
  if (baseOpacity > 0.001) {
    const scrimGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    scrimGradient.addColorStop(0, `rgba(10, 9, 12, ${Math.max(0, baseOpacity - 0.12)})`);
    scrimGradient.addColorStop(0.5, `rgba(10, 9, 12, ${baseOpacity})`);
    scrimGradient.addColorStop(1, `rgba(10, 9, 12, ${Math.min(0.94, baseOpacity + 0.1)})`);
    ctx.fillStyle = scrimGradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const radial = ctx.createRadialGradient(
      canvasWidth / 2,
      canvasHeight / 2,
      Math.min(canvasWidth, canvasHeight) * 0.16,
      canvasWidth / 2,
      canvasHeight / 2,
      Math.max(canvasWidth, canvasHeight) * 0.72
    );
    radial.addColorStop(0, `rgba(0, 0, 0, ${baseOpacity * 0.12})`);
    radial.addColorStop(1, `rgba(0, 0, 0, ${Math.min(0.45, baseOpacity * 0.55)})`);
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // Determine active bottom footer height (Full-width custom banner OR standard Church footer bar)
  const hasCustomBanner = Boolean(
    footerBannerImage &&
      footerBannerImage.complete &&
      footerBannerImage.naturalWidth > 0 &&
      footerBannerImage.naturalHeight > 0
  );

  let footerHeight = options.aspectRatio === 'portrait' ? 136 : 116;
  if (hasCustomBanner && footerBannerImage) {
    const aspectScaledH = Math.round(
      canvasWidth * (footerBannerImage.naturalHeight / footerBannerImage.naturalWidth)
    );
    footerHeight = Math.max(40, aspectScaledH);
  }

  const verseStageTop = options.aspectRatio === 'portrait' ? 110 : 64;
  const reservedBottom = Math.min(footerHeight, Math.round(canvasHeight * 0.42));
  const verseStageBottom = canvasHeight - reservedBottom - 40;
  const maxVerticalContentHeight = Math.max(240, verseStageBottom - verseStageTop);

  // Subtle inset editorial frame border (stops cleanly above footer)
  if (!hasCustomBanner) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(42, 42, canvasWidth - 84, canvasHeight - footerHeight - 64);
    ctx.restore();
  }

  // 3. Auto-fit Telugu font size within orientation-aware bounds
  const horizontalMargin = options.aspectRatio === 'landscape' ? 180 : 100;
  const maxTextWidth = canvasWidth - horizontalMargin * 2;
  const resolvedWeight = options.fontFamily === 'Noto Sans Telugu' ? options.fontWeight : '400';

  // Scale slightly higher base allowance on Landscape 1920w if desired, respecting user fontSize
  let effectiveFontSize = options.fontSize;
  let wrappedLines: string[] = [];
  let lineHeight = Math.round(effectiveFontSize * 1.58);
  let refFontSize = Math.max(24, Math.round(effectiveFontSize * 0.6));
  const refGap = 44;

  const verseInput = options.verseText.trim() || 'దేవుని వాక్యము';

  while (effectiveFontSize >= 24) {
    ctx.font = `${resolvedWeight} ${effectiveFontSize}px "${options.fontFamily}", "Noto Sans Telugu", sans-serif`;
    const result = wrapTeluguLines(ctx, verseInput, maxTextWidth);
    wrappedLines = result.lines;
    lineHeight = Math.round(effectiveFontSize * 1.58);
    refFontSize = Math.max(22, Math.round(effectiveFontSize * 0.6));
    const totalHeight =
      wrappedLines.length * lineHeight +
      (options.referenceText.trim() ? refGap + refFontSize : 0);

    if (!result.maxTokenOverflow && totalHeight <= maxVerticalContentHeight) {
      break;
    }
    effectiveFontSize -= 2;
  }

  ctx.font = `${resolvedWeight} ${effectiveFontSize}px "${options.fontFamily}", "Noto Sans Telugu", sans-serif`;
  if (wrappedLines.length === 0) {
    wrappedLines = wrapTeluguLines(ctx, verseInput, maxTextWidth).lines;
  }

  const hasReference = Boolean(options.referenceText.trim());
  const blockTextHeight = wrappedLines.length * lineHeight;
  const totalBlockHeight = blockTextHeight + (hasReference ? refGap + refFontSize + 18 : 0);

  let anchorX = canvasWidth / 2;
  if (options.textAlign === 'left') {
    anchorX = horizontalMargin;
  } else if (options.textAlign === 'right') {
    anchorX = canvasWidth - horizontalMargin;
  }

  const startY =
    verseStageTop +
    (verseStageBottom - verseStageTop - totalBlockHeight) / 2 +
    effectiveFontSize * 0.85;

  // 4. Render Telugu Verse Lines with optional Outline (Stroke) & Shadow
  const hasOutline = options.outlineColor !== 'none' && options.outlineWidth > 0;

  ctx.save();
  ctx.textAlign = options.textAlign;
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;

  wrappedLines.forEach((line, index) => {
    if (!line) return;
    const y = startY + index * lineHeight;

    if (hasOutline) {
      applyTextShadow(ctx, options.textShadow);
      ctx.strokeStyle = options.outlineColor;
      ctx.lineWidth = options.outlineWidth * 2;
      ctx.strokeText(line, anchorX, y);

      // Draw fill cleanly over inner stroke half without duplicating heavy shadow
      applyTextShadow(ctx, 'none');
      ctx.fillStyle = options.textColor;
      ctx.fillText(line, anchorX, y);
    } else {
      applyTextShadow(ctx, options.textShadow);
      ctx.fillStyle = options.textColor;
      ctx.fillText(line, anchorX, y);
    }
  });

  // 5. Render hairline rule & Bible reference
  if (hasReference) {
    const ruleY = startY + (wrappedLines.length - 1) * lineHeight + 34;
    const ruleWidth = 64;
    let ruleX = canvasWidth / 2 - ruleWidth / 2;
    if (options.textAlign === 'left') {
      ruleX = horizontalMargin;
    } else if (options.textAlign === 'right') {
      ruleX = canvasWidth - horizontalMargin - ruleWidth;
    }

    ctx.save();
    applyTextShadow(ctx, 'none');
    ctx.strokeStyle =
      options.textColor === '#F3D078'
        ? 'rgba(243, 208, 120, 0.68)'
        : 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ruleX, ruleY);
    ctx.lineTo(ruleX + ruleWidth, ruleY);
    ctx.stroke();
    ctx.restore();

    const refY = ruleY + 38 + refFontSize * 0.25;
    const refText = `— ${options.referenceText.trim()}`;
    ctx.font = `600 ${refFontSize}px "${options.fontFamily}", "Noto Sans Telugu", sans-serif`;

    if (hasOutline) {
      applyTextShadow(ctx, options.textShadow);
      ctx.strokeStyle = options.outlineColor;
      ctx.lineWidth = Math.max(1.5, options.outlineWidth * 1.4);
      ctx.strokeText(refText, anchorX, refY);

      applyTextShadow(ctx, 'none');
      ctx.fillStyle = options.textColor === '#FFFFFF' ? '#F5EFE6' : options.textColor;
      ctx.fillText(refText, anchorX, refY);
    } else {
      applyTextShadow(ctx, options.textShadow);
      ctx.fillStyle = options.textColor === '#FFFFFF' ? '#F5EFE6' : options.textColor;
      ctx.fillText(refText, anchorX, refY);
    }
  }

  ctx.restore();

  // 6. Render Bottom Footer: Full-Width Custom Banner Image OR Default Church Logo + Telugu Address Bar
  if (hasCustomBanner && footerBannerImage) {
    const bannerY = canvasHeight - footerHeight;
    ctx.save();
    ctx.drawImage(footerBannerImage, 0, bannerY, canvasWidth, footerHeight);
    ctx.restore();
    return;
  }

  const footerY = canvasHeight - footerHeight;
  ctx.save();
  ctx.fillStyle = 'rgba(10, 9, 12, 0.74)';
  ctx.fillRect(0, footerY, canvasWidth, footerHeight);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, footerY + 0.5);
  ctx.lineTo(canvasWidth, footerY + 0.5);
  ctx.stroke();

  const hasLogo = Boolean(
    churchLogoImage && churchLogoImage.complete && churchLogoImage.naturalWidth > 0
  );

  const logoMaxBox = options.aspectRatio === 'portrait' ? 80 : 72;
  const logoGap = 22;
  let logoDrawW = 0;
  let logoDrawH = 0;

  if (hasLogo && churchLogoImage) {
    const logoRatio = churchLogoImage.naturalWidth / churchLogoImage.naturalHeight;
    if (logoRatio >= 1) {
      logoDrawW = logoMaxBox;
      logoDrawH = logoMaxBox / logoRatio;
    } else {
      logoDrawH = logoMaxBox;
      logoDrawW = logoMaxBox * logoRatio;
    }
  }

  let titleSize = options.aspectRatio === 'landscape' ? 30 : 27;
  let addrSize = options.aspectRatio === 'landscape' ? 22 : 20;
  const maxFooterTextWidth =
    canvasWidth - 72 - (hasLogo ? logoDrawW + logoGap : 0);

  let titleWidth = 0;
  let addrWidth = 0;

  while (addrSize >= 13) {
    ctx.font = `700 ${titleSize}px "Noto Sans Telugu", sans-serif`;
    titleWidth = ctx.measureText(CHURCH_TITLE_TE).width;
    ctx.font = `400 ${addrSize}px "Noto Sans Telugu", sans-serif`;
    addrWidth = ctx.measureText(CHURCH_ADDRESS_TE).width;
    if (Math.max(titleWidth, addrWidth) <= maxFooterTextWidth) {
      break;
    }
    titleSize -= 1;
    addrSize -= 1;
  }

  const textBlockWidth = Math.max(titleWidth, addrWidth);
  const footerCenterY = footerY + footerHeight / 2;
  const line1Y = footerCenterY - 8;
  const line2Y = footerCenterY + 24;

  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;
  ctx.textBaseline = 'alphabetic';

  if (hasLogo && churchLogoImage) {
    const totalGroupWidth = logoDrawW + logoGap + textBlockWidth;
    const groupStartX = (canvasWidth - totalGroupWidth) / 2;
    const logoX = groupStartX;
    const logoY = footerCenterY - logoDrawH / 2;

    ctx.drawImage(churchLogoImage, logoX, logoY, logoDrawW, logoDrawH);

    const textX = groupStartX + logoDrawW + logoGap;
    ctx.textAlign = 'left';

    ctx.font = `700 ${titleSize}px "Noto Sans Telugu", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(CHURCH_TITLE_TE, textX, line1Y);

    ctx.font = `400 ${addrSize}px "Noto Sans Telugu", sans-serif`;
    ctx.fillStyle = '#FAF0D7';
    ctx.fillText(CHURCH_ADDRESS_TE, textX, line2Y);
  } else {
    ctx.textAlign = 'center';

    ctx.font = `700 ${titleSize}px "Noto Sans Telugu", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(CHURCH_TITLE_TE, canvasWidth / 2, line1Y);

    ctx.font = `400 ${addrSize}px "Noto Sans Telugu", sans-serif`;
    ctx.fillStyle = '#FAF0D7';
    ctx.fillText(CHURCH_ADDRESS_TE, canvasWidth / 2, line2Y);
  }

  ctx.restore();
}
