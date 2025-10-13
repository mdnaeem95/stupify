/**
 * Card Generator - Creates downloadable images from ShareableCard components
 * Uses html2canvas for rendering
 */

export async function generateCardImage(
  cardElement: HTMLElement,
  options: {
    filename?: string;
    format?: 'png' | 'jpg';
    quality?: number;
  } = {}
): Promise<Blob | null> {
  const { filename = 'stupify-explanation', format = 'png', quality = 0.95 } = options;

  try {
    // Dynamically import html2canvas only when needed
    const html2canvas = (await import('html2canvas')).default;

    // Generate canvas from element
    const canvas = await html2canvas(cardElement, {
      scale: 2, // Higher quality
      backgroundColor: null,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate image blob'));
          }
        },
        format === 'png' ? 'image/png' : 'image/jpeg',
        quality
      );
    });
  } catch (error) {
    console.error('Error generating card image:', error);
    return null;
  }
}

export async function downloadCardImage(
  cardElement: HTMLElement,
  filename: string = 'stupify-explanation'
): Promise<boolean> {
  try {
    const blob = await generateCardImage(cardElement, { filename });
    if (!blob) return false;

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error downloading card:', error);
    return false;
  }
}

export async function shareCardImage(
  cardElement: HTMLElement,
  options: {
    question: string;
    answer: string;
  }
): Promise<boolean> {
  try {
    const blob = await generateCardImage(cardElement);
    if (!blob) return false;

    // Check if Web Share API is available with files support
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], 'stupify-explanation.png', { type: 'image/png' });
      
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: options.question,
          text: `${options.question}\n\n${options.answer.substring(0, 100)}...\n\nExplained simply by Stupify!`,
        });
        return true;
      }
    }

    // Fallback: Download the image
    return await downloadCardImage(cardElement);
  } catch (error) {
    console.error('Error sharing card:', error);
    return false;
  }
}

/**
 * Generate multiple card formats at once
 */
export async function generateCardFormats(cardElement: HTMLElement): Promise<{
  square: Blob | null; // 1080x1080 for Instagram
  story: Blob | null; // 1080x1920 for Stories
  twitter: Blob | null; // 1200x675 for Twitter
}> {
  try {
    const html2canvas = (await import('html2canvas')).default;

    // Generate base canvas
    const baseCanvas = await html2canvas(cardElement, {
      scale: 2,
      backgroundColor: null,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Helper to resize canvas
    const resizeCanvas = (
      originalCanvas: HTMLCanvasElement,
      width: number,
      height: number
    ): Blob | null => {
      const resizedCanvas = document.createElement('canvas');
      resizedCanvas.width = width;
      resizedCanvas.height = height;
      const ctx = resizedCanvas.getContext('2d');
      if (!ctx) return null;

      // Calculate scaling to fit
      const scale = Math.min(width / originalCanvas.width, height / originalCanvas.height);
      const scaledWidth = originalCanvas.width * scale;
      const scaledHeight = originalCanvas.height * scale;
      const x = (width - scaledWidth) / 2;
      const y = (height - scaledHeight) / 2;

      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Draw scaled image
      ctx.drawImage(originalCanvas, x, y, scaledWidth, scaledHeight);

      // Convert to blob
      let blob: Blob | null = null;
      resizedCanvas.toBlob((b) => {
        blob = b;
      }, 'image/png');
      
      return blob;
    };

    return {
      square: resizeCanvas(baseCanvas, 1080, 1080),
      story: resizeCanvas(baseCanvas, 1080, 1920),
      twitter: resizeCanvas(baseCanvas, 1200, 675),
    };
  } catch (error) {
    console.error('Error generating card formats:', error);
    return {
      square: null,
      story: null,
      twitter: null,
    };
  }
}