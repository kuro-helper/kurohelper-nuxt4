type TwitterCard = 'summary' | 'summary_large_image' | 'app' | 'player';
type OgType =
  | 'website'
  | 'article'
  | 'book'
  | 'profile'
  | 'music.song'
  | 'music.album'
  | 'music.playlist'
  | 'music.radio_status'
  | 'video.movie'
  | 'video.episode'
  | 'video.tv_show'
  | 'video.other';

const nonEmpty = (value: unknown) => String(value ?? '').trim();

const toAbsoluteUrl = (value: string, siteUrl: string): string | undefined => {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;

  const base = siteUrl.replace(/\/$/, '');
  if (!base) return undefined;

  return `${base}${value.startsWith('/') ? value : `/${value}`}`;
};

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public;
  const route = useRoute();

  const siteName = nonEmpty(config.ogTitle);
  const description = nonEmpty(config.ogDescription);
  const siteUrl = nonEmpty(config.siteUrl);
  const ogType = nonEmpty(config.ogType);
  const twitterCard = nonEmpty(config.twitterCard) as TwitterCard | '';
  const ogImageRaw = nonEmpty(config.ogImage);

  const ogImage = computed(() => toAbsoluteUrl(ogImageRaw, siteUrl));
  const ogUrl = computed(() => {
    if (!siteUrl) return undefined;
    const base = siteUrl.replace(/\/$/, '');
    return `${base}${route.fullPath}`;
  });

  if (siteName) {
    useHead({
      titleTemplate: (title) => (title ? `${title} · ${siteName}` : siteName),
    });
  }

  useSeoMeta({
    ...(description
      ? { description, ogDescription: description, twitterDescription: description }
      : {}),
    ...(siteName ? { ogTitle: siteName, ogSiteName: siteName, twitterTitle: siteName } : {}),
    ...(ogType ? { ogType: ogType as OgType } : {}),
    ...(twitterCard ? { twitterCard: twitterCard as TwitterCard } : {}),
    ...(ogImageRaw ? { ogImage, twitterImage: ogImage } : {}),
    ...(siteUrl ? { ogUrl } : {}),
  });
});
