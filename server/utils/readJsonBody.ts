import { readRawBody, setResponseStatus, type H3Event } from 'h3';

export type ParsedJsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; status: number; message: string };

/** 讀取 body 並 parse JSON（invalid JSON → 400）。 */
export const readJsonBody = async (event: H3Event): Promise<ParsedJsonBodyResult> => {
  const rawBuf = await readRawBody(event);
  const raw =
    rawBuf === undefined || rawBuf === null
      ? ''
      : typeof rawBuf === 'string'
        ? rawBuf
        : new TextDecoder().decode(rawBuf as Uint8Array);

  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    setResponseStatus(event, 400);
    return { ok: false, status: 400, message: 'JSON 格式錯誤' };
  }
};
