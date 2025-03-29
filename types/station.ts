export interface Station {
  id: string;
  name: string;
  imageUrl: string;
  streamUrl: string;
  genre: string;
  description?: string;
  isFavorite?: boolean;
}