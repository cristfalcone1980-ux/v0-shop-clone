export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  rating: number;
  image?: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Auriculares Inalámbricos Pro',
    price: 149.99,
    category: 'Audio',
    rating: 5,
  },
  {
    id: 2,
    name: 'Reloj Inteligente Ultra',
    price: 299.99,
    category: 'Wearables',
    rating: 4,
  },
  {
    id: 3,
    name: 'Cámara 4K Compacta',
    price: 899.99,
    category: 'Electrónica',
    rating: 5,
  },
  {
    id: 4,
    name: 'Mochila Inteligente',
    price: 89.99,
    category: 'Accesorios',
    rating: 4,
  },
  {
    id: 5,
    name: 'Powerbank de 50000mAh',
    price: 59.99,
    category: 'Accesorios',
    rating: 5,
  },
  {
    id: 6,
    name: 'Luz LED Inteligente',
    price: 79.99,
    category: 'Iluminación',
    rating: 4,
  },
  {
    id: 7,
    name: 'Mousepad Gaming XL',
    price: 49.99,
    category: 'Gaming',
    rating: 4,
  },
  {
    id: 8,
    name: 'Soporte Ajustable para Escritorio',
    price: 39.99,
    category: 'Accesorios',
    rating: 5,
  },
  {
    id: 9,
    name: 'Cable USB-C Premium',
    price: 29.99,
    category: 'Accesorios',
    rating: 5,
  },
  {
    id: 10,
    name: 'Hub USB 7 Puertos',
    price: 69.99,
    category: 'Electrónica',
    rating: 4,
  },
  {
    id: 11,
    name: 'Micrófono Condensador',
    price: 199.99,
    category: 'Audio',
    rating: 5,
  },
  {
    id: 12,
    name: 'Stand para Micrófono',
    price: 34.99,
    category: 'Audio',
    rating: 4,
  },
];
