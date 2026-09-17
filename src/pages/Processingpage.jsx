import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import API_URL from "../config/api";

// Maps your Project.status enum to the 3 stages shown to the user.
// input_submitted/brief_generating -> reading the brief
// brief_ready/generating           -> designing pages
// completed                        -> done, redirect to results
const STAGES = [
  {
    key: "brief",
    label: "Reading your brief",
    detail: "Matching your business to an industry pattern and tone.",
    statuses: ["started", "input_submitted", "brief_generating"],
  },
  {
    key: "design",
    label: "Designing your pages",
    detail: "Building layout, color, and type decisions for each page.",
    statuses: ["brief_ready", "generating"],
  },
  {
    key: "done",
    label: "Finishing touches",
    detail: "Putting the final draft together.",
    statuses: ["completed"],
  },
];

const FAILED_STATUSES = ["brief_failed", "failed"];
const POLL_INTERVAL_MS = 3000;

function currentStageIndex(status) {
  const idx = STAGES.findIndex((stage) => stage.statuses.includes(status));
  return idx === -1 ? 0 : idx;
}

function StageRow({ stage, state }) {
  // state: "done" | "active" | "pending"
  return (
    <li className="flex items-start gap-4">
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
          state === "done"
            ? "bg-[#E8A33D] border-[#E8A33D] text-[#16223B]"
            : state === "active"
            ? "border-[#E8A33D] text-[#E8A33D]"
            : "border-[#2A3B5C] text-[#5E6B85]"
        }`}
      >
        {state === "done" ? (
          "✓"
        ) : state === "active" ? (
          <span className="block h-3 w-3 rounded-full border-2 border-[#E8A33D] border-t-transparent animate-spin" />
        ) : (
          <span className="block h-1.5 w-1.5 rounded-full bg-current" />
        )}
      </span>
      <div>
        <p
          className={`text-[15px] font-medium ${
            state === "pending" ? "text-[#5E6B85]" : "text-[#F5F3EC]"
          }`}
        >
          {stage.label}
        </p>
        <p className="text-[13px] text-[#9AA6BC] mt-0.5">{stage.detail}</p>
      </div>
    </li>
  );
}

export default function ProcessingPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const intervalRef = useRef(null);
const stitchStartedRef = useRef(false);
  const [project, setProject] = useState(null);
  const [pollError, setPollError] = useState("");
  const [retrying, setRetrying] = useState(false);

const fetchStatus = async () => {
  try {
    const res = await axios.get(
      `${API_URL}/api/projects/${projectId}/get-project`
    );

    const data = res.data.project ?? res.data;

    setProject(data);
    setPollError("");

    // STEP 9: Start Stitch generation
    // only once when brief is ready
    if (
      data.status === "brief_ready" &&
      !stitchStartedRef.current
    ) {
      stitchStartedRef.current = true;

      try {
        await axios.post(
          `${API_URL}/api/projects/${projectId}/generate`
        );

        console.log(
          `Stitch generation started for project ${projectId}`
        );
      } catch (err) {
        console.error(
          "Failed to start Stitch generation:",
          err
        );

        stitchStartedRef.current = false;

        setPollError(
          "Couldn't start website generation."
        );
      }
    }

    // Step 9 completed
    if (data.status === "completed") {
      clearInterval(intervalRef.current);

      navigate(`/result/${projectId}`);
    }

    // Any generation failure
    else if (FAILED_STATUSES.includes(data.status)) {
      clearInterval(intervalRef.current);
    }

  } catch (err) {
    console.error("Status poll error:", err);

    setPollError(
      "Couldn't check your project's status just now."
    );
  }
};

  useEffect(() => {
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

const handleRetry = async () => {
  try {
    setRetrying(true);
    setPollError("");

    if (project?.status === "brief_failed") {
      await axios.post(
        `${API_URL}/api/projects/${projectId}/generate-brief`
      );
    } else if (project?.status === "failed") {
      stitchStartedRef.current = true;

      await axios.post(
        `${API_URL}/api/projects/${projectId}/generate`
      );
    }

    await fetchStatus();

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(
      fetchStatus,
      POLL_INTERVAL_MS
    );

  } catch (err) {
    console.error("Retry error:", err);

    setPollError(
      "Retry didn't go through. Please try again."
    );
  } finally {
    setRetrying(false);
  }
};

  const status = project?.status;
  const failed = FAILED_STATUSES.includes(status);
  const activeIndex = currentStageIndex(status);

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
        @media (prefers-reduced-motion:reduce) {
          .rise { opacity:1 !important; animation:none !important; transform:none !important; }
          .floaty, .m-stroke, .m-rect, .m-rect2, .m-dash, .m-btn { animation:none !important; }
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

      <main className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-20 grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
        {/* left: animated build visual */}
        <div className="hidden lg:flex justify-center rise" aria-hidden="true">
          <svg
            viewBox="0 0 480 520"
            className="w-full max-w-[380px] h-auto floaty drop-shadow-[0_30px_60px_rgba(0,0,0,.45)]"
          >
            <rect x="8" y="8" width="464" height="504" rx="14" fill="#1D2C4A" stroke="#2A3B5C" />
            <circle cx="30" cy="30" r="5" fill="#3D6EA5" />
            <circle cx="50" cy="30" r="5" fill="#5E82AD" />
            <circle cx="70" cy="30" r="5" fill="#E8A33D" />

            <g opacity="0.9">
              <rect className="m-stroke" x="48" y="64" width="384" height="26" fill="none" stroke="#3D6EA5" strokeWidth="1.5" />
              <line className="m-dash" x1="48" y1="114" x2="432" y2="114" stroke="#3D6EA5" strokeWidth="1" />
              <rect className="m-rect" x="48" y="134" width="120" height="120" fill="none" stroke="#3D6EA5" strokeWidth="1.5" style={{ animationDelay: ".15s" }} />
              <rect className="m-rect2" x="180" y="134" width="120" height="120" fill="none" stroke="#3D6EA5" strokeWidth="1.5" style={{ animationDelay: ".3s" }} />
              <rect className="m-rect" x="312" y="134" width="120" height="120" fill="none" stroke="#3D6EA5" strokeWidth="1.5" style={{ animationDelay: ".45s" }} />
              <line className="m-dash" x1="48" y1="284" x2="432" y2="284" stroke="#3D6EA5" strokeWidth="1" style={{ animationDelay: ".2s" }} />
              <line className="m-dash" x1="48" y1="304" x2="360" y2="304" stroke="#3D6EA5" strokeWidth="1" style={{ animationDelay: ".3s" }} />
              <line className="m-dash" x1="48" y1="324" x2="300" y2="324" stroke="#3D6EA5" strokeWidth="1" style={{ animationDelay: ".4s" }} />
              <rect className="m-btn" x="48" y="356" width="140" height="34" fill="none" stroke="#3D6EA5" strokeWidth="1.5" style={{ animationDelay: ".5s" }} />
            </g>
          </svg>
        </div>

        {/* right: status */}
        <div className="rise" style={{ animationDelay: ".1s" }}>
          <span className="inline-flex items-center gap-2 border border-[#2A3B5C] rounded-full px-4 py-1.5 text-[13px] text-[#9AA6BC] mb-6 bg-[#1D2C4A]/60">
            <span className="w-2 h-2 rounded-full bg-[#E8A33D] animate-pulse" />
            {failed ? "Something went wrong" : "Building your design"}
          </span>

          <h1 className="font-[Fraunces,serif] font-medium text-[clamp(1.9rem,4vw,2.6rem)] leading-[1.1] tracking-[-0.01em] mb-3">
            {failed
              ? "We hit a snag."
              : project?.businessName
              ? `Building the design for ${project.businessName}.`
              : "Building your design."}
          </h1>
          <p className="text-[15px] leading-relaxed text-[#9AA6BC] mb-8 max-w-[46ch]">
            {failed
              ? "The last step didn't finish. You can try again — nothing you entered was lost."
              : "This usually takes a couple of minutes. You can leave this page — your link will still work when you come back."}
          </p>

          {!failed ? (
            <ol className="space-y-5 bg-[#1D2C4A]/60 border border-[#2A3B5C] rounded-2xl p-6">
              {STAGES.map((stage, i) => (
                <StageRow
                  key={stage.key}
                  stage={stage}
                  state={i < activeIndex ? "done" : i === activeIndex ? "active" : "pending"}
                />
              ))}
            </ol>
          ) : (
            <div className="bg-[#1D2C4A]/60 border border-[#E8A33D]/30 rounded-2xl p-6">
              <p className="text-[13px] text-[#9AA6BC] mb-4">
                {project?.errorMessage || "Design generation failed unexpectedly."}
              </p>
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="bg-[#E8A33D] text-[#16223B] font-semibold text-[15px] px-6 py-3 rounded-xl transition-transform hover:not-disabled:-translate-y-0.5 disabled:opacity-60"
              >
                {retrying ? "Retrying..." : "Try again"}
              </button>
            </div>
          )}

          {pollError && (
            <p className="mt-4 text-[13px] text-[#E8A33D]">{pollError}</p>
          )}
        </div>
      </main>
    </div>
  );
}
