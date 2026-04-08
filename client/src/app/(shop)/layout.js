import Navbar from "@/components/shop/Navbar";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast"; // 1. Import Toaster

export const metadata = {
  title: "D.SHOP | The Luxury Edit",
  description: "Curated premium fashion and lifestyle essentials.",
};

export default function ShopLayout({ children }) {
  return (
    <div className="bg-[#F5F3FF] selection:bg-[#7C3AED]/20 selection:text-[#4C1D95]">
      <CartProvider>
        <Toaster 
          position="top-center" 
          reverseOrder={false} 
          toastOptions={{
            style: {
              borderRadius: '1rem',
              background: '#4C1D95',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 'bold',
            },
          }}
        />
        
        <Navbar />
        <main className="min-h-screen animate-in fade-in duration-1000">
          {children}
        </main>
      </CartProvider>
    </div>
  );
}