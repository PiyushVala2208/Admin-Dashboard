"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ShopHomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: "THE ART OF <br /> PURPLE",
      subtitle: "Royal Essentials",
      img: "https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=2000&auto=format&fit=crop",
    },
    {
      title: "LAVENDER <br /> ELEGANCE",
      subtitle: "Boutique Collection",
      img: "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?q=80&w=2000&auto=format&fit=crop",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === heroSlides.length - 1 ? 0 : prev + 1,
      );
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white">
      <section className="px-5 py-5">
        <div className="relative h-[80vh] w-full rounded-[3rem] overflow-hidden shadow-2xl bg-[#F5F3FF]">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            >
              <Link href="/shop/products">
                <img
                  src={slide.img}
                  alt={slide.subtitle}
                  className="w-full h-full object-cover brightness-[0.65] cursor-pointer hover:scale-105 transition-transform duration-3000"
                />
              </Link>
              
              <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-24 pointer-events-none">
                <div className={index === currentSlide ? "animate-in fade-in slide-in-from-left-10 duration-1000" : ""}>
                  <p className="text-[#F5F3FF] font-bold uppercase tracking-[0.4em] text-[10px] mb-4">
                    {slide.subtitle}
                  </p>
                  <h1
                    className="text-6xl md:text-[8rem] font-serif italic text-white leading-[0.9] mb-10 tracking-tighter"
                    dangerouslySetInnerHTML={{ __html: slide.title }}
                  />
                  
                  <div className="pointer-events-auto">
                    <Link
                      href="/shop/products"
                      className="group inline-flex items-center gap-4 bg-[#7C3AED] text-white px-10 py-5 rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-[#5B21B6] transition-all shadow-xl active:scale-95"
                    >
                      Discover Now <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="absolute bottom-10 right-10 z-20 flex gap-3">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? "w-10 bg-[#A78BFA]" : "w-3 bg-white/40"}`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-350 mx-auto px-8 py-24">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-16 gap-4">
          <h2 className="text-4xl md:text-5xl font-serif italic text-[#4C1D95]">
            The <span className="text-[#8B5CF6]">Signature</span> Edit
          </h2>
          <Link
            href="/shop/products"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A78BFA] border-b border-[#A78BFA] pb-1 hover:text-[#7C3AED] hover:border-[#7C3AED] transition-all"
          >
            View All Collections
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            {
              name: "Apparel",
              img: "https://images.unsplash.com/photo-1566206091558-7f218b696731?q=80&w=1000&auto=format&fit=crop",
              count: "120+ Items",
            },
            {
              name: "Accessories",
              img: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=1000&auto=format&fit=crop",
              count: "85+ Items",
            },
            {
              name: "Footwear",
              img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop",
              count: "64+ Items",
            },
            {
              name: "Cosmetics",
              img: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=1000&auto=format&fit=crop",
              count: "40+ Items",
            },
          ].map((cat, i) => (
            <Link key={i} href={"/shop/products"} className="group block">
              <div className="relative aspect-4/5 overflow-hidden rounded-[2.5rem] mb-6 bg-[#F5F3FF]">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-[#4C1D95]/5 group-hover:bg-transparent transition-colors" />
              </div>
              <h3 className="text-[#4C1D95] font-bold uppercase text-[12px] tracking-widest">
                {cat.name}
              </h3>
              <p className="text-[#A78BFA] text-[10px] font-medium mt-1 uppercase tracking-wider">
                {cat.count}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-8 py-10">
        <div className="max-w-350 mx-auto bg-[#F5F3FF] rounded-[3rem] p-10 md:p-20 flex flex-col md:flex-row items-center gap-16 border border-[#DDD6FE]">
          <div className="flex-1 space-y-8 text-center md:text-left">
            <span className="text-[#7C3AED] font-black uppercase tracking-[0.3em] text-[10px]">
              Limited Member Access
            </span>
            <h2 className="text-5xl md:text-7xl font-serif italic text-[#4C1D95] leading-tight">
              Join the <br /> <span className="text-[#A78BFA]">Privilege</span> Circle
            </h2>
            <p className="text-[#5B21B6]/70 font-medium text-sm max-w-sm">
              Experience early drops, personalized styling, and complimentary concierge shipping.
            </p>
            <button className="bg-[#4C1D95] text-white px-12 py-5 rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-[#7C3AED] transition-all shadow-xl active:scale-95">
              Apply for Membership
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}