"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { apiRequest } from "../api/axios-instance";

export interface ShoeProduct {
  _id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  quantity: number;
  lowStockThreshold: number;
  image?: string;
  description?: string;
  salesCount: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Coupon {
  code: string;
  discountType: "percentage" | "fixed";
  value: number;
}

export interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponApplied?: string;
  status: "draft" | "confirmed" | "shipped" | "cancelled";
  createdAt: string;
}

export interface CallLog {
  _id: string;
  fromName: string;
  toName: string;
  type: "audio" | "video";
  duration: string;
  timestamp: string;
}

export interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku: string;
}

interface StoreContextProps {
  products: ShoeProduct[];
  setProducts: (products: ShoeProduct[]) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  orders: Order[];
  createOrder: (order: Omit<Order, "_id" | "createdAt">) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order["status"]) => Promise<void>;
  coupons: Coupon[];
  applyCoupon: (code: string, subtotal: number) => { discount: number; error?: string };
  callLogs: CallLog[];
  addCallLog: (log: Omit<CallLog, "_id" | "timestamp">) => Promise<void>;
  messages: Message[];
  sendMessage: (receiverEmail: string, content: string) => Promise<void>;
  addProduct: (product: Omit<ShoeProduct, "_id" | "salesCount">) => Promise<ShoeProduct>;
  editProduct: (id: string, product: Partial<ShoeProduct>) => Promise<ShoeProduct | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  refreshStore: () => Promise<void>;
  
  // Cart/Selected Items operations
  cart: CartItem[];
  addToCart: (product: ShoeProduct, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

const INITIAL_COUPONS: Coupon[] = [
  { code: "SHOELOVE20", discountType: "percentage", value: 20 },
  { code: "FIRST10", discountType: "percentage", value: 10 },
  { code: "HIVE500", discountType: "fixed", value: 500 },
  { code: "WELCOME50", discountType: "percentage", value: 50 }
];

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const { user, setUser } = useAuth();
  const [products, setProducts] = useState<ShoeProduct[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from LocalStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem("store_cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("store_cart", JSON.stringify(newCart));
  };

  const addToCart = (product: ShoeProduct, quantity: number) => {
    const existing = cart.find(item => item.productId === product._id);
    let newCart;
    if (existing) {
      newCart = cart.map(item =>
        item.productId === product._id
          ? { ...item, quantity: Math.min(product.quantity, item.quantity + quantity) }
          : item
      );
    } else {
      newCart = [
        ...cart,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: Math.min(product.quantity, quantity),
          image: product.image,
          sku: product.sku
        }
      ];
    }
    saveCart(newCart);
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter(item => item.productId !== productId);
    saveCart(newCart);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const newCart = cart.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    );
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  // Load user profile wishlist & phone on auth change
  useEffect(() => {
    if (user) {
      if (user.wishlist) {
        setWishlist(user.wishlist);
      }
    }
  }, [user]);

  // Load store data from Backend API (with LocalStorage fallbacks)
  const refreshStore = async () => {
    // 1. Fetch Products
    try {
      const response = await apiRequest<{ success: boolean; data: ShoeProduct[] }>("/products");
      if (response && response.data) {
        setProducts(response.data);
      }
    } catch (e) {
      const stored = localStorage.getItem("store_products");
      if (stored) setProducts(JSON.parse(stored));
    }

    // 2. Fetch Orders
    try {
      const response = await apiRequest<{ success: boolean; data: Order[] }>("/orders");
      if (response && response.data) {
        setOrders(response.data);
      }
    } catch (e) {
      const stored = localStorage.getItem("store_orders");
      if (stored) setOrders(JSON.parse(stored));
    }

    // 3. Fetch Call Logs
    try {
      const response = await apiRequest<{ success: boolean; data: any[] }>("/comms/calls");
      if (response && response.data) {
        setCallLogs(response.data.map(log => ({
          _id: log._id,
          fromName: log.fromName,
          toName: log.toName,
          type: log.type,
          duration: log.duration,
          timestamp: log.createdAt
        })));
      }
    } catch (e) {
      const stored = localStorage.getItem("store_call_logs");
      if (stored) setCallLogs(JSON.parse(stored));
    }

    // 4. Fetch Support Messages
    try {
      const response = await apiRequest<{ success: boolean; data: any[] }>("/comms/messages");
      if (response && response.data) {
        setMessages(response.data.map(msg => ({
          _id: msg._id,
          sender: msg.sender,
          receiver: msg.receiver,
          content: msg.content,
          timestamp: msg.createdAt
        })));
      }
    } catch (e) {
      const stored = localStorage.getItem("store_messages");
      if (stored) setMessages(JSON.parse(stored));
    }
  };

  useEffect(() => {
    if (user) {
      refreshStore();
    }
  }, [user]);

  // Toggle Wishlist (syncs with Mongoose database)
  const toggleWishlist = async (productId: string) => {
    let updatedWishlist = [...wishlist];
    if (updatedWishlist.includes(productId)) {
      updatedWishlist = updatedWishlist.filter(id => id !== productId);
    } else {
      updatedWishlist.push(productId);
    }
    
    setWishlist(updatedWishlist);
    localStorage.setItem("store_wishlist", JSON.stringify(updatedWishlist));

    try {
      // Send profile update payload to backend to save in MongoDB
      const response = await apiRequest<{ success: boolean; data: any }>("/auth/update", {
        method: "PUT",
        body: JSON.stringify({ wishlist: updatedWishlist })
      });
      if (response && response.data) {
        setUser({ ...user, wishlist: updatedWishlist });
      }
    } catch (e) {
      console.warn("Could not save wishlist to backend, using local state", e);
    }
  };

  // Create Purchase Order (connects to backend orders database)
  const createOrder = async (orderData: Omit<Order, "_id" | "createdAt">): Promise<Order> => {
    try {
      const response = await apiRequest<{ success: boolean; data: Order }>("/orders", {
        method: "POST",
        body: JSON.stringify(orderData)
      });
      if (response && response.data) {
        setOrders(prev => [response.data, ...prev]);
        refreshStore(); // Pull updated stock counts
        return response.data;
      }
    } catch (e) {
      console.error("Backend order failed, falling back to local simulation", e);
    }

    // Local fallback simulation
    const mockOrder: Order = {
      ...orderData,
      _id: `ord-${Math.floor(Math.random() * 90000) + 10000}`,
      createdAt: new Date().toISOString()
    };
    const updated = [mockOrder, ...orders];
    setOrders(updated);
    localStorage.setItem("store_orders", JSON.stringify(updated));
    return mockOrder;
  };

  // Update status (admin action)
  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
      await apiRequest(`/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      setOrders(prev => prev.map(ord => ord._id === orderId ? { ...ord, status } : ord));
    } catch (e) {
      console.error("Backend order update failed, using local status", e);
      setOrders(prev => prev.map(ord => ord._id === orderId ? { ...ord, status } : ord));
    }
  };

  // Apply discount coupon
  const applyCoupon = (code: string, subtotal: number) => {
    const coupon = INITIAL_COUPONS.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon) return { discount: 0, error: "Invalid coupon code" };

    if (coupon.discountType === "percentage") {
      const discount = Math.round((subtotal * coupon.value) / 100);
      return { discount };
    } else {
      const discount = Math.min(subtotal, coupon.value);
      return { discount };
    }
  };

  // Add dial log
  const addCallLog = async (logData: Omit<CallLog, "_id" | "timestamp">) => {
    try {
      const response = await apiRequest<{ success: boolean; data: any }>("/comms/calls", {
        method: "POST",
        body: JSON.stringify(logData)
      });
      if (response && response.data) {
        refreshStore();
        return;
      }
    } catch (e) {}

    // Fallback
    const newLog: CallLog = {
      ...logData,
      _id: `log-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    const updated = [newLog, ...callLogs];
    setCallLogs(updated);
    localStorage.setItem("store_call_logs", JSON.stringify(updated));
  };

  // Send support message
  const sendMessage = async (receiverEmail: string, content: string) => {
    try {
      const response = await apiRequest<{ success: boolean; data: any }>("/comms/messages", {
        method: "POST",
        body: JSON.stringify({ receiver: receiverEmail, content })
      });
      if (response && response.data) {
        refreshStore();
        // Trigger auto reply delay checking
        setTimeout(() => {
          refreshStore();
        }, 1600);
        return;
      }
    } catch (e) {}

    // Fallback
    if (!user) return;
    const newMsg: Message = {
      _id: `msg-${Math.random().toString(36).substr(2, 9)}`,
      sender: user.email,
      receiver: receiverEmail,
      content,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);
  };

  // CRUD handlers for Products
  const addProduct = async (prodData: Omit<ShoeProduct, "_id" | "salesCount">): Promise<ShoeProduct> => {
    try {
      const response = await apiRequest<{ success: boolean; data: ShoeProduct }>("/products", {
        method: "POST",
        body: JSON.stringify(prodData)
      });
      if (response && response.data) {
        refreshStore();
        return response.data;
      }
    } catch (e) {}

    // Fallback
    const mockNew: ShoeProduct = {
      ...prodData,
      _id: `shoe-${Math.random().toString(36).substr(2, 9)}`,
      salesCount: 0
    };
    return mockNew;
  };

  const editProduct = async (id: string, prodData: Partial<ShoeProduct>): Promise<ShoeProduct | null> => {
    try {
      const response = await apiRequest<{ success: boolean; data: ShoeProduct }>(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(prodData)
      });
      if (response && response.data) {
        refreshStore();
        return response.data;
      }
    } catch (e) {}
    return null;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const response = await apiRequest<{ success: boolean }>(`/products/${id}`, {
        method: "DELETE"
      });
      if (response && response.success) {
        refreshStore();
        return true;
      }
    } catch (e) {}
    return false;
  };

  const setProductsWrapper = (prods: ShoeProduct[]) => {
    setProducts(prods);
  };

  return (
    <StoreContext.Provider value={{
      products,
      setProducts: setProductsWrapper,
      wishlist,
      toggleWishlist,
      orders,
      createOrder,
      updateOrderStatus,
      coupons: INITIAL_COUPONS,
      applyCoupon,
      callLogs,
      addCallLog,
      messages,
      sendMessage,
      addProduct,
      editProduct,
      deleteProduct,
      refreshStore,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
