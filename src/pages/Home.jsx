import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

// ✅ You will keep these images in /public (as you said)
const HERO_IMAGES = [
  "/slider-img (1).jpg",
  "/slider-img (2).jpg",
  "/slider-img (3).jpg",
  "/slider-img (4).jpg",
  "/slider-img (5).jpg",
];

const BACKEND = "http://localhost:3000";
const FALLBACK_IMG = "https://via.placeholder.com/600x400?text=Product";

const Home = () => {
  const navigate = useNavigate();

  // products
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // featured filters
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  // dots active index (featured slider)
  const [activeIndex, setActiveIndex] = useState(0);

  // hero slider
  const [heroIndex, setHeroIndex] = useState(0);

  // refs
  const sliderRef = useRef(null);

  // ✅ hero auto slide
  useEffect(() => {
    const t = setInterval(() => {
      setHeroIndex((p) => (p + 1) % HERO_IMAGES.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  // resolve backend images
  const resolveImg = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/uploads")) return `${BACKEND}${img}`;
    return img;
  };

  // featured slider buttons
  const scrollLeft = () =>
    sliderRef.current?.scrollBy({ left: -360, behavior: "smooth" });

  const scrollRight = () =>
    sliderRef.current?.scrollBy({ left: 360, behavior: "smooth" });

  const scrollToIndex = (idx) => {
    const el = sliderRef.current;
    if (!el) return;
    el.querySelectorAll("[data-slide]")[idx]?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  };

  // fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const res = await API.get("/products");
        const data = Array.isArray(res.data) ? res.data : res.data.products;
        setProducts(data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // categories from products
  const categories = useMemo(() => {
    const set = new Set();
    (products || []).forEach((p) => {
      if (p.category) set.add(String(p.category));
    });
    return ["all", ...Array.from(set)];
  }, [products]);

  // filtered products
  const filteredProducts = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (products || []).filter((p) => {
      const matchQuery =
        !query ||
        String(p.name || "")
          .toLowerCase()
          .includes(query) ||
        String(p.description || "")
          .toLowerCase()
          .includes(query);

      const matchCat = cat === "all" || String(p.category || "") === cat;

      return matchQuery && matchCat;
    });
  }, [products, q, cat]);

  // ✅ show only 10 products in featured slider
  const featuredTen = useMemo(
    () => (filteredProducts || []).slice(0, 10),
    [filteredProducts],
  );

  // ✅ update active dot based on scroll
  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    const handler = () => {
      const slides = el.querySelectorAll("[data-slide]");
      if (!slides.length) return;

      let bestIdx = 0;
      let bestDist = Infinity;

      slides.forEach((slide, idx) => {
        const rect = slide.getBoundingClientRect();
        const dist = Math.abs(rect.left - 16);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = idx;
        }
      });

      setActiveIndex(bestIdx);
    };

    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, [featuredTen.length]);

  // ✅ reset to first slide when filters change
  useEffect(() => {
    setActiveIndex(0);
    const t = setTimeout(() => scrollToIndex(0), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [q, cat]);

  return (
    <div className="bg-gradient-to-br from-[#050b2c] via-[#0b1d4d] to-[#1b3fa7] min-h-screen">
      {/* ✅ responsive container padding */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8">
        {/* ================= HERO SECTION ================= */}
        <div className="relative overflow-hidden rounded-3xl mb-12 sm:mb-16 border border-white/10">
          {/* ✅ fixed height for all screens (prevents image cropping issues) */}
          <div className="absolute inset-0">
            {HERO_IMAGES.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Hero"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  heroIndex === i ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050b2c]/75 via-[#0b1d4d]/35 to-[#1b3fa7]/20" />
          </div>

          {/* ✅ HERO CONTENT: responsive spacing */}
          <section className="relative px-4 sm:px-10 py-12 sm:py-16 lg:py-24">
            <div className="max-w-2xl text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4">
                Welcome to MyApp
              </h2>

              <p className="text-white/90 max-w-xl xl:max-w-2xl mb-8 text-sm sm:text-base lg:text-lg">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Repellat mollitia perferendis accusantium aperiam quasi quaerat
                eligendi quam dolores, nemo ratione.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Link
                  to="/login"
                  className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition text-center w-full sm:w-auto"
                >
                  Get Started
                </Link>

                <Link
                  to="/signup"
                  className="border border-indigo-300 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition text-center w-full sm:w-auto"
                >
                  Create Account
                </Link>
              </div>

              <div className="mt-8 flex gap-2">
                {HERO_IMAGES.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      heroIndex === i ? "w-6 bg-white" : "w-2 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>

        <hr className="border-white/20 mb-10" />

        {/* ================= FEATURES  ================= */}
        <section className="mx-auto">
          <h3 className="text-4xl font-bold text-white text-center mb-10">
            <span className="relative inline-block">
              Featured
              <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-24 sm:w-36 md:w-44 h-0.5 bg-indigo-400 rounded-full"></span>
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-14 sm:mb-20">
            {["Frontend", "Backend", "Modern UI"].map((t, i) => {
              const img =
                t === "Frontend"
                  ? "/Frontendhome.webp"
                  : t === "Backend"
                    ? "/Backendhome.webp"
                    : "/ModernUIhome.png";

              return (
                <div
                  key={i}
                  className="p-5 sm:p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden"
                >
                  {/* ✅ Image inside the same box */}
                  <div className="mb-4 rounded-2xl overflow-hidden border border-white/15">
                    <img
                      src={img}
                      alt={t}
                      className="w-full h-50 object-cover"
                    />
                  </div>

                  <h3 className="text-xl font-semibold text-indigo-400 mb-2">
                    {t}
                  </h3>

                  <p className="text-white text-sm leading-relaxed">
                    {t === "Frontend" &&
                      "Modern React.js frontend with reusable components, context-based state management, authentication utilities, and API integration."}
                    {t === "Backend" &&
                      "Node.js & Express backend following Model-View-Controller (MVC) architecture with secure APIs, MongoDB models, and authentication middleware."}
                    {t === "Modern UI" &&
                      "Responsive, clean, and user-friendly interface designed for admin and customer roles with smooth navigation."}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <hr className="border-white/20 mb-10" />

        {/* ================= FEATURED PRODUCTS ================= */}
        <section className="mx-auto mb-16 sm:mb-20">
          <h3 className="text-4xl font-bold text-white text-center mb-10">
            <span className="relative inline-block">
              Featured Products
              {/* ✅ responsive underline width */}
              <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-36 sm:w-52 md:w-72 h-0.5 bg-indigo-400 rounded-full"></span>
            </span>
          </h3>

          <div className="mb-6">
            {/* ✅ search + category (as you asked) + buttons on right side */}
            {/* <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="w-full sm:w-[280px] px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="w-full sm:w-[220px] px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="text-black">
                    {c === "all" ? "All Categories" : c}
                  </option>
                ))}
              </select>
            </div> */}

            {/* ✅ slider buttons RIGHT SIDE */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={scrollLeft}
                className="bg-white/15 text-white px-4 py-2 rounded-xl hover:bg-white/25 transition text-sm sm:text-base border border-white/10"
              >
                ⬅
              </button>

              <button
                type="button"
                onClick={scrollRight}
                className="bg-white/15 text-white px-4 py-2 rounded-xl hover:bg-white/25 transition text-sm sm:text-base border border-white/10"
              >
                ➡
              </button>
            </div>
          </div>

          {loadingProducts ? (
            <p className="text-white text-center">Loading...</p>
          ) : featuredTen.length === 0 ? (
            <p className="text-white text-center">No products available</p>
          ) : (
            <>
              {/* slider */}
              <div
                ref={sliderRef}
                className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth pb-2"
              >
                {featuredTen.map((p, i) => (
                  <div
                    key={p._id || i}
                    data-slide
                    // ✅ responsive widths so desktop shows 3 cards
                    className="snap-start w-[85%] sm:w-[55%] md:w-[45%] lg:w-[32%] xl:w-[32%] flex-shrink-0 p-4 sm:p-5 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:bg-white/15 transition"
                  >
                    <img
                      src={resolveImg(p.image) || FALLBACK_IMG}
                      alt={p.name}
                      className="w-full h-36 sm:h-40 object-cover rounded-xl mb-3 border border-white/10"
                      onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                    />
                    <h4 className="text-indigo-300 font-semibold text-lg line-clamp-1">
                      {p.name}
                    </h4>
                    <p className="text-white/80 text-sm mb-3 line-clamp-2">
                      {p.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">
                        ₹{Number(p.price || 0).toLocaleString("en-IN")}
                      </span>
                      <button
                        onClick={() => navigate("/products")}
                        className="bg-indigo-500 px-4 py-2 rounded-lg text-white text-sm hover:bg-indigo-600 transition"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* dots */}
              <div className="mt-4 flex justify-center gap-2">
                {featuredTen.slice(0, 8).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => scrollToIndex(i)}
                    className={`h-2.5 rounded-full transition ${
                      activeIndex === i
                        ? "w-6 bg-indigo-400"
                        : "w-2.5 bg-white/30"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              {/* ✅ View All button BELOW slider (as you asked) */}
              <div className="mt-7 flex justify-center">
                <button
                  type="button"
                  onClick={() => navigate("/products")}
                  className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition"
                >
                  View All
                </button>
              </div>
            </>
          )}
        </section>

        <hr className="border-white/20 mb-10 m" />

        {/* ================= NEWSLETTER SECTION (ADDED) ================= */}
        <section className="mx-auto">
          <h3 className="text-4xl font-bold text-white text-center mb-10">
            <span className="relative inline-block">
              Newsletter
              {/* ✅ responsive underline width */}
              <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-24 sm:w-36 md:w-44 h-0.5 bg-indigo-400 rounded-full"></span>
            </span>
          </h3>

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0">
              {/* Put your newsletter bg image in /public and change this path */}
              <img
                src="/newsletter.jpg"
                alt="Newsletter Background"
                // ✅ FIX: full cover background on all screens
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/55" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050b2c]/70 via-[#0b1d4d]/30 to-[#1b3fa7]/20" />
            </div>

            <div className="relative p-6 sm:p-10 lg:p-14 flex flex-col items-center text-center">
              <p className="text-white/70 text-xs sm:text-sm mb-4">
                Subscribe now
              </p>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8">
                Stay informed with our newsletter.
              </h3>

              <div className="w-full max-w-xl flex flex-col sm:flex-row gap-3 pt-5 pb-10">
                <input
                  type="email"
                  placeholder="E-mail Address"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  className="px-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="h-16" />
      </div>
    </div>
  );
};

export default Home;
