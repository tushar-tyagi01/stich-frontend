import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useProject } from "../context/ProjectContext";
import API_URL from "../config/api";

const SIGNIN_KEY = "stitch_auth_mode";

const NEXT_STEPS = [
  {
    n: "1",
    title: "Answer a few questions",
    text: "Plain-language questions about your business — no design terms.",
  },
  {
    n: "2",
    title: "We draft your design",
    text: "Your answers become a styled one-page website, automatically.",
  },
  {
    n: "3",
    title: "Review and refine",
    text: "Request changes or approve it — your link stays yours to revisit.",
  },
];

const Authform = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { setUserId } = useProject();

  
  const [isSignIn, setIsSignIn] = useState(
    () => localStorage.getItem(SIGNIN_KEY) === "signin"
  );

  const [formData, setFormData] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  
  const toggleMode = () => {
    const next = !isSignIn;
    setIsSignIn(next);
    if (next) localStorage.setItem(SIGNIN_KEY, "signin");
    else localStorage.removeItem(SIGNIN_KEY);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!isSignIn && !formData.name.trim()) {
      setError("Name and email are required");
      return;
    }

    try {
      setLoading(true);

      // Sign-in sends email only; register sends both
      const payload = isSignIn
        ? { email: formData.email.trim() }
        : { name: formData.name.trim(), email: formData.email.trim() };

      const response = await axios.post(
        `${API_URL}/api/users/register`,
        payload
      );

      if (response.data.success) {
        const { userId } = response.data;
        setUserId(userId);

        localStorage.removeItem(SIGNIN_KEY); // clean up after success

        if (onSuccess) onSuccess(response.data);
        navigate("/form");
      }
    } catch (error) {
      console.error("Auth error:", error);
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#16223B] text-[#F5F3EC] font-[IBM_Plex_Sans,sans-serif] antialiased overflow-x-hidden">
      <style>{`
        .glow { position:absolute; border-radius:9999px; filter:blur(90px); opacity:.55; pointer-events:none; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
        .rise { opacity:0; animation:fadeUp .7s ease forwards; }
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
        .btn-primary { transition:transform .15s ease, box-shadow .15s ease; }
        .btn-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 26px rgba(232,163,61,.30); }
        .btn-primary:active:not(:disabled) { transform:translateY(0); }
        .field { transition:border-color .15s ease, background-color .15s ease; }
        .field:hover:not(:disabled) { border-color:#5E82AD; }
        .field:focus { border-color:#E8A33D; background-color:#1D2C4A; }
        @media (prefers-reduced-motion:reduce) {
          .rise { opacity:1 !important; animation:none !important; transform:none !important; }
          .floaty, .floaty-slow, .m-stroke, .m-rect, .m-rect2, .m-dash, .m-btn { animation:none !important; }
        }
      `}</style>

      <div className="glow w-[420px] h-[420px] bg-[#3D6EA5]/30 -top-24 -left-32" />
      <div className="glow w-[380px] h-[380px] bg-[#E8A33D]/20 top-40 -right-32" />

      <header className="relative z-10 max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 h-16">
        <button
          onClick={() => navigate("/")}
          className="font-[Fraunces,serif] text-xl font-semibold tracking-wide"
        >
          Stitch<span className="text-[#E8A33D]">.</span>
        </button>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-[#9AA6BC] hover:text-[#F5F3EC] transition-colors"
        >
          Back to home
        </button>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] items-center gap-12 lg:gap-24 px-5 sm:px-8 pt-8 sm:pt-12 lg:pt-20 pb-20">
        {/* ---------- LEFT: story content — single div, left-aligned to the header edge ---------- */}
        <div className="hidden lg:flex flex-col justify-center rise" aria-hidden="true">
          <div className="max-w-[480px]">
            <p className="text-[#E8A33D] text-sm font-semibold tracking-widest uppercase mb-3">
              What happens next
            </p>
            <h2 className="font-[Fraunces,serif] font-medium text-[clamp(1.8rem,3vw,2.3rem)] leading-[1.15] mb-10">
              A few answers in.
              <br />
              <span className="text-[#E8A33D]">A real design out.</span>
            </h2>

            <ol className="relative m-0 p-0 space-y-7 list-none">
              <span
                className="absolute left-5 top-4 bottom-4 w-px bg-[#2A3B5C]"
                aria-hidden="true"
              />
              {NEXT_STEPS.map((s) => (
                <li key={s.n} className="relative flex gap-4">
                  <span className="relative z-10 inline-flex shrink-0 items-center justify-center w-10 h-10 rounded-xl bg-[#E8A33D]/15 border border-[#E8A33D]/40 text-[#E8A33D] font-[Fraunces,serif] font-semibold">
                    {s.n}
                  </span>
                  <div className="pt-1">
                    <h3 className="font-[Fraunces,serif] font-medium text-lg leading-snug mb-1">
                      {s.title}
                    </h3>
                    <p className="text-[14px] leading-relaxed text-[#9AA6BC]">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* small floating mini-mockup — same morph motif as the landing hero */}
            <div className="floaty-slow mt-12 w-full max-w-[300px]">
              <svg viewBox="0 0 300 180" className="w-full h-auto drop-shadow-[0_20px_45px_rgba(0,0,0,.45)]">
                {/* window */}
                <rect x="4" y="4" width="292" height="172" rx="10" fill="#1D2C4A" stroke="#2A3B5C" />
                <circle cx="22" cy="20" r="3.5" fill="#3D6EA5" />
                <circle cx="34" cy="20" r="3.5" fill="#5E82AD" />
                <circle cx="46" cy="20" r="3.5" fill="#E8A33D" />

                {/* morphing wireframe -> design */}
                <rect className="m-stroke" x="24" y="40" width="120" height="14" fill="none" stroke="#3D6EA5" strokeWidth="1.5" />
                <rect className="m-rect" x="24" y="66" width="40" height="40" fill="none" stroke="#3D6EA5" strokeWidth="1.5" style={{ animationDelay: ".15s" }} />
                <rect className="m-rect2" x="72" y="66" width="40" height="40" fill="none" stroke="#3D6EA5" strokeWidth="1.5" style={{ animationDelay: ".3s" }} />
                <line className="m-dash" x1="24" y1="122" x2="144" y2="122" stroke="#3D6EA5" strokeWidth="1" style={{ animationDelay: ".2s" }} />
                <line className="m-dash" x1="24" y1="136" x2="118" y2="136" stroke="#3D6EA5" strokeWidth="1" style={{ animationDelay: ".35s" }} />
                <rect className="m-btn" x="24" y="150" width="62" height="16" fill="none" stroke="#3D6EA5" strokeWidth="1.5" style={{ animationDelay: ".45s" }} />

                {/* right: resolved side */}
                <rect x="164" y="40" width="112" height="14" fill="#E8A33D" rx="2" />
                <rect x="164" y="66" width="40" height="40" fill="#3D6EA5" rx="2" />
                <rect x="212" y="66" width="40" height="40" fill="#5E82AD" rx="2" />
                <rect x="164" y="122" width="100" height="5" fill="#9AA6BC" rx="1" />
                <rect x="164" y="134" width="76" height="5" fill="#9AA6BC" rx="1" />
                <rect x="164" y="150" width="62" height="16" fill="#E8A33D" rx="3" />
              </svg>
            </div>
          </div>
        </div>

        {/* ---------- RIGHT: the form — fixed 420px column, right edge aligned with header ---------- */}
        <div className="rise w-full max-w-[420px] mx-auto lg:max-w-none lg:mx-0" style={{ animationDelay: ".1s" }}>
          <span className="inline-flex items-center gap-2 border border-[#2A3B5C] rounded-full px-4 py-1.5 text-[13px] text-[#9AA6BC] mb-6 bg-[#1D2C4A]/60">
            <span className="w-2 h-2 rounded-full bg-[#E8A33D] animate-pulse" />
            Takes about a minute
          </span>

          <h1 className="font-[Fraunces,serif] font-medium text-[clamp(1.9rem,4vw,2.6rem)] leading-[1.1] tracking-[-0.01em] mb-3">
            {isSignIn ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-[15px] leading-relaxed text-[#9AA6BC] mb-8 max-w-[40ch]">
            {isSignIn
              ? "Enter the same email you registered with — we'll pull up your project."
              : "Just your name and email — we'll use this to save your progress and send back your design."}
          </p>

          <form onSubmit={handleSubmit}>
            {/* name field: register mode only */}
            {!isSignIn && (
              <div className="mb-5">
                <label htmlFor="name" className="block text-[13px] text-[#9AA6BC] mb-2">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  disabled={loading}
                  className="field w-full rounded-lg border border-[#2A3B5C] bg-[#1D2C4A]/60 px-4 py-3 text-[15px] text-[#F5F3EC] outline-none placeholder:text-[#5E6B85] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E8A33D] focus-visible:outline-offset-2"
                />
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="email" className="block text-[13px] text-[#9AA6BC] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={loading}
                className="field w-full rounded-lg border border-[#2A3B5C] bg-[#1D2C4A]/60 px-4 py-3 text-[15px] text-[#F5F3EC] outline-none placeholder:text-[#5E6B85] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E8A33D] focus-visible:outline-offset-2"
              />
            </div>

            {error && (
              <p className="mb-6 rounded-lg border border-[#E8A33D]/30 bg-[#E8A33D]/10 px-4 py-3 text-[13px] text-[#E8A33D]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full bg-[#E8A33D] text-[#16223B] font-semibold text-[15px] px-6 py-3.5 rounded-xl disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F5F3EC] focus-visible:outline-offset-2"
            >
              {loading
                ? isSignIn ? "Finding your project..." : "Setting things up..."
                : isSignIn ? "Continue →" : "Create your account →"}
            </button>
          </form>

          {/* mode toggle — keeps localStorage in sync */}
          <button
            type="button"
            onClick={toggleMode}
            className="mt-6 text-[13px] text-[#9AA6BC] hover:text-[#F5F3EC] underline underline-offset-4 decoration-[#2A3B5C] hover:decoration-[#E8A33D] transition-colors"
          >
            {isSignIn
              ? "New here? Create an account"
              : "Already have an account? Sign in"}
          </button>

          <p className="mt-4 text-[13px] text-[#9AA6BC]">
            No password needed — this link is how you'll get back to your design.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Authform;