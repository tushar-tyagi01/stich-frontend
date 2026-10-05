import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useProject } from "../context/ProjectContext";
import API_URL from "../config/api";
import IndustryFields from "../components/Industryfield";

export const BRIEF_STORAGE_KEY = "stitch:briefData";

// Keep in sync with the UserInput model limits.
const BUSINESS_NAME_MIN = 2;
const BUSINESS_NAME_MAX = 100;
const DESCRIPTION_MAX = 1000;
const FIELD_TEXT_MAX = 1000;
const FIELD_LIST_MAX = 20;

const INDUSTRIES = [
  {
    id: "service-booking",
    icon: "✂️",
    label: "Service & booking (salons, gyms, consultants)",
  },
  { id: "ecommerce", icon: "🛍️", label: "Ecommerce / online store" },
  {
    id: "restaurant-hospitality",
    icon: "🍽️",
    label: "Restaurant & hospitality",
  },
  { id: "saas-software", icon: "💻", label: "SaaS / software product" },
  { id: "portfolio-creative", icon: "🎨", label: "Portfolio / creative work" },
  { id: "local-retail", icon: "🏪", label: "Local retail shop" },
  {
    id: "professional-services",
    icon: "💼",
    label: "Professional services (legal, finance, agencies)",
  },
  { id: "nonprofit-community", icon: "🤝", label: "Nonprofit / community" },
  { id: "education-learning", icon: "🎓", label: "Education & learning" },
  { id: "events-conferences", icon: "🎪", label: "Events & conferences" },
  { id: "real-estate-property", icon: "🏡", label: "Real estate / property" },
  { id: "directory-marketplace", icon: "🗂️", label: "Directory / marketplace" },
  {
    id: "content-media-publication",
    icon: "📰",
    label: "Content, media & publications",
  },
  {
    id: "membership-community",
    icon: "👥",
    label: "Membership / community platform",
  },
  {
    id: "documentation-developer",
    icon: "📚",
    label: "Documentation / developer tools",
  },
  { id: "healthcare-medical", icon: "🩺", label: "Healthcare / medical" },
  { id: "fitness-wellness", icon: "🧘", label: "Fitness / wellness" },
  { id: "app-landing", icon: "📱", label: "Mobile app landing page" },
  {
    id: "personal-brand-coach",
    icon: "🎤",
    label: "Personal brand / coach / speaker",
  },
  { id: "travel-tourism", icon: "✈️", label: "Travel / tourism" },
  { id: "automotive", icon: "🚗", label: "Automotive" },
  { id: "wedding-event-venue", icon: "💍", label: "Wedding / event venue" },
];

const VIBES = [
  { id: "modern-minimal", icon: "◻️", label: "Modern & minimal" },
  { id: "warm-friendly", icon: "🧡", label: "Warm & friendly" },
  { id: "bold-playful", icon: "🎈", label: "Bold & playful" },
  { id: "elegant-luxury", icon: "💎", label: "Elegant & luxury" },
  {
    id: "corporate-professional",
    icon: "🏢",
    label: "Corporate & professional",
  },
];

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

function Dropdown({
  id,
  label,
  required,
  options,
  value,
  onChange,
  error,
  disabled,
  placeholder = "Select an option",
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const rootRef = useRef(null);
  const listRef = useRef(null);

  const selected = options.find((o) => o.id === value) ?? null;
  const selectedIndex = options.findIndex((o) => o.id === value);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (open && activeIndex >= 0) {
      listRef.current?.children[activeIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [activeIndex, open]);

  const openList = () => {
    setOpen(true);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  };

  const commit = (index) => {
    const option = options[index];

    if (option) {
      onChange(option.id);
    }

    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        open ? commit(activeIndex) : openList();
        break;

      case "Escape":
        if (open) {
          e.stopPropagation();
          setOpen(false);
        }
        break;

      case "ArrowDown":
        e.preventDefault();

        if (!open) {
          openList();
        } else {
          setActiveIndex((i) => Math.min(options.length - 1, i + 1));
        }

        break;

      case "ArrowUp":
        e.preventDefault();

        if (!open) {
          openList();
        } else {
          setActiveIndex((i) => Math.max(0, i - 1));
        }

        break;

      case "Home":
        if (open) {
          e.preventDefault();
          setActiveIndex(0);
        }
        break;

      case "End":
        if (open) {
          e.preventDefault();
          setActiveIndex(options.length - 1);
        }
        break;

      case "Tab":
        setOpen(false);
        break;

      default:
        break;
    }
  };

  return (
    <div ref={rootRef}>
      <label htmlFor={id} className="block text-sm font-medium mb-2">
        {label} {required && <span className="text-[#E8A33D]">*</span>}
      </label>

      <div className="relative">
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-activedescendant={
            open && activeIndex >= 0
              ? `${id}-opt-${options[activeIndex].id}`
              : undefined
          }
          onClick={() => (open ? setOpen(false) : openList())}
          onKeyDown={handleKeyDown}
          className={`${fieldCls} flex items-center justify-between gap-3 text-left cursor-pointer ${
            error ? "border-[#E8A33D]" : ""
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <span
            className={`flex items-center gap-2.5 min-w-0 ${
              selected ? "text-[#F5F3EC]" : "text-[#9AA6BC]/70"
            }`}
          >
            {selected?.icon && (
              <span aria-hidden="true" className="shrink-0">
                {selected.icon}
              </span>
            )}

            <span className="truncate">
              {selected ? selected.label : placeholder}
            </span>
          </span>

          <svg
            viewBox="0 0 16 16"
            className={`w-4 h-4 shrink-0 text-[#9AA6BC] transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path
              d="M4 6l4 4 4-4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open && (
          <ul
            ref={listRef}
            role="listbox"
            aria-labelledby={id}
            tabIndex={-1}
            className="dd-scroll pop absolute z-30 mt-2 w-full max-h-72 overflow-y-auto bg-[#1D2C4A] border border-[#2A3B5C] rounded-xl py-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
          >
            {options.map((option, index) => {
              const isSelected = option.id === value;
              const isHighlighted = index === activeIndex;

              return (
                <li
                  key={option.id}
                  id={`${id}-opt-${option.id}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commit(index)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 text-[14px] cursor-pointer transition-colors duration-100 ${
                    isSelected
                      ? "text-[#E8A33D] font-semibold"
                      : isHighlighted
                        ? "bg-[#24365A] text-[#F5F3EC]"
                        : "text-[#F5F3EC]"
                  }`}
                >
                  {option.icon && (
                    <span
                      aria-hidden="true"
                      className="w-5 text-center shrink-0"
                    >
                      {option.icon}
                    </span>
                  )}

                  <span className="min-w-0">{option.label}</span>

                  {isSelected && (
                    <svg
                      viewBox="0 0 16 16"
                      className="w-4 h-4 ml-auto shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 8.5l3.2 3L13 4.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ErrorMsg>{error}</ErrorMsg>
    </div>
  );
}

/**
 * Industry field helpers.
 * Supports text, textarea, select and list (array) values.
 * Values are trimmed and capped to the backend validator limits so the
 * user never hits a 400 on the next step.
 */
function hasFieldValue(value) {
  if (Array.isArray(value)) {
    return value.some((item) => String(item ?? "").trim());
  }

  if (typeof value === "string") {
    return Boolean(value.trim());
  }

  if (value === null || value === undefined) {
    return false;
  }

  return true;
}

function cleanValue(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").trim().slice(0, FIELD_TEXT_MAX))
      .filter(Boolean)
      .slice(0, FIELD_LIST_MAX);
  }

  if (typeof value === "string") {
    return value.trim().slice(0, FIELD_TEXT_MAX);
  }

  return value;
}

function getFilledIndustryFields(fields) {
  return Object.fromEntries(
    Object.entries(fields)
      .map(([key, value]) => [key, cleanValue(value)])
      .filter(([, value]) => hasFieldValue(value))
  );
}

export default function BriefForm() {
  const navigate = useNavigate();
  const logoInputRef = useRef(null);

  // Tracks the most recently selected industry so slow responses for an
  // earlier selection can be ignored.
  const latestIndustryRef = useRef("");

  const { userId, projectId, setProjectId } = useProject();

  const [formData, setFormData] = useState({
    businessName: "",
    industryId: "",
    vibe: "",
    description: "",
    primaryColor: "",
    industryFields: {},
  });

  const [industryFieldsSchema, setIndustryFieldsSchema] = useState([]);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  
  const updateIndustry = async (industryId) => {
    latestIndustryRef.current = industryId;

    setSubmitError("");

    setFormData((prev) => ({
      ...prev,
      industryId,
      industryFields: {},
    }));

    setErrors((prev) => ({
      ...prev,
      industryId: undefined,
    }));

    setIndustryFieldsSchema([]);

    if (!industryId) {
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/archetypes/inputschema/${industryId}`
      );

      if (latestIndustryRef.current !== industryId) return;

      setIndustryFieldsSchema(response.data?.data?.inputSchema || []);
    } catch (error) {
      if (latestIndustryRef.current !== industryId) return;

      console.error("Failed to fetch industry fields:", error);

      setIndustryFieldsSchema([]);

      setSubmitError(
        error.response?.data?.message ||
          "Failed to load industry fields. Please try again."
      );
    }
  };

  const updateIndustryField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      industryFields: {
        ...prev.industryFields,
        [key]: value,
      },
    }));

    setErrors((prev) => ({
      ...prev,
      [`industryFields.${key}`]: undefined,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0] || null;

    setLogoFile(file);

    setLogoPreview((previousPreview) => {
      if (previousPreview) {
        URL.revokeObjectURL(previousPreview);
      }

      return file ? URL.createObjectURL(file) : null;
    });
  };

  const clearLogo = () => {
    setLogoFile(null);

    setLogoPreview((previousPreview) => {
      if (previousPreview) {
        URL.revokeObjectURL(previousPreview);
      }

      return null;
    });

    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const validate = () => {
    const newErrors = {};

    const name = formData.businessName.trim();

    if (!name) {
      newErrors.businessName = "Required";
    } else if (name.length < BUSINESS_NAME_MIN) {
      newErrors.businessName = `Enter at least ${BUSINESS_NAME_MIN} characters`;
    }

    if (!formData.industryId) {
      newErrors.industryId = "Required";
    }

    if (!formData.vibe) {
      newErrors.vibe = "Required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitError("");

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);

      let currentProjectId = projectId;

      // Create the project only if one does not already exist.
      if (!currentProjectId) {
        const projectRes = await axios.post(`${API_URL}/api/projects/create`, {
          userId,
        });

        currentProjectId = projectRes.data.projectId;

        setProjectId(currentProjectId);
      }

      // Upload the logo if the user selected one.
      let logoUrl;

      if (logoFile) {
        const logoForm = new FormData();

        logoForm.append("logo", logoFile);

        const uploadRes = await axios.post(
          `${API_URL}/api/uploads/logo`,
          logoForm,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        logoUrl = uploadRes.data.url;
      }

      // Trim, cap, and drop empty industry-specific fields.
      const filledIndustryFields = getFilledIndustryFields(
        formData.industryFields
      );

      // Save the brief locally for the contact step.
      sessionStorage.setItem(
        BRIEF_STORAGE_KEY,
        JSON.stringify({
          businessName: formData.businessName.trim(),

          industryId: formData.industryId,

          vibe: formData.vibe,

          description: formData.description.trim() || undefined,

          primaryColor: formData.primaryColor || undefined,

          logoUrl,

          industryFields:
            Object.keys(filledIndustryFields).length > 0
              ? filledIndustryFields
              : undefined,
        })
      );

      navigate("/contact");
    } catch (error) {
      console.error("Brief submission error:", error);

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

        @keyframes ddPop {
          from { opacity: 0; transform: translateY(-4px) scale(.98); }
          to { opacity: 1; transform: none; }
        }

        .pop {
          animation: ddPop .16s ease forwards;
          transform-origin: top center;
        }

        .dd-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .dd-scroll::-webkit-scrollbar-thumb {
          background: #2A3B5C;
          border-radius: 8px;
        }

        .dd-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          .rise {
            opacity: 1 !important;
            animation: none !important;
            transform: none !important;
          }

          .pop {
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
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-20">
        <div className="rise mb-8 sm:mb-10">
          <span className="inline-flex items-center gap-2 border border-[#2A3B5C] rounded-full px-4 py-1.5 text-[13px] text-[#9AA6BC] mb-6 bg-[#1D2C4A]/60">
            <span className="w-2 h-2 rounded-full bg-[#E8A33D] animate-pulse" />
            Step 1 of 2 · Design brief
          </span>

          <h1 className="font-[Fraunces,serif] font-medium text-[clamp(1.9rem,4vw,2.6rem)] leading-[1.1] tracking-[-0.01em] mb-3">
            Tell us about your business.
          </h1>

          <p className="text-[15px] leading-relaxed text-[#9AA6BC] max-w-[50ch]">
            These details shape your layout, colors, and content — the more
            specific, the better your first draft.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rise bg-[#1D2C4A]/60 border border-[#2A3B5C] rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm space-y-6 sm:space-y-7"
          style={{ animationDelay: ".1s" }}
        >
          {/* Business name */}
          <div>
            <label
              htmlFor="businessName"
              className="block text-sm font-medium mb-2"
            >
              Business name <span className="text-[#E8A33D]">*</span>
            </label>

            <input
              id="businessName"
              type="text"
              value={formData.businessName}
              onChange={(e) => updateField("businessName", e.target.value)}
              placeholder="e.g. Maple & Co."
              maxLength={BUSINESS_NAME_MAX}
              disabled={submitting}
              className={fieldCls}
            />

            <ErrorMsg>{errors.businessName}</ErrorMsg>
          </div>

          {/* Industry */}
          <Dropdown
            id="industryId"
            label="Business type"
            required
            placeholder="Select the closest match"
            options={INDUSTRIES}
            value={formData.industryId}
            onChange={updateIndustry}
            error={errors.industryId}
            disabled={submitting}
          />

          {/* Dynamic industry-specific fields */}
          <IndustryFields
            fields={industryFieldsSchema}
            values={formData.industryFields}
            onChange={updateIndustryField}
            disabled={submitting}
          />

          {/* Website vibe */}
          <Dropdown
            id="vibe"
            label="Website type"
            required
            placeholder="Pick a direction"
            options={VIBES}
            value={formData.vibe}
            onChange={(value) => updateField("vibe", value)}
            error={errors.vibe}
            disabled={submitting}
          />

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="flex flex-wrap items-center gap-2 text-sm font-medium mb-2"
            >
              Tell us about your business
              <OptionalBadge />
            </label>

            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={4}
              maxLength={DESCRIPTION_MAX}
              disabled={submitting}
              className={`${fieldCls} resize-none`}
              placeholder="What you do, who it's for, anything that helps us get the tone right..."
            />
          </div>

          {/* Primary color + Logo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Primary color */}
            <div>
              <label
                htmlFor="primaryColor"
                className="flex flex-wrap items-center gap-2 text-sm font-medium mb-2"
              >
                Primary color
                <OptionalBadge />
              </label>

              <div className="flex items-center gap-3 bg-[#1D2C4A] border border-[#2A3B5C] rounded-xl px-4 py-2.5">
                <input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor || "#e8a33d"}
                  onChange={(e) => updateField("primaryColor", e.target.value)}
                  disabled={submitting}
                  className="h-8 w-8 shrink-0 rounded-md border border-[#2A3B5C] bg-transparent p-0"
                />

                <span className="text-[15px] text-[#9AA6BC]">
                  {formData.primaryColor || "No preference — we'll pick one"}
                </span>

                {formData.primaryColor && (
                  <button
                    type="button"
                    onClick={() => updateField("primaryColor", "")}
                    className="ml-auto text-xs text-[#9AA6BC] hover:text-[#F5F3EC] transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Logo */}
            <div>
              <label
                htmlFor="logo"
                className="flex flex-wrap items-center gap-2 text-sm font-medium mb-2"
              >
                Logo
                <OptionalBadge />
              </label>

              <div className="flex items-center gap-3 bg-[#1D2C4A] border border-[#2A3B5C] rounded-xl px-4 py-2.5">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-md object-cover border border-[#2A3B5C]"
                  />
                ) : (
                  <div className="h-8 w-8 shrink-0 rounded-md border border-dashed border-[#2A3B5C]" />
                )}

                <span className="text-[15px] text-[#9AA6BC] truncate">
                  {logoFile ? logoFile.name : "No file selected"}
                </span>

                <label
                  htmlFor="logo"
                  className="ml-auto text-xs font-semibold text-[#E8A33D] hover:text-[#F5B95C] transition-colors cursor-pointer"
                >
                  {logoFile ? "Change" : "Upload"}
                </label>

                <input
                  id="logo"
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  disabled={submitting}
                  className="hidden"
                />

                {logoFile && (
                  <button
                    type="button"
                    onClick={clearLogo}
                    className="text-xs text-[#9AA6BC] hover:text-[#F5F3EC] transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Submit error */}
          {submitError && (
            <p className="rounded-lg border border-[#E8A33D]/30 bg-[#E8A33D]/10 px-4 py-3 text-[13px] text-[#E8A33D]">
              {submitError}
            </p>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-[#2A3B5C]/60">
            <button
              type="submit"
              disabled={submitting}
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
              {submitting ? "Next ...." : "Next →"}
            </button>
          </div>
        </form>

        <p
          className="rise mt-6 text-[13px] text-[#9AA6BC]"
          style={{ animationDelay: ".2s" }}
        >
          You can request changes to your draft once it's ready — nothing here
          is final.
        </p>
      </main>
    </div>
  );
}
