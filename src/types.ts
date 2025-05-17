export interface Gem {
  id: number;
  quantity: number;
  metadata: {
    name: string;
    image: string;
    description?: string;
    [key: string]: unknown;
  };
} 