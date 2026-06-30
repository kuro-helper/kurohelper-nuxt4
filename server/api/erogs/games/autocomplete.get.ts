import { createError, defineEventHandler, getQuery } from 'h3';
import {
  isErogsGameAutocompleteReady,
  searchErogsGames,
} from '../../../utils/erogsGameAutocomplete';

export default defineEventHandler((event) => {
  if (!isErogsGameAutocompleteReady()) {
    throw createError({
      statusCode: 503,
      statusMessage: '遊戲自動補全尚未就緒',
    });
  }

  // 取出 query string
  const q = getQuery(event).q;
  if (typeof q !== 'string') {
    return { data: [] };
  }

  return {
    data: searchErogsGames(q),
  };
});
