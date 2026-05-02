/** 申辦流程：邀請查詢（BFF）+ 送單後結果暫存 sessionStorage 供 `/register/info` 顯示 */

const SUBMIT_INFO_KEY = 'register-submit-info';

type ApiEnvelope<T> = { message: string; data: T | null };

export type RegisterSubmitInfo = {
  variant: 'success' | 'error';
  message: string;
};

/** 呼叫後請 `navigateTo('/register/info')` */
export const setRegisterSubmitInfo = (payload: RegisterSubmitInfo) => {
  sessionStorage.setItem(SUBMIT_INFO_KEY, JSON.stringify(payload));
};

/** 讀取並清除（僅限客戶端） */
export const consumeRegisterSubmitInfo = (): RegisterSubmitInfo | null => {
  if (!import.meta.client) return null;
  const raw = sessionStorage.getItem(SUBMIT_INFO_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(SUBMIT_INFO_KEY);
  try {
    const o = JSON.parse(raw) as RegisterSubmitInfo;
    if ((o.variant === 'success' || o.variant === 'error') && typeof o.message === 'string') {
      return o;
    }
  } catch {
    /* ignore */
  }
  return null;
};

export type RegisterInviteResult = { found: true; discordId: string } | { found: false };

export const lookupRegisterInvite = async (invitationId: string): Promise<RegisterInviteResult> => {
  const id = invitationId.trim();
  if (!id) return { found: false };
  try {
    const res = await fetch(`/api/register/${encodeURIComponent(id)}`, { cache: 'no-store' });
    if (!res.ok) return { found: false };
    const json = (await res.json()) as ApiEnvelope<{ discord_id: string }>;
    const discordId = json.data?.discord_id;
    return discordId ? { found: true, discordId } : { found: false };
  } catch {
    return { found: false };
  }
};
