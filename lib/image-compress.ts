/**
 * Client-side canvas image compression utility.
 * Resizes large user uploads down to compact WebP/JPEG data URLs under ~80KB.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  squareCrop?: boolean;
}

export async function compressImageFile(
  file: File,
  options: CompressOptions = {},
): Promise<string> {
  const {
    maxWidth = 900,
    maxHeight = 300,
    quality = 0.82,
    squareCrop = false,
  } = options;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("অনুগ্রহ করে একটি ছবি ফাইল সিলেক্ট করো।"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("ফাইল পড়তে সমস্যা হয়েছে।"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("ছবি লোড করা যায়নি।"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context পাওয়া যায়নি।"));
          return;
        }

        let sx = 0;
        let sy = 0;
        let sWidth = img.width;
        let sHeight = img.height;
        let dWidth = img.width;
        let dHeight = img.height;

        if (squareCrop) {
          // Crop square from center for avatar
          const size = Math.min(img.width, img.height);
          sx = (img.width - size) / 2;
          sy = (img.height - size) / 2;
          sWidth = size;
          sHeight = size;
          const targetSize = Math.min(maxWidth, size);
          dWidth = targetSize;
          dHeight = targetSize;
        } else {
          // Fit into maxWidth x maxHeight preserving aspect ratio
          let scale = 1;
          if (img.width > maxWidth || img.height > maxHeight) {
            scale = Math.min(maxWidth / img.width, maxHeight / img.height);
          }
          dWidth = Math.round(img.width * scale);
          dHeight = Math.round(img.height * scale);
        }

        canvas.width = dWidth;
        canvas.height = dHeight;

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight);

        // Try webp first, fallback to jpeg
        let dataUrl = canvas.toDataURL("image/webp", quality);
        if (!dataUrl.startsWith("data:image/webp")) {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
