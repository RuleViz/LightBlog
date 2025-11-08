export const DEFAULT_IMAGE_SIZE = 100;
export const MIN_IMAGE_SIZE = 40;
export const MAX_IMAGE_SIZE = 160;

export const clampImageSize = (value: number) => {
  if (!Number.isFinite(value)) {
    return DEFAULT_IMAGE_SIZE;
  }
  return Math.min(MAX_IMAGE_SIZE, Math.max(MIN_IMAGE_SIZE, Math.round(value)));
};

const stripSizeMeta = (altText: string) => {
  if (!altText) return '';
  const marker = altText.lastIndexOf('|size=');
  if (marker === -1) {
    return altText;
  }
  return altText.substring(0, marker);
};

export const encodeImageAlt = (altText: string, size: number) => {
  const base = stripSizeMeta(altText).trimEnd();
  const normalized = clampImageSize(size);
  if (!base) {
    return `|size=${normalized}`;
  }
  return `${base}|size=${normalized}`;
};

export const decodeImageAlt = (altText?: string | null) => {
  if (!altText) {
    return {
      altText: '',
      size: DEFAULT_IMAGE_SIZE,
    };
  }

  const marker = altText.lastIndexOf('|size=');
  if (marker === -1) {
    return {
      altText,
      size: DEFAULT_IMAGE_SIZE,
    };
  }

  const sizeSlice = altText.substring(marker + 6);
  const parsed = parseInt(sizeSlice, 10);
  const normalizedSize = clampImageSize(parsed);

  return {
    altText: altText.substring(0, marker),
    size: normalizedSize,
  };
};


