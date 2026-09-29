export type GameItem = {
  id: number;
  erogsId: number | null;
  imageUrl: string;
  updatedUserName: string;
  createdAt: string;
  updatedAt: string;
};

export type EnsureGameBody = {
  erogsId: number;
};

export type UpdateGameBody = {
  imageUrl: string;
};
