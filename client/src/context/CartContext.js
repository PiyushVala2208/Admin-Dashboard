"use client";
import {
  createContext,
  useContext,
  useSyncExternalStore,
} from "react";
import {
  dispatchCartSync,
  loadCart,
  loadWishlist,
  EMPTY_STORAGE_LIST,
} from "@/app/utils/browserStorage";

const CartContext = createContext();

const subscribeToStorage = (callback) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", callback);
  window.addEventListener("cartUpdate", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("cartUpdate", callback);
  };
};

export const CartProvider = ({ children }) => {
  const cartItems = useSyncExternalStore(
    subscribeToStorage,
    loadCart,
    () => EMPTY_STORAGE_LIST,
  );
  const wishlistItems = useSyncExternalStore(
    subscribeToStorage,
    loadWishlist,
    () => EMPTY_STORAGE_LIST,
  );

  const cartCount = cartItems.length;
  const wishlistCount = wishlistItems.length;
  const refreshData = () => dispatchCartSync();
  const loading = false;

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
