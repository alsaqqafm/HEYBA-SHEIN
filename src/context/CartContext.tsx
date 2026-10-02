import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: 'cart-1',
    product_id: 'prod-01',
    quantity: 1,
    price: 18500,
    product: {
      id: 'prod-01',
      name: 'فستان أزرق ملكي فاخر للسهرات',
      description: 'فستان أنيق بتصميم عصري راقٍ خامات عالية الجودة.',
      category_id: 'cat-01',
      price: 18500,
      old_price: 24000,
      stock_quantity: 12,
      status: 'active',
      images: [
        { id: 'img-1', product_id: 'prod-01', image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80', sort_order: 1 },
      ],
    },
  },
  {
    id: 'cart-2',
    product_id: 'prod-02',
    quantity: 2,
    price: 8500,
    product: {
      id: 'prod-02',
      name: 'حقيبة يد نسائية فاخرة بلمسة عصرية',
      description: 'حقيبة جلدية مقاومة للماء مع حزام كتف معدني مميز.',
      category_id: 'cat-02',
      price: 8500,
      old_price: 11000,
      stock_quantity: 5,
      status: 'active',
      images: [
        { id: 'img-2', product_id: 'prod-02', image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', sort_order: 1 },
      ],
    },
  },
];

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('heyba_cart');
    return saved ? JSON.parse(saved) : INITIAL_CART_ITEMS;
  });

  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem('heyba_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.stock_quantity <= 0 || product.status === 'out_of_stock') {
      showToast('عذراً، هذا المنتج غير متوفر حالياً بالمخزون', 'error');
      return;
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock_quantity) {
          showToast(`عذراً، الكمية المتاحة في المخزون هي ${product.stock_quantity} قطعة فقط`, 'error');
          return prev;
        }
        showToast(`تم زيادة الكمية إلى ${newQty} في السلة`);
        return prev.map((item) =>
          item.product_id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        if (quantity > product.stock_quantity) {
          showToast(`عذراً، الكمية المتاحة هي ${product.stock_quantity} فقط`, 'error');
          return prev;
        }
        showToast('تمت إضافة المنتج إلى سلة التسوق بنجاح');
        return [
          ...prev,
          {
            id: `item-${Date.now()}`,
            product_id: product.id,
            product,
            quantity,
            price: product.price,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product_id !== productId));
    showToast('تم إزالة المنتج من السلة', 'info');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.product_id === productId) {
          if (quantity > item.product.stock_quantity) {
            showToast(`الحد الأقصى للمخزون هو ${item.product.stock_quantity} قطعة`, 'error');
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 1500 : 0;
  const grandTotal = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        subtotal,
        deliveryFee,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
