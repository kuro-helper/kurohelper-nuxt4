const HTTP_URL_RE = /^https?:\/\//i;

export const isAvatarUrlFormatValid = (url: string): boolean => {
  const trimmed = url.trim();
  if (!trimmed) return true;
  if (!HTTP_URL_RE.test(trimmed)) return false;
  try {
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
};

/** 以 Image 載入確認 URL 可取得圖片資源（瀏覽器端，受 CORS／防盜連影響）。 */
export const probeAvatarImageUrl = (url: string, timeoutMs = 10_000): Promise<void> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    let settled = false;

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      fn();
    };

    const timer = window.setTimeout(() => finish(() => reject(new Error('timeout'))), timeoutMs);
    img.onload = () => finish(resolve);
    img.onerror = () => finish(() => reject(new Error('load failed')));
    img.src = url;
  });

export const validateAvatarUrlReachable = async (url: string): Promise<string | null> => {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (!isAvatarUrlFormatValid(trimmed)) {
    return '大頭照 URL 格式不正確（需以 http:// 或 https:// 開頭）';
  }
  try {
    await probeAvatarImageUrl(trimmed);
    return null;
  } catch {
    return '無法載入大頭照 URL，請確認連結可造訪且為有效圖片';
  }
};
