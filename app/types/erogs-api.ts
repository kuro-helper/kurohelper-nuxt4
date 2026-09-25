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
