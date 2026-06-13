'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';
import CartSidebar from '@/components/CartSidebar';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  product_type?: string;
  amazon_affiliate_link?: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<Array<{ id: number; quantity: number }>>([]);
  const [showCart, setShowCart] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const loadProducts = async () => {
      const { data } = await supabase.from('products').select('*');
      if (data) setProducts(data);
    };
    loadProducts();
  }, []);

  const addToCart = (productId: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: productId, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems((
