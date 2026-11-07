export type BrandErogsItem = {
  id: number;
  name: string;
  disband: boolean;
  gameCount: number;
  createdAt: string;
  updatedAt: string;
};

export type GameErogsItem = {
  id: number;
  brandErogsId: number;
  name: string;
  image: string;
  imageFromGame: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
};

export type ErogsOfficialGameCreator = {
  shubetuType: number;
  creatorName: string;
  shubetuDetailType: number;
  shubetuDetailName: string;
};

export type ErogsOfficialGame = {
  id: number;
  brandId: number;
  brandName: string;
  name: string;
  sellDay: string;
  model: string;
  dmm: string;
  median: string;
  tokutenCount: string;
  totalPlayTimeMedian: string;
  timeBeforeUnderstandingFunMedian: string;
  okazu: string;
  erogame: string;
  genre: string;
  bannerUrl: string;
  steamId: string;
  vndbId: string;
  shoukai: string;
  junni: number;
  creators: ErogsOfficialGameCreator[];
};

export type ErogsMusicListItem = {
  id: number;
  name: string;
  category: string;
  avgTokuten: number;
  tokutenCount: number;
  image: string;
  games: string[];
};

export type ErogsMusicGame = {
  name: string;
  model: string;
  category: string;
  image: string;
};

export type ErogsMusic = {
  id: number;
  name: string;
  playTime: string;
  releaseDate: string;
  avgTokuten: number;
  tokutenCount: number;
  image: string;
  singers: string[];
  lyrics: string[];
  compositions: string[];
  arrangements: string[];
  albums: string[];
  games: ErogsMusicGame[];
};
