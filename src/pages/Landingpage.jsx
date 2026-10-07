import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Authform from "../forms/Authform";

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const els = ref.current.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

const FAQS = [
  {
    q: "How long does it take?",
    a: "About a minute to create your account, then about 5 minutes to fill out the brief. Once submitted, your design draft generates automatically in the background.",
  },
  {
    q: "Do I need a password?",
    a: "No — just your name and email. That's what saves your progress and lets you find your project again.",
  },
  {
    q: "Do I need any design or technical skills?",
    a: "None at all. You answer plain-language questions; we handle layout, typography, colors, and structure.",
  },
  {
    q: "What if I don't like the first draft?",
    a: "Just request a change. You can iterate as many times as you need before approving the design.",
  },
  {
    q: "Will it work on mobile phones?",
    a: "Yes — every design is built responsive from the start, so it looks right on any screen size.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Create your account",
    text: "Just your name and email — no password. It's what lets you save your progress and find your project again.",
  },
  {
    n: "2",
    title: "Tell us about your business",
    text: "Answer a few plain-language questions about your business, the pages you need, and the look you're going for.",
  },
  {
    n: "3",
    title: "Get your design",
    text: "Your answers are turned into a real, styled website design automatically. Review it, request changes, or approve it — your link stays yours to revisit anytime.",
  },
];

const FEATURES = [
  {
    icon: "🎯",
    title: "Made for your niche",
    text: "Restaurants, salons, gyms, portfolios — the design adapts to your industry, not the other way around.",
  },
  {
    icon: "⚡",
    title: "Fast turnaround",
    text: "No waiting on agencies or freelancers — submit your brief and get a draft back automatically.",
  },
  {
    icon: "🔁",
    title: "Iterate freely",
    text: "Don't love the hero? Ask for a change and get a fresh take — refining is part of the process.",
  },
  {
    icon: "📱",
    title: "Responsive by default",
    text: "Every design looks right on phones, tablets, and desktops — no extra work needed.",
  },
  {
    icon: "🔗",
    title: "Shareable link",
    text: "Send your draft to partners, friends, or a developer with one link — it never expires.",
  },
  {
    icon: "🛡️",
    title: "Yours to keep",
    text: "Approve it, export it, or walk away — there's no lock-in.",
  },
];

const NICHES = [
  "Restaurant",
  "Portfolio",
  "Salon",
  "Gym",
  "Real Estate",
  "Bakery",
  "Clinic",
  "Agency",
  "Café",
  "Boutique",
];

export default function LandingPage() {
  const navigate = useNavigate();
  const rootRef = useReveal();
  const SIGNIN_KEY = "stitch_auth_mode";

  const goRegister = () => {
    localStorage.removeItem(SIGNIN_KEY);
    navigate("/auth");
  };

  const goSignIn = () => {
    localStorage.setItem(SIGNIN_KEY, "signin");
    navigate("/auth");
  };

  return (
    <div
      ref={rootRef}
      className="min-h-screen bg-[#16223B] text-[#F5F3EC] font-[IBM_Plex_Sans,sans-serif] antialiased overflow-x-hidden"
    >
      <style>{`
        .glow { position:absolute; border-radius:9999px; filter:blur(90px); opacity:.55; pointer-events:none; }
        .reveal { opacity:0; transform:translateY(26px); transition:opacity .7s ease, transform .7s ease; }
        .reveal.in { opacity:1; transform:none; }
        @keyframes morphStroke { 0%,40% { stroke:#3D6EA5; fill:transparent; } 60%,100% { stroke:#E8A33D; fill:#E8A33D; } }
        @keyframes morphRect   { 0%,40% { stroke:#3D6EA5; fill:none; } 60%,100% { stroke:#5E82AD; fill:#3D6EA5; } }
        @keyframes morphRect2  { 0%,40% { stroke:#3D6EA5; fill:none; } 60%,100% { stroke:#5E82AD; fill:#5E82AD; } }
        @keyframes morphDash   { 0%,40% { stroke:#3D6EA5; stroke-dasharray:3 4; } 60%,100% { stroke:#9AA6BC; stroke-dasharray:none; } }
        @keyframes morphBtn    { 0%,40% { stroke:#3D6EA5; fill:none; } 60%,100% { stroke:#E8A33D; fill:#E8A33D; } }
        .m-stroke { animation:morphStroke 4.5s ease-in-out infinite; }
        .m-rect   { animation:morphRect   4.5s ease-in-out infinite; }
        .m-rect2  { animation:morphRect2  4.5s ease-in-out infinite; }
        .m-dash   { animation:morphDash   4.5s ease-in-out infinite; }
        .m-btn    { animation:morphBtn    4.5s ease-in-out infinite; }
        @keyframes floaty { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        .floaty { animation:floaty 6s ease-in-out infinite; }
        .floaty-slow { animation:floaty 8s ease-in-out infinite; animation-delay:-3s; }
        .lift { transition:transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
        .lift:hover { transform:translateY(-5px); box-shadow:0 18px 40px -18px rgba(0,0,0,.55); border-color:#E8A33D66; }
        .btn-primary { transition:transform .15s ease, box-shadow .15s ease; }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 10px 26px rgba(232,163,61,.30); }
        .btn-primary:active { transform:translateY(0); }
        @keyframes marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        .marquee-track { display:flex; width:max-content; animation:marquee 28s linear infinite; }
        details summary::-webkit-details-marker { display:none; }
        details[open] .faq-icon { transform:rotate(45deg); }
        .faq-icon { transition:transform .2s ease; }
        @media (prefers-reduced-motion:reduce) {
          .reveal { opacity:1 !important; transform:none !important; transition:none !important; }
          .floaty, .floaty-slow, .m-stroke, .m-rect, .m-rect2, .m-dash, .m-btn, .marquee-track { animation:none !important; }
        }
      `}</style>

      <header className="fixed top-0 inset-x-0 z-50 border-b border-[#2A3B5C]/70 bg-[#16223B]/80 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 h-16">
          {/* group 1 — logo */}
          <a
            href="#"
            className="font-[Fraunces,serif] text-xl font-semibold tracking-wide shrink-0"
          >
            Stitch<span className="text-[#E8A33D]">.</span>
          </a>

          <div className="hidden md:flex items-center gap-8 text-sm text-[#9AA6BC]">
            <a href="#how" className="hover:text-[#F5F3EC] transition-colors">
              How it works
            </a>
            <a
              href="#features"
              className="hover:text-[#F5F3EC] transition-colors"
            >
              Features
            </a>
            <a href="#faq" className="hover:text-[#F5F3EC] transition-colors">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={goSignIn}
              className="text-sm text-[#9AA6BC] hover:text-[#F5F3EC] transition-colors px-3 py-2 rounded-lg"
            >
              Sign in
            </button>
            <button
              onClick={goRegister}
              className="btn-primary bg-[#E8A33D] text-[#16223B] font-semibold text-sm px-5 py-2.5 rounded-lg"
            >
              Register
            </button>
          </div>
        </nav>
      </header>

      {/* ======================= HERO ======================= */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24">
        <div className="glow w-[420px] h-[420px] bg-[#3D6EA5]/30 -top-24 -left-32" />
        <div className="glow w-[380px] h-[380px] bg-[#E8A33D]/20 top-40 -right-32" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-8 px-5 sm:px-8">
          {/* copy */}
          <div className="reveal">
            <span className="inline-flex items-center gap-2 border border-[#2A3B5C] rounded-full px-4 py-1.5 text-xs sm:text-[13px] text-[#9AA6BC] mb-6 bg-[#1D2C4A]/60">
              <span className="w-2 h-2 rounded-full bg-[#E8A33D] animate-pulse" />
              AI website designer — no skills required
            </span>

            <h1 className="font-[Fraunces,serif] font-medium text-[clamp(2.4rem,6vw,3.9rem)] leading-[1.06] tracking-[-0.01em] max-w-[13ch] mb-6">
              Describe your site.
              <br />
              <span className="text-[#E8A33D]">We draft the design.</span>
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-[#9AA6BC] max-w-[46ch] mb-8">
              Create a free account, answer a few questions about your business
              and what you need, and get a real website design back — styled,
              structured, and ready to refine.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <button
                onClick={goRegister}
                className="btn-primary bg-[#E8A33D] text-[#16223B] font-semibold text-base px-8 py-4 rounded-xl text-center
                           focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F5F3EC] focus-visible:outline-offset-2"
              >
                Start your design →
              </button>
              <a
                href="#how"
                className="text-center sm:text-left text-[#9AA6BC] hover:text-[#F5F3EC] transition-colors text-sm underline underline-offset-4 decoration-[#2A3B5C] hover:decoration-[#E8A33D]"
              >
                See how it works
              </a>
            </div>
            <p className="text-[13px] text-[#9AA6BC]">
              About a minute to sign up, five to describe your site
            </p>
          </div>

          {/* animated mockup */}
          <div
            className="relative flex justify-center reveal"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 480 520"
              className="w-full max-w-[380px] sm:max-w-[440px] h-auto floaty drop-shadow-[0_30px_60px_rgba(0,0,0,.45)]"
            >
              {/* window chrome */}
              <rect
                x="8"
                y="8"
                width="464"
                height="504"
                rx="14"
                fill="#1D2C4A"
                stroke="#2A3B5C"
              />
              <circle cx="30" cy="30" r="5" fill="#3D6EA5" />
              <circle cx="50" cy="30" r="5" fill="#5E82AD" />
              <circle cx="70" cy="30" r="5" fill="#E8A33D" />

              {/* left: wireframe */}
              <g opacity="0.85">
                <rect
                  className="m-stroke"
                  x="32"
                  y="56"
                  width="190"
                  height="424"
                  fill="none"
                  stroke="#3D6EA5"
                  strokeWidth="1.5"
                />
                <rect
                  className="m-stroke"
                  x="48"
                  y="74"
                  width="158"
                  height="26"
                  fill="none"
                  stroke="#3D6EA5"
                  strokeWidth="1.5"
                  style={{ animationDelay: ".1s" }}
                />
                <line
                  className="m-dash"
                  x1="48"
                  y1="124"
                  x2="206"
                  y2="124"
                  stroke="#3D6EA5"
                  strokeWidth="1"
                />
                <rect
                  className="m-rect"
                  x="48"
                  y="144"
                  width="72"
                  height="72"
                  fill="none"
                  stroke="#3D6EA5"
                  strokeWidth="1.5"
                  style={{ animationDelay: ".2s" }}
                />
                <rect
                  className="m-rect2"
                  x="132"
                  y="144"
                  width="72"
                  height="72"
                  fill="none"
                  stroke="#3D6EA5"
                  strokeWidth="1.5"
                  style={{ animationDelay: ".3s" }}
                />
                <line
                  className="m-dash"
                  x1="48"
                  y1="240"
                  x2="206"
                  y2="240"
                  stroke="#3D6EA5"
                  strokeWidth="1"
                  style={{ animationDelay: ".15s" }}
                />
                <line
                  className="m-dash"
                  x1="48"
                  y1="258"
                  x2="182"
                  y2="258"
                  stroke="#3D6EA5"
                  strokeWidth="1"
                  style={{ animationDelay: ".25s" }}
                />
                <line
                  className="m-dash"
                  x1="48"
                  y1="276"
                  x2="160"
                  y2="276"
                  stroke="#3D6EA5"
                  strokeWidth="1"
                  style={{ animationDelay: ".35s" }}
                />
                <rect
                  className="m-btn"
                  x="48"
                  y="306"
                  width="88"
                  height="26"
                  fill="none"
                  stroke="#3D6EA5"
                  strokeWidth="1.5"
                  style={{ animationDelay: ".4s" }}
                />
              </g>

              {/* divider */}
              <line
                x1="240"
                y1="56"
                x2="240"
                y2="480"
                stroke="#2A3B5C"
                strokeWidth="1"
                strokeDasharray="2 6"
              />

              {/* right: resolved */}
              <g>
                <rect
                  x="258"
                  y="56"
                  width="190"
                  height="424"
                  fill="#16223B"
                  stroke="#E8A33D"
                  strokeWidth="1.5"
                />
                <rect
                  x="274"
                  y="74"
                  width="158"
                  height="26"
                  fill="#E8A33D"
                  rx="2"
                />
                <rect
                  x="274"
                  y="144"
                  width="72"
                  height="72"
                  fill="#3D6EA5"
                  rx="2"
                />
                <rect
                  x="358"
                  y="144"
                  width="72"
                  height="72"
                  fill="#5E82AD"
                  rx="2"
                />
                <rect
                  x="274"
                  y="240"
                  width="158"
                  height="6"
                  fill="#9AA6BC"
                  rx="1"
                />
                <rect
                  x="274"
                  y="258"
                  width="130"
                  height="6"
                  fill="#9AA6BC"
                  rx="1"
                />
                <rect
                  x="274"
                  y="276"
                  width="110"
                  height="6"
                  fill="#9AA6BC"
                  rx="1"
                />
                <rect
                  x="274"
                  y="306"
                  width="88"
                  height="26"
                  fill="#E8A33D"
                  rx="3"
                />
              </g>
            </svg>
          </div>
        </div>
      </section>

      <section
        className="border-y border-[#2A3B5C] bg-[#1D2C4A]/50 py-5 overflow-hidden"
        aria-hidden="true"
      >
        <div className="marquee-track gap-10 text-sm text-[#9AA6BC]">
          {[0, 1].map((copy) => (
            <span key={copy} className="flex gap-10 shrink-0">
              {NICHES.map((n) => (
                <span key={n} className="flex gap-10 shrink-0">
                  <span>{n}</span>
                  <span className="text-[#E8A33D]">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </section>

      <section id="how" className="px-5 sm:px-8 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="reveal max-w-2xl mb-12 sm:mb-16">
            <p className="text-[#E8A33D] text-sm font-semibold tracking-widest uppercase mb-3">
              How it works
            </p>
            <h2 className="font-[Fraunces,serif] text-3xl sm:text-5xl font-medium leading-tight">
              From a blank page to a real design in three steps
            </h2>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 list-none p-0">
            {STEPS.map((s, i) => (
              <li
                key={s.n}
                className={`reveal lift bg-[#1D2C4A] border border-[#2A3B5C] rounded-2xl p-7 ${i === 2 ? "sm:col-span-2 lg:col-span-1" : ""}`}
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#E8A33D]/15 text-[#E8A33D] font-[Fraunces,serif] font-semibold mb-5">
                  {s.n}
                </span>
                <h3 className="font-[Fraunces,serif] font-medium text-xl mb-2">
                  {s.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-[#9AA6BC]">
                  {s.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="features"
        className="px-5 sm:px-8 py-16 sm:py-24 border-t border-[#2A3B5C] bg-[#1D2C4A]/30"
      >
        <div className="max-w-7xl mx-auto">
          <div className="reveal max-w-2xl mb-12 sm:mb-16">
            <p className="text-[#E8A33D] text-sm font-semibold tracking-widest uppercase mb-3">
              Why Stitch
            </p>
            <h2 className="font-[Fraunces,serif] text-3xl sm:text-5xl font-medium leading-tight">
              Built for people who'd rather run their business than learn design
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="reveal lift bg-[#16223B] border border-[#2A3B5C] rounded-2xl p-7"
                style={{ transitionDelay: `${(i % 3) * 0.06}s` }}
              >
                <div className="text-2xl mb-4">{f.icon}</div>
                <h3 className="font-[Fraunces,serif] font-medium text-lg mb-2">
                  {f.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-[#9AA6BC]">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="px-5 sm:px-8 py-16 sm:py-24 border-t border-[#2A3B5C] bg-[#1D2C4A]/30"
      >
        <div className="max-w-3xl mx-auto">
          <div className="reveal mb-10">
            <p className="text-[#E8A33D] text-sm font-semibold tracking-widest uppercase mb-3">
              FAQ
            </p>
            <h2 className="font-[Fraunces,serif] text-3xl sm:text-4xl font-medium">
              Questions, answered
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="reveal group bg-[#16223B] border border-[#2A3B5C] rounded-xl px-6 py-5 open:border-[#E8A33D]/50"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none font-medium">
                  {f.q}
                  <span className="faq-icon text-[#E8A33D] text-xl ml-4 shrink-0">
                    +
                  </span>
                </summary>
                <p className="text-[#9AA6BC] text-[15px] leading-relaxed mt-3">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-5 sm:px-8 py-20 sm:py-28 overflow-hidden">
        <div className="glow w-[500px] h-[300px] bg-[#E8A33D]/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="relative max-w-3xl mx-auto text-center reveal">
          <h2 className="font-[Fraunces,serif] text-3xl sm:text-5xl font-medium leading-tight mb-5">
            Your website design starts with a quick sign-up.
          </h2>
          <p className="text-[#9AA6BC] text-base sm:text-lg mb-9 max-w-[44ch] mx-auto">
            Describe your business once — get a design you'll actually want to
            show people.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="btn-primary inline-block bg-[#E8A33D] text-[#16223B] font-semibold text-base px-10 py-4 rounded-xl
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F5F3EC] focus-visible:outline-offset-2"
          >
            Register →
          </button>
          <p
            onClick={goSignIn}
            className="mt-4 text-[13px] text-[#9AA6BC] cursor-pointer"
          >
            Already have an account?
          </p>
        </div>
      </section>

      <footer className="border-t border-[#2A3B5C] px-5 sm:px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-[#9AA6BC]">
          <span className="font-[Fraunces,serif] text-base text-[#F5F3EC]">
            Stitch<span className="text-[#E8A33D]">.</span>
          </span>
          <div className="flex gap-6">
            <a href="#how" className="hover:text-[#F5F3EC] transition-colors">
              How it works
            </a>
            <a href="#faq" className="hover:text-[#F5F3EC] transition-colors">
              FAQ
            </a>
            <a
              href="mailto:hello@example.com"
              className="hover:text-[#F5F3EC] transition-colors"
            >
              hello@example.com
            </a>
          </div>
          <span>© 2026 Stitch. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
