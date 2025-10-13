/* eslint-disable  @typescript-eslint/no-explicit-any */
/**
 * Card Generator - modern-screenshot version
 * - PNG via domToBlob (Blob)
 * - JPG via domToJpeg (dataURL -> Blob)
 * - Works with CSS Color 4 (lab/oklch/etc.) since it delegates to the browser (SVG/foreignObject)
 */

type ImgFormat = 'png' | 'jpg';

// Lazy import so it’s only loaded when needed
async function loadMs() {
  const ms = await import('modern-screenshot');
  return ms;
}

// Utility: convert dataURL to Blob
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return await res.blob();
}

// Core renderers
async function renderPngBlob(
  el: HTMLElement,
  backgroundColor = '#ffffff'
): Promise<Blob> {
  const { domToBlob } = await loadMs();
  // Options mirror html-to-image style; modern-screenshot supports these. 
  // See README -> Methods/Options. 
  return await domToBlob(el, {
    backgroundColor,   // solid background (socials prefer non-transparent)
    // If you load cross-origin images/fonts, ensure CORS headers on the asset servers.
  });
}

async function renderJpegBlob(
  el: HTMLElement,
  quality = 0.95,
  backgroundColor = '#ffffff'
): Promise<Blob> {
  const { domToJpeg } = await loadMs();
  const dataUrl = await domToJpeg(el, {
    quality,
    backgroundColor,
  });
  return await dataUrlToBlob(dataUrl);
}

export async function generateCardImage(
  cardElement: HTMLElement,
  options: {
    filename?: string;
    format?: ImgFormat;
    quality?: number; // used for JPG
  } = {}
): Promise<Blob | null> {
  const { format = 'png', quality = 0.95 } = options;
  try {
    // Ensure webfonts are ready for accurate layout (optional but recommended)
    if ('fonts' in document) {
      try { await (document as any).fonts.ready; } catch {}
    }

    if (format === 'png') {
      return await renderPngBlob(cardElement, '#ffffff');
    } else {
      return await renderJpegBlob(cardElement, quality, '#ffffff');
    }
  } catch (err) {
    console.error('Error generating card image:', err);
    return null;
  }
}

export async function downloadCardImage(
  cardElement: HTMLElement,
  filename: string = 'stupify-explanation',
  format: ImgFormat = 'png'
): Promise<boolean> {
  try {
    const blob = await generateCardImage(cardElement, { filename, format });
    if (!blob) return false;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Error downloading card:', err);
    return false;
  }
}

export async function shareCardImage(
  cardElement: HTMLElement,
  options: {
    question: string;
    answer: string;
    filename?: string;
    format?: ImgFormat;
  }
): Promise<boolean> {
  const { filename = 'stupify-explanation', format = 'png' } = options;

  try {
    const blob = await generateCardImage(cardElement, { filename, format });
    if (!blob) return false;

    if (navigator.share && navigator.canShare) {
      const file = new File(
        [blob],
        `${filename}.${format}`,
        { type: format === 'png' ? 'image/png' : 'image/jpeg' }
      );

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: options.question,
          text: `${options.question}\n\n${options.answer.substring(0, 100)}...\n\nExplained simply by Stupify!`,
        });
        return true;
      }
    }

    // Fallback to download
    return await downloadCardImage(cardElement, filename, format);
  } catch (err) {
    console.error('Error sharing card:', err);
    return false;
  }
}

/**
 * Generate multiple card formats at once (all PNGs)
 * square: 1080x1080, story: 1080x1920, twitter: 1200x675
 */
export async function generateCardFormats(cardElement: HTMLElement): Promise<{
  square: Blob | null;
  story: Blob | null;
  twitter: Blob | null;
}> {
  try {
    // Base PNG render (Blob)
    const baseBlob = await renderPngBlob(cardElement, '#ffffff');
    const baseBitmap = await createImageBitmap(baseBlob);

    const resize = async (w: number, h: number): Promise<Blob> => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('2D context unavailable');

      // letterbox fit
      const scale = Math.min(w / baseBitmap.width, h / baseBitmap.height);
      const dw = Math.round(baseBitmap.width * scale);
      const dh = Math.round(baseBitmap.height * scale);
      const dx = Math.round((w - dw) / 2);
      const dy = Math.round((h - dh) / 2);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(baseBitmap, dx, dy, dw, dh);

      return await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
      );
    };

    const [square, story, twitter] = await Promise.all([
      resize(1080, 1080),
      resize(1080, 1920),
      resize(1200, 675),
    ]);

    return { square, story, twitter };
  } catch (err) {
    console.error('Error generating card formats:', err);
    return { square: null, story: null, twitter: null };
  }
}
