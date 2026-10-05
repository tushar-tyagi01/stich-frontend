import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useProject } from "../context/ProjectContext";
import API_URL from "../config/api";

const BRIEF_STORAGE_KEY = "stitch:briefData";

const fieldCls =
  "w-full bg-[#1D2C4A] border border-[#2A3B5C] rounded-xl px-4 py-3.5 text-[15px] text-[#F5F3EC] placeholder-[#9AA6BC]/70 " +
  "focus:outline-none focus:border-[#E8A33D] focus:ring-2 focus:ring-[#E8A33D]/20 transition-all duration-150";

function ErrorMsg({ children }) {
  if (!children) return null;

  return (
    <p
      className="flex items-center gap-1.5 text-[#E8A33D] text-xs mt-2"
      role="alert"
    >
      <svg
        viewBox="0 0 12 12"
        className="w-3 h-3 shrink-0"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M6 0a6 6 0 1 0 0 12A6 6 0 0 0 6 0Zm0 8.2A.9.9 0 1 1 6 6.4a.9.9 0 0 1 0 1.8ZM5.1 3.2 5.3 5h1.4l.2-1.8L6 2.4l-.9.8Z" />
      </svg>

      {children}
    </p>
  );
}

function OptionalBadge() {
  return (
    <span className="text-[11px] font-normal text-[#9AA6BC] border border-[#2A3B5C] rounded-full px-2 py-0.5">
      Optional
    </span>
  );
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+]?[\d\s-]{7,20}$/;

export default function ContactForm() {
  const navigate = useNavigate();
  const { projectId } = useProject();

  const [briefData, setBriefData] = useState(null);
  const [briefMissing, setBriefMissing] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(BRIEF_STORAGE_KEY);

    if (!stored) {
      setBriefMissing(true);
      return;
    }

    try {
      setBriefData(JSON.parse(stored));
    } catch {
      setBriefMissing(true);
    }
  }, []);

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    businessEmail: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const newErrors = {};

    if (formData.phone.trim() && !phonePattern.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid mobile number";
    }

    if (
      formData.businessEmail.trim() &&
      !emailPattern.test(formData.businessEmail.trim())
    ) {
      newErrors.businessEmail = "Enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (briefMissing || !briefData) {
      setSubmitError(
        "We couldn't find your business details — please go back and fill in step 1 first."
      );
      return;
    }

    if (!validate()) return;

    try {
      setSubmitting(true);

      
      const contact = {
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        businessEmail: formData.businessEmail.trim() || undefined,
      };

      await axios.post(`${API_URL}/api/projects/${projectId}/input`, {
        ...briefData,
        contact,
      });

      sessionStorage.removeItem(BRIEF_STORAGE_KEY);

      navigate(`/processing/${projectId}`);
    } catch (error) {
      console.error("Contact submission error:", error);

      setSubmitError(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#16223B] text-[#F5F3EC] font-[IBM_Plex_Sans,sans-serif] antialiased overflow-x-hidden">
      <style>{`
        .glow {
          position: absolute;
          border-radius: 9999px;
          filter: blur(90px);
          opacity: .55;
          pointer-events: none;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: none; }
        }

        .rise {
          opacity: 0;
          animation: fadeUp .7s ease forwards;
        }

        .btn-primary {
          transition: transform .15s ease, box-shadow .15s ease;
        }

        @media (prefers-reduced-motion: reduce) {
          .rise {
            opacity: 1 !important;
            animation: none !important;
            transform: none !important;
          }
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

        <span className="text-sm text-[#9AA6BC]">
          Your progress is saved automatically
        </span>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-20">

        <div className="rise mb-8 sm:mb-10">
          <span className="inline-flex items-center gap-2 border border-[#2A3B5C] rounded-full px-4 py-1.5 text-[13px] text-[#9AA6BC] mb-6 bg-[#1D2C4A]/60">
            <span className="w-2 h-2 rounded-full bg-[#E8A33D] animate-pulse" />
            Step 2 of 2 · Contact information
          </span>

          <h1 className="font-[Fraunces,serif] font-medium text-[clamp(1.9rem,4vw,2.6rem)] leading-[1.1] tracking-[-0.01em] mb-3">
            How should customers reach you?
          </h1>

          <p className="text-[15px] leading-relaxed text-[#9AA6BC] max-w-[50ch]">
            Share any of these and we'll show them on your website. You can
            skip everything you'd rather not display.
          </p>
        </div>


        {briefMissing && (
          <p className="rise mb-6 rounded-lg border border-[#E8A33D]/30 bg-[#E8A33D]/10 px-4 py-3 text-[13px] text-[#E8A33D]">
            We couldn't find your business details for this session. Please{" "}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="underline underline-offset-2 font-semibold"
            >
              go back to step 1
            </button>{" "}
            before continuing.
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rise bg-[#1D2C4A]/60 border border-[#2A3B5C] rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm space-y-6 sm:space-y-7"
          style={{ animationDelay: ".1s" }}
        >

          <div>
            <label
              htmlFor="phone"
              className="flex flex-wrap items-center gap-2 text-sm font-medium mb-2"
            >
              Mobile number
              <OptionalBadge />
            </label>

            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+91 98765 43210"
              disabled={submitting}
              className={fieldCls}
            />

            <ErrorMsg>{errors.phone}</ErrorMsg>
          </div>


          <div>
            <label
              htmlFor="address"
              className="flex flex-wrap items-center gap-2 text-sm font-medium mb-2"
            >
              Business address
              <OptionalBadge />
            </label>

            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              rows={2}
              disabled={submitting}
              className={`${fieldCls} resize-none`}
              placeholder="123 Main Road, Meerut, Uttar Pradesh"
            />
          </div>


          <div>
            <label
              htmlFor="businessEmail"
              className="flex flex-wrap items-center gap-2 text-sm font-medium mb-2"
            >
              Email
              <OptionalBadge />
            </label>

            <input
              id="businessEmail"
              type="email"
              value={formData.businessEmail}
              onChange={(e) => updateField("businessEmail", e.target.value)}
              placeholder="hello@smiledental.com"
              disabled={submitting}
              className={fieldCls}
            />

            <ErrorMsg>{errors.businessEmail}</ErrorMsg>
          </div>


          <div className="rounded-xl border border-[#2A3B5C] bg-[#16223B]/50 px-4 py-3">
            <p className="text-[13px] leading-relaxed text-[#9AA6BC]">
              We'll only display the contact information you provide. Missing
              information won't be invented or added to your website.
            </p>
          </div>


          {submitError && (
            <p className="rounded-lg border border-[#E8A33D]/30 bg-[#E8A33D]/10 px-4 py-3 text-[13px] text-[#E8A33D]">
              {submitError}
            </p>
          )}


          <div className="pt-3 border-t border-[#2A3B5C]/60">
            <button
              type="submit"
              disabled={submitting || briefMissing}
              className="
                w-full sm:w-auto
                btn-primary
                bg-[#E8A33D]
                text-[#16223B]
                font-semibold
                px-8 sm:px-10
                py-3.5
                rounded-xl
                hover:not-disabled:-translate-y-0.5
                hover:not-disabled:shadow-[0_10px_26px_rgba(232,163,61,0.30)]
                active:not-disabled:translate-y-0
                disabled:opacity-60
                disabled:cursor-not-allowed
                focus-visible:outline
                focus-visible:outline-2
                focus-visible:outline-[#F5F3EC]
                focus-visible:outline-offset-2
              "
            >
              {submitting
                ? "Generating your design..."
                : "Generate my design →"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
