export type TeluguFontFamily = 'Noto Sans Telugu' | 'Mandali';
export type VerseTextColor = '#FFFFFF' | '#F3D078' | '#FAF0D7';
export type TextAlignOption = 'left' | 'center' | 'right';

export interface CanvasRenderOptions {
  verseText: string;
  referenceText: string;
  fontFamily: TeluguFontFamily;
  fontSize: number;
  fontWeight: '400' | '600' | '700';
  textColor: VerseTextColor;
  textAlign: TextAlignOption;
  overlayOpacity: number; // 0.25 to 0.78
  fallbackGradient?: [string, string, string];
}

const CANVAS_SIZE = 1080;
const HORIZONTAL_MARGIN = 110;
const MAX_TEXT_WIDTH = CANVAS_SIZE - HORIZONTAL_MARGIN * 2;
const FOOTER_HEIGHT = 116;
const VERSE_STAGE_TOP = 64;
const VERSE_STAGE_BOTTOM = CANVAS_SIZE - FOOTER_HEIGHT - 36;
const MAX_VERTICAL_CONTENT_HEIGHT = VERSE_STAGE_BOTTOM - VERSE_STAGE_TOP;

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
    await Promise.all([
      document.fonts.load(`400 ${fontSize}px "${fontFamily}"`),
      document.fonts.load(`600 ${fontSize}px "${fontFamily}"`),
      document.fonts.load(`700 ${fontSize}px "${fontFamily}"`),
      document.fonts.load(`700 28px "Noto Sans Telugu"`),
      document.fonts.load(`400 21px "Noto Sans Telugu"`),
      document.fonts.load(`600 28px "Plus Jakarta Sans"`),
    ]);
    await document.fonts.ready;
  } catch {
    // Continue safely if font loading API throws in restricted contexts
  }
}

export function renderVerseToCanvas(
  canvas: HTMLCanvasElement,
  backgroundImage: HTMLImageElement | null,
  options: CanvasRenderOptions,
  churchLogoImage?: HTMLImageElement | null
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  // 1. Draw background image or clean serene multi-stop theme gradient fallback
  if (backgroundImage && backgroundImage.complete && backgroundImage.naturalWidth > 0) {
    drawImageCover(ctx, backgroundImage, CANVAS_SIZE, CANVAS_SIZE);
  } else {
    const [cTop, cMid, cBottom] = options.fallbackGradient ?? [
      '#2B1D14',
      '#5B3A24',
      '#1A1412',
    ];
    const bgGrad = ctx.createLinearGradient(0, 0, CANVAS_SIZE * 0.6, CANVAS_SIZE);
    bgGrad.addColorStop(0, cTop);
    bgGrad.addColorStop(0.55, cMid);
    bgGrad.addColorStop(1, cBottom);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Soft atmospheric horizon light glow for depth
    const horizonGlow = ctx.createRadialGradient(
      CANVAS_SIZE * 0.5,
      CANVAS_SIZE * 0.38,
      40,
      CANVAS_SIZE * 0.5,
      CANVAS_SIZE * 0.38,
      640
    );
    horizonGlow.addColorStop(0, 'rgba(255, 224, 178, 0.22)');
    horizonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }

  // 2. Apply dark semi-transparent gradient/scrim for high Telugu text legibility
  const baseOpacity = Math.min(Math.max(options.overlayOpacity, 0.2), 0.85);
  const scrimGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE);
  scrimGradient.addColorStop(0, `rgba(10, 9, 12, ${Math.max(0.18, baseOpacity - 0.14)})`);
  scrimGradient.addColorStop(0.45, `rgba(10, 9, 12, ${baseOpacity})`);
  scrimGradient.addColorStop(1, `rgba(10, 9, 12, ${Math.min(0.88, baseOpacity + 0.14)})`);
  ctx.fillStyle = scrimGradient;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Subtle radial vignette around center to protect light midtones
  const radial = ctx.createRadialGradient(
    CANVAS_SIZE / 2,
    CANVAS_SIZE / 2,
    180,
    CANVAS_SIZE / 2,
    CANVAS_SIZE / 2,
    760
  );
  radial.addColorStop(0, 'rgba(0, 0, 0, 0.08)');
  radial.addColorStop(1, 'rgba(0, 0, 0, 0.34)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Subtle inset editorial frame border (stops cleanly above the bottom footer bar)
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(42, 42, CANVAS_SIZE - 84, CANVAS_SIZE - FOOTER_HEIGHT - 64);
  ctx.restore();

  // 3. Auto-fit Telugu font size so long verses or single long words never clip or slice
  const resolvedWeight = options.fontFamily === 'Mandali' ? '400' : options.fontWeight;
  let effectiveFontSize = options.fontSize;
  let wrappedLines: string[] = [];
  let lineHeight = Math.round(effectiveFontSize * 1.58);
  let refFontSize = Math.max(24, Math.round(effectiveFontSize * 0.62));
  const refGap = 44;

  const verseInput = options.verseText.trim() || 'దేవుని వాక్యము';

  while (effectiveFontSize >= 24) {
    ctx.font = `${resolvedWeight} ${effectiveFontSize}px "${options.fontFamily}", "Noto Sans Telugu", sans-serif`;
    const result = wrapTeluguLines(ctx, verseInput, MAX_TEXT_WIDTH);
    wrappedLines = result.lines;
    lineHeight = Math.round(effectiveFontSize * 1.58);
    refFontSize = Math.max(22, Math.round(effectiveFontSize * 0.6));
    const totalHeight = wrappedLines.length * lineHeight + (options.referenceText ? refGap + refFontSize : 0);

    if (!result.maxTokenOverflow && totalHeight <= MAX_VERTICAL_CONTENT_HEIGHT) {
      break;
    }
    effectiveFontSize -= 2;
  }

  // Re-measure one final time at the settled effectiveFontSize
  ctx.font = `${resolvedWeight} ${effectiveFontSize}px "${options.fontFamily}", "Noto Sans Telugu", sans-serif`;
  if (wrappedLines.length === 0) {
    wrappedLines = wrapTeluguLines(ctx, verseInput, MAX_TEXT_WIDTH).lines;
  }

  const hasReference = Boolean(options.referenceText.trim());
  const blockTextHeight = wrappedLines.length * lineHeight;
  const totalBlockHeight = blockTextHeight + (hasReference ? refGap + refFontSize + 18 : 0);

  let anchorX = CANVAS_SIZE / 2;
  if (options.textAlign === 'left') {
    anchorX = HORIZONTAL_MARGIN;
  } else if (options.textAlign === 'right') {
    anchorX = CANVAS_SIZE - HORIZONTAL_MARGIN;
  }

  const startY =
    VERSE_STAGE_TOP +
    (VERSE_STAGE_BOTTOM - VERSE_STAGE_TOP - totalBlockHeight) / 2 +
    effectiveFontSize * 0.85;

  // 4. Render Telugu Verse Lines with clean shadow for crisp diacritic clarity
  ctx.save();
  ctx.textAlign = options.textAlign;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = options.textColor;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.58)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 3;

  wrappedLines.forEach((line, index) => {
    if (!line) return;
    const y = startY + index * lineHeight;
    ctx.fillText(line, anchorX, y);
  });

  // 5. Render hairline rule & Bible reference
  if (hasReference) {
    const ruleY = startY + (wrappedLines.length - 1) * lineHeight + 34;
    const ruleWidth = 64;
    let ruleX = CANVAS_SIZE / 2 - ruleWidth / 2;
    if (options.textAlign === 'left') {
      ruleX = HORIZONTAL_MARGIN;
    } else if (options.textAlign === 'right') {
      ruleX = CANVAS_SIZE - HORIZONTAL_MARGIN - ruleWidth;
    }

    ctx.save();
    ctx.shadowBlur = 0;
    ctx.strokeStyle =
      options.textColor === '#F3D078'
        ? 'rgba(243, 208, 120, 0.65)'
        : 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ruleX, ruleY);
    ctx.lineTo(ruleX + ruleWidth, ruleY);
    ctx.stroke();
    ctx.restore();

    const refY = ruleY + 38 + refFontSize * 0.25;
    ctx.font = `600 ${refFontSize}px "${options.fontFamily}", "Noto Sans Telugu", sans-serif`;
    ctx.fillStyle = options.textColor === '#FFFFFF' ? '#F5EFE6' : options.textColor;
    ctx.fillText(`— ${options.referenceText.trim()}`, anchorX, refY);
  }

  ctx.restore();

  // 6. Render Semi-Transparent Dark Church Footer Bar at the Very Bottom Center
  const footerY = CANVAS_SIZE - FOOTER_HEIGHT;
  ctx.save();
  ctx.fillStyle = 'rgba(10, 9, 12, 0.72)';
  ctx.fillRect(0, footerY, CANVAS_SIZE, FOOTER_HEIGHT);

  // Delicate top hairline accent on footer bar
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, footerY + 0.5);
  ctx.lineTo(CANVAS_SIZE, footerY + 0.5);
  ctx.stroke();

  const hasLogo = Boolean(
    churchLogoImage && churchLogoImage.complete && churchLogoImage.naturalWidth > 0
  );

  const logoMaxBox = 72;
  const logoGap = 20;
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

  // Auto-fit footer font sizes so both Telugu lines never clip horizontally
  let titleSize = 27;
  let addrSize = 20;
  const maxFooterTextWidth =
    CANVAS_SIZE - 80 - (hasLogo ? logoDrawW + logoGap : 0);

  let titleWidth = 0;
  let addrWidth = 0;

  while (addrSize >= 14) {
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
  const footerCenterY = footerY + FOOTER_HEIGHT / 2;
  const line1Y = footerCenterY - 8;
  const line2Y = footerCenterY + 24;

  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;
  ctx.textBaseline = 'alphabetic';

  if (hasLogo && churchLogoImage) {
    const totalGroupWidth = logoDrawW + logoGap + textBlockWidth;
    const groupStartX = (CANVAS_SIZE - totalGroupWidth) / 2;
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
    ctx.fillText(CHURCH_TITLE_TE, CANVAS_SIZE / 2, line1Y);

    ctx.font = `400 ${addrSize}px "Noto Sans Telugu", sans-serif`;
    ctx.fillStyle = '#FAF0D7';
    ctx.fillText(CHURCH_ADDRESS_TE, CANVAS_SIZE / 2, line2Y);
  }

  ctx.restore();
}
