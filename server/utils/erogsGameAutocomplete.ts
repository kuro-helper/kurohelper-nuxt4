import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export type ErogsGameItem = {
  id: number;
  name: string;
};

const SEARCH_LIMIT = 20;
const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 50;

let loaded = false;
let games: ErogsGameItem[] = [];
const invertedIndex = new Map<string, number[]>();

function distinctGames(entries: ErogsGameItem[]): ErogsGameItem[] {
  const seen = new Set<string>();
  const result: ErogsGameItem[] = [];

  for (const entry of entries) {
    if (!entry?.name?.trim() || entry.id <= 0) continue;
    const name = entry.name.trim();
    const key = `${entry.id}\0${name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ id: entry.id, name });
  }

  return result;
}

function buildInvertedIndex(items: ErogsGameItem[]) {
  invertedIndex.clear();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) continue;

    const name = item.name.toLowerCase();
    const seen = new Set<string>();

    for (const char of name) {
      if (seen.has(char)) continue;
      seen.add(char);
      const bucket = invertedIndex.get(char);
      if (bucket) bucket.push(i);
      else invertedIndex.set(char, [i]);
    }
  }
}

export function isErogsGameAutocompleteReady() {
  return loaded;
}

export async function loadErogsGameAutocomplete(filePath: string) {
  if (loaded) return;

  const absPath = resolve(process.cwd(), filePath);
  const raw = await readFile(absPath, 'utf-8');
  const entries = JSON.parse(raw) as ErogsGameItem[];

  games = distinctGames(entries);
  buildInvertedIndex(games);
  loaded = true;
}

export function searchErogsGames(query: string, limit = SEARCH_LIMIT): ErogsGameItem[] {
  if (!loaded) return [];

  const normalized = query.trim().toLowerCase().slice(0, MAX_QUERY_LENGTH);
  const queryRunes = [...normalized];
  if (queryRunes.length < MIN_QUERY_LENGTH) return [];

  const firstChar = queryRunes[0];
  if (!firstChar) return [];

  const targetIndices = invertedIndex.get(firstChar);
  if (!targetIndices?.length) return [];

  const results: ErogsGameItem[] = [];
  for (const idx of targetIndices) {
    const game = games[idx];
    if (!game || !game.name.toLowerCase().includes(normalized)) continue;
    results.push(game);
    if (results.length >= limit) break;
  }

  return results;
}
