import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import API_URL from "../config/api";

export default function ResultsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [copied, setCopied] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [approved, setApproved] = useState(false);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
      
        const res = await axios.get(
          `${API_URL}/api/projects/${projectId}/results`
        );
        setData(res.data);
        setLoadError("");
      } catch (err) {
        console.error("Results fetch error:", err);
        setLoadError("We couldn't load this design. The link may be invalid.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [projectId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {

    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    try {
      setSubmittingFeedback(true);
      await axios.post(
        `${API_URL}/api/projects/${projectId}/feedback`,
        { message: feedback.trim() }
      );
      setFeedbackSent(true);
      setFeedback("");
    } catch (err) {
      console.error("Feedback error:", err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleApprove = async () => {
    try {
      setApproving(true);
      await axios.post(`${API_URL}/api/projects/${projectId}/approve`);
      setApproved(true);
    } catch (err) {
      console.error("Approve error:", err);
    } finally {
      setApproving(false);
    }
  };

  const project = data?.project;
  const website = data?.website;

  return (
    <div className="relative min-h-screen bg-[#16223B] text-[#F5F3EC] font-[IBM_Plex_Sans,sans-serif] antialiased overflow-x-hidden">
      <style>{`
        .glow { position:absolute; border-radius:9999px; filter:blur(90px); opacity:.55; pointer-events:none; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
        .rise { opacity:0; animation:fadeUp .7s ease forwards; }
        .lift { transition:transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
        .lift:hover { transform:translateY(-4px); box-shadow:0 16px 36px -18px rgba(0,0,0,.55); border-color:#E8A33D66; }
        @media (prefers-reduced-motion:reduce) {
          .rise { opacity:1 !important; animation:none !important; transform:none !important; }
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
        {!loading && !loadError && (
          <button
            onClick={handleCopyLink}
            className="text-sm text-[#9AA6BC] hover:text-[#F5F3EC] transition-colors"
          >
            {copied ? "Link copied" : "Copy shareable link"}
          </button>
        )}
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-20">
        {loading && (
          <div className="rise text-[#9AA6BC] text-[15px]">Loading your design...</div>
        )}

        {!loading && loadError && (
          <div className="rise max-w-lg bg-[#1D2C4A]/60 border border-[#E8A33D]/30 rounded-2xl p-6">
            <p className="text-[15px] text-[#F5F3EC] mb-2">{loadError}</p>
            <p className="text-[13px] text-[#9AA6BC]">
              Double check the link, or start a new brief from the home page.
            </p>
          </div>
        )}

        {!loading && !loadError && (
          <>
            <div className="rise mb-10">
              <span className="inline-flex items-center gap-2 border border-[#2A3B5C] rounded-full px-4 py-1.5 text-[13px] text-[#9AA6BC] mb-6 bg-[#1D2C4A]/60">
                <span className="w-2 h-2 rounded-full bg-[#E8A33D]" />
                Draft ready
              </span>
              <h1 className="font-[Fraunces,serif] font-medium text-[clamp(1.9rem,4vw,2.6rem)] leading-[1.1] tracking-[-0.01em] mb-3">
                {project?.businessName ? `Here's ${project.businessName}.` : "Your design is ready."}
              </h1>
              <p className="text-[15px] leading-relaxed text-[#9AA6BC] max-w-[50ch]">
               Preview your complete single-page website below. If something's off,
  request a change — or approve it once it feels right.
              </p>
            </div>

{website ? (
  <div
    className="rise mb-10"
    style={{ animationDelay: ".1s" }}
  >
    <a
      href={website.htmlUrl || "#"}
      target="_blank"
      rel="noreferrer"
      className="lift block bg-[#1D2C4A] border border-[#2A3B5C] rounded-2xl overflow-hidden"
    >
      <div className="aspect-[16/10] bg-[#16223B] flex items-center justify-center">
        {website.imageUrl ? (
          <img
            src={website.imageUrl}
            alt="Generated single-page website preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-[#5E6B85] text-sm">
            Preview pending
          </span>
        )}
      </div>

      <div className="p-5 flex items-center justify-between">
        <div>
          <h2 className="font-[Fraunces,serif] font-medium text-lg">
            Your Website
          </h2>

          <p className="text-[13px] text-[#9AA6BC] mt-1">
            Single-page website · View full design →
          </p>
        </div>

        <span className="text-[#E8A33D] text-sm font-semibold">
          Open
        </span>
      </div>
    </a>
  </div>
) : (
  <div className="rise mb-10 bg-[#1D2C4A]/60 border border-[#2A3B5C] rounded-2xl p-6 text-[#9AA6BC] text-[15px]">
    Your website preview will appear here once it's finished.
  </div>
)}

            {/* actions */}
            <div className="rise bg-[#1D2C4A]/60 border border-[#2A3B5C] rounded-2xl p-6 sm:p-8" style={{ animationDelay: ".2s" }}>
              {approved ? (
                <p className="text-[15px] text-[#F5F3EC]">
                  Approved — this design is yours to keep and export whenever you're ready.
                </p>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                  <div>
                    <h3 className="font-[Fraunces,serif] font-medium text-lg mb-1">
                      Happy with it?
                    </h3>
                    <p className="text-[13px] text-[#9AA6BC]">
                      Approve to lock it in, or tell us what to change.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setShowFeedback((v) => !v)}
                      className="border border-[#2A3B5C] bg-[#1D2C4A] text-[#F5F3EC] font-semibold px-6 py-3 rounded-xl transition-all hover:border-[#3D6EA5] hover:-translate-y-0.5"
                    >
                      Request changes
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={approving}
                      className="bg-[#E8A33D] text-[#16223B] font-semibold px-6 py-3 rounded-xl transition-transform hover:not-disabled:-translate-y-0.5 disabled:opacity-60"
                    >
                      {approving ? "Approving..." : "Approve design"}
                    </button>
                  </div>
                </div>
              )}

              {showFeedback && !approved && (
                <form onSubmit={handleSubmitFeedback} className="mt-6 pt-6 border-t border-[#2A3B5C]/60">
                  {feedbackSent ? (
                    <p className="text-[13px] text-[#9AA6BC]">
                      Got it — we'll work on your changes and update this page.
                    </p>
                  ) : (
                    <>
                      <label htmlFor="feedback" className="block text-sm font-medium mb-2">
                        What should change?
                      </label>
                      <textarea
                        id="feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={3}
                        placeholder="e.g. Make the hero darker, change the services layout..."
                        className="w-full bg-[#1D2C4A] border border-[#2A3B5C] rounded-xl px-4 py-3 text-[15px] text-[#F5F3EC] placeholder-[#9AA6BC]/70 focus:outline-none focus:border-[#E8A33D] focus:ring-2 focus:ring-[#E8A33D]/20 resize-none"
                      />
                      <button
                        type="submit"
                        disabled={submittingFeedback || !feedback.trim()}
                        className="mt-3 bg-[#E8A33D] text-[#16223B] font-semibold text-sm px-5 py-2.5 rounded-lg disabled:opacity-60"
                      >
                        {submittingFeedback ? "Sending..." : "Send"}
                      </button>
                    </>
                  )}
                </form>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
