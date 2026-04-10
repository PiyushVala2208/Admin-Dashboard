"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    if (typeof window === "undefined") return;

    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    const localWish = JSON.parse(localStorage.getItem("wishlist")) || [];

    setCartItems(localCart);
    setWishlistItems(localWish);

    setCartCount(localCart.length);

    setWishlistCount(localWish.length);

    setLoading(false);
  }, []);

  useEffect(() => {
    refreshData();

    const handleStorageChange = () => refreshData();
    window.addEventListener("storage", handleStorageChange);

    window.addEventListener("cartUpdate", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdate", handleStorageChange);
    };
  }, [refreshData]);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        wishlistCount,
        cartItems,
        wishlistItems,
        refreshData,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
