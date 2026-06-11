export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  rating: number;
  image?: string;
  type: 'own' | 'dropshipping';
  affiliateLink?: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Reloj de Lujo',
    price: 100,
    category: 'Wearables',
    rating: 5,
    type: 'own',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&h=500&fit=crop',
  },
  {
    id: 2,
    name: 'Teléfono Móvil',
    price: 499.99,
    category: 'Electrónica',
    rating: 5,
    type: 'dropshipping',
    affiliateLink: 'https://amazon.com',
    image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&h=500&fit=crop',
  },
];
