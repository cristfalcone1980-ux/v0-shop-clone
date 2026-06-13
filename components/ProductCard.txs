'use client';

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (id: number) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-orange-500 transition-colors">
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-white font-medium mb-2">{product.name}</h3>
        <p className="text-orange-500 font-bold text-lg mb-4">{product.price}€</p>
        <button
          onClick={() => onAddToCart(product.id)}
          className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 font-medium"
        >
          Añadir al carrito
        </button>
      </div>
    </div>
  );
}
