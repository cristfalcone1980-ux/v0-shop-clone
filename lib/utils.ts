export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export function calculateTotal(items: Array<{ price: number; quantity: number }>): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
