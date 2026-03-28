import Navbar from "@/components/shop/Navbar";

export const metadata = {
  title: "D.SHOP | The Luxury Edit",
  description: "Curated premium fashion and lifestyle essentials.",
};

export default function ShopLayout({ children }) {
  return (
    <div className="bg-[#F5F3FF] selection:bg-[#7C3AED]/20 selection:text-[#4C1D95]">
      <Navbar />

      <main className="min-h-screen animate-in fade-in duration-1000">
        {children}
      </main>
    </div>
  );
}