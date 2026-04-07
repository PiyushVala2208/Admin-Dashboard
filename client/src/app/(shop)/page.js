"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ShopHomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: "FUTURE <br /> INTERFACES",
      subtitle: "Electronics Showcase",
      img: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?q=80&w=2000&auto=format&fit=crop",
    },
    {
      title: "THE ART <br /> OF DETAIL",
      subtitle: "Boutique Accessories",
      img: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=2000&auto=format&fit=crop",
    },
    {
      title: "SCULPTED <br /> SPACES",
      subtitle: "Architectural Living",
      img: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2000&auto=format&fit=crop",
    },
    {
      title: "MODERN <br /> COUTURE",
      subtitle: "Tailored Collection",
      img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop",
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
    <div className="bg-white overflow-x-hidden">
      <section className="px-3 md:px-5 py-2">
        <div className="relative h-[70vh] md:h-[85vh] w-full rounded-4xl md:rounded-[3rem] overflow-hidden shadow-2xl bg-[#F5F3FF]">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            >
              <Link href="/products">
                <img
                  src={slide.img}
                  alt={slide.subtitle}
                  className="w-full h-full object-cover brightness-[0.65] cursor-pointer hover:scale-110 transition-transform duration-6000 ease-out"
                />
              </Link>

              <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 md:px-24 pointer-events-none">
                <div
                  className={
                    index === currentSlide
                      ? "animate-in fade-in slide-in-from-left-10 duration-1000"
                      : ""
                  }
                >
                  <p className="text-[#F5F3FF] font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] text-[8px] md:text-[10px] mb-3 md:mb-4">
                    {slide.subtitle}
                  </p>
                  <h1
                    className="text-4xl sm:text-6xl md:text-[8rem] font-serif italic text-white leading-[0.95] md:leading-[0.9] mb-6 md:mb-10 tracking-tighter"
                    dangerouslySetInnerHTML={{ __html: slide.title }}
                  />

                  <div className="pointer-events-auto">
                    <Link
                      href="/products"
                      className="group inline-flex items-center gap-3 md:gap-4 bg-[#7C3AED] text-white px-6 md:px-10 py-3.5 md:py-5 rounded-full font-bold uppercase text-[8px] md:text-[10px] tracking-widest hover:bg-[#5B21B6] transition-all shadow-xl active:scale-95"
                    >
                      Discover Now
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-2 transition-transform"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="absolute bottom-6 md:bottom-10 right-6 md:right-10 z-20 flex gap-2 md:gap-3">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1 md:h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? "w-6 md:w-10 bg-[#A78BFA]" : "w-2 md:w-3 bg-white/40"}`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-10 md:mb-16 gap-4">
          <h2 className="text-3xl md:text-5xl font-serif italic text-[#4C1D95]">
            The <span className="text-[#8B5CF6]">Signature</span> Edit
          </h2>
          <Link
            href="/inventory"
            className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#A78BFA] border-b border-[#A78BFA] pb-1 hover:text-[#7C3AED] hover:border-[#7C3AED] transition-all"
          >
            Explore All Categories
          </Link>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {[
            {
              name: "Electronics",
              slug: "electronics",
              img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1000&auto=format&fit=crop",
            },
            {
              name: "Accessories",
              slug: "accessories",
              img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1000&auto=format&fit=crop",
            },
            {
              name: "Furniture",
              slug: "furniture",
              img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop",
            },
            {
              name: "Clothing",
              slug: "clothing",
              img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop",
            },
          ].map((cat, i) => (
            <Link
              key={i}
              href={`/products?category=${cat.slug}`}
              className="group block"
            >
              <div className="relative aspect-4/5 overflow-hidden rounded-4xl md:rounded-[2.5rem] mb-4 md:mb-6 bg-[#F5F3FF] shadow-lg shadow-purple-100/50">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#4C1D95]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute bottom-6 left-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 hidden sm:block">
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-full">
                    <span className="text-white text-[10px] font-bold tracking-widest uppercase">
                      View More
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-2">
                <h3 className="text-[#4C1D95] font-black uppercase text-[11px] md:text-[13px] tracking-[0.15em] group-hover:text-[#7C3AED] transition-colors text-center md:text-left">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 md:px-8 py-10 pb-20">
        <div className="max-w-7xl mx-auto bg-[#F5F3FF] rounded-4xl md:rounded-[3rem] p-8 sm:p-12 md:p-20 flex flex-col md:flex-row items-center gap-10 md:gap-16 border border-[#DDD6FE]">
          <div className="flex-1 space-y-6 md:space-y-8 text-center md:text-left">
            <span className="text-[#7C3AED] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[8px] md:text-[10px]">
              Limited Member Access
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif italic text-[#4C1D95] leading-tight">
              Join the <br className="hidden md:block" />
              <span className="text-[#A78BFA]">Privilege</span> Circle
            </h2>
            <p className="text-[#5B21B6]/70 font-medium text-xs md:text-sm max-w-sm mx-auto md:mx-0">
              Experience early drops, personalized styling, and complimentary
              concierge shipping.
            </p>
            <button className="bg-[#4C1D95] text-white px-8 md:px-12 py-4 md:py-5 rounded-full font-bold uppercase text-[8px] md:text-[10px] tracking-widest hover:bg-[#7C3AED] transition-all shadow-xl active:scale-95">
              Apply for Membership
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
