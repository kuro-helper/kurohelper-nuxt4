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
