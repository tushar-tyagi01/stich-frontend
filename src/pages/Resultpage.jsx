import { useCallback, useEffect, useRef, useState } from "react";
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
  const [feedbackError, setFeedbackError] = useState("");
  const [contentAction, setContentAction] = useState("provide_content");
  const [selectedSections, setSelectedSections] = useState([]);
  const [sectionContent, setSectionContent] = useState({});
  const [newSections, setNewSections] = useState([{ id: 0, name: "", content: "" }]);
  const [submittingContentChanges, setSubmittingContentChanges] = useState(false);
  const [contentRefinementError, setContentRefinementError] = useState("");
  const [contentRefinementSent, setContentRefinementSent] = useState(false);
  const contentSubmissionRef = useRef(false);
  const nextSectionId = useRef(1);
  const [approved, setApproved] = useState(false);
  const [approving, setApproving] = useState(false);

  const fetchResults = useCallback(async () => {
    const res = await axios.get(`${API_URL}/api/projects/${projectId}/results`);
    console.log("Project result sections:", res.data.sections ?? []);
    setData(res.data);
    return res.data;
  }, [projectId]);

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        await fetchResults();
        setLoadError("");
      } catch (err) {
        console.error("Results fetch error:", err);
        setLoadError("We couldn't load this design. The link may be invalid.");
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [fetchResults]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy shareable link error:", error);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    const message = feedback.trim();
    if (!message || submittingFeedback) return;

    try {
      setFeedbackError("");
      setSubmittingFeedback(true);
      const res = await axios.post(
        `${API_URL}/api/projects/${projectId}/feedback`,
        { message }
      );
      setData((currentData) => ({
        ...currentData,
        website: {
          ...currentData?.website,
          ...(res.data.htmlUrl ? { htmlUrl: res.data.htmlUrl } : {}),
          ...(res.data.imageUrl ? { imageUrl: res.data.imageUrl } : {}),
        },
      }));
      setFeedbackSent(true);
      setFeedback("");
    } catch (err) {
      console.error("Feedback error:", err);
      setFeedbackError(
        typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : "We couldn't submit your design feedback. Please try again."
      );
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

  const handleSubmitContentChanges = async (e) => {
    e.preventDefault();
    if (contentSubmissionRef.current) return;

    setContentRefinementError("");
    setContentRefinementSent(false);

    let sections;
    if (contentAction === "provide_content") {
      if (selectedSections.length === 0) {
        setContentRefinementError("Select at least one AI-generated section.");
        return;
      }

      const aiSectionNames = new Set(aiSections.map((section) => section.name));
      if (selectedSections.some((name) => !aiSectionNames.has(name))) {
        setContentRefinementError(
          "Only AI-generated sections can be updated with your own content."
        );
        return;
      }

      const missingContent = selectedSections.some(
        (name) => !sectionContent[name]?.trim()
      );
      if (missingContent) {
        setContentRefinementError("Enter content for every selected section.");
        return;
      }

      sections = selectedSections.map((name) => ({
        name,
        content: sectionContent[name].trim(),
      }));
    } else if (contentAction === "remove_sections") {
      if (selectedSections.length === 0) {
        setContentRefinementError("Select at least one AI-generated section to remove.");
        return;
      }

      const aiSectionNames = new Set(aiSections.map((section) => section.name));
      if (selectedSections.some((name) => !aiSectionNames.has(name))) {
        setContentRefinementError(
          "Only AI-generated sections can be removed."
        );
        return;
      }

      sections = selectedSections.map((name) => ({ name }));
    } else {
      const completedSections = newSections.map(({ name, content }) => ({
        name: name.trim(),
        content: content.trim(),
      }));
      const hasEmptySection = completedSections.some(
        ({ name, content }) => !name || !content
      );
      if (hasEmptySection) {
        setContentRefinementError("Enter a name and content for every new section.");
        return;
      }

      const existingNames = new Set(
        allSections.map((section) => section.name.trim().toLowerCase())
      );
      const submittedNames = new Set();
      const hasDuplicateName = completedSections.some(({ name }) => {
        const normalizedName = name.toLowerCase();
        if (existingNames.has(normalizedName) || submittedNames.has(normalizedName)) {
          return true;
        }
        submittedNames.add(normalizedName);
        return false;
      });
      if (hasDuplicateName) {
        setContentRefinementError("Each new section must have a unique name.");
        return;
      }

      sections = completedSections;
    }

    try {
      contentSubmissionRef.current = true;
      setSubmittingContentChanges(true);
      // Expected backend contract: POST /content-refinement accepts { action, sections }.
      await axios.post(
        `${API_URL}/api/projects/${projectId}/content-refinement`,
        { action: contentAction, sections }
      );
      setContentRefinementSent(true);
      setSelectedSections([]);
      setSectionContent({});
      setNewSections([{ id: nextSectionId.current++, name: "", content: "" }]);

      try {
        await fetchResults();
      } catch (refreshError) {
        console.error("Content refinement result refresh error:", refreshError);
        setContentRefinementError(
          "Your content changes were submitted, but we couldn't refresh the preview."
        );
      }
    } catch (err) {
      console.error("Content refinement error:", err);
      const backendMessage = err.response?.data?.message;
      setContentRefinementError(
        typeof backendMessage === "string"
          ? backendMessage
          : "We couldn't apply those content changes. Please try again."
      );
    } finally {
      contentSubmissionRef.current = false;
      setSubmittingContentChanges(false);
    }
  };

  const project = data?.project;
  const website = data?.website;
  const allSections = Array.isArray(data?.sections)
    ? data.sections.filter((section) => section && typeof section.name === "string")
    : [];
  const userSections = allSections.filter(
    (section) => section?.source === "user" && typeof section.name === "string"
  );
  const baseSections = allSections.filter(
    (section) => section?.source === "base" && typeof section.name === "string"
  );
  const aiSections = allSections.filter(
    (section) => section?.source === "ai" && typeof section.name === "string"
  );
  const hasSectionMetadata = Array.isArray(data?.sections);

  const handleSectionSelection = (name) => {
    setSelectedSections((current) =>
      current.includes(name)
        ? current.filter((sectionName) => sectionName !== name)
        : [...current, name]
    );
    setContentRefinementError("");
  };

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

            {!approved && (
              <section
                className="rise mb-10 bg-[#1D2C4A]/60 border border-[#2A3B5C] rounded-2xl p-6 sm:p-8"
                aria-labelledby="content-refinement-heading"
              >
                <div className="mb-6">
                  <h2
                    id="content-refinement-heading"
                    className="font-[Fraunces,serif] font-medium text-xl mb-2"
                  >
                    Refine your content
                  </h2>
                  <p className="text-[13px] text-[#9AA6BC]">
                    Manage the sections in your website separately from design changes.
                  </p>
                </div>

                {!hasSectionMetadata && (
                  <p className="mb-6 rounded-xl border border-[#2A3B5C] bg-[#16223B]/50 p-4 text-[13px] text-[#9AA6BC]">
                    Section details aren't available for this design yet. You can still add a new section.
                  </p>
                )}

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-7">
                  <div>
                    <h3 className="text-sm font-semibold text-[#F5F3EC] mb-3">
                      Core sections
                    </h3>
                    {baseSections.length ? (
                      <ul className="space-y-2">
                        {baseSections.map((section) => (
                          <li
                            key={section.id || section.name}
                            className="flex items-center gap-3 rounded-lg border border-[#2A3B5C] bg-[#16223B]/50 px-3 py-2.5 text-sm"
                          >
                            <span className="text-[#E8A33D]" aria-hidden="true">✓</span>
                            {section.name}
                            <span className="ml-auto text-xs text-[#9AA6BC]">Always included</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[13px] text-[#9AA6BC]">No core sections.</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#F5F3EC] mb-3">
                      User-provided sections
                    </h3>
                    {userSections.length ? (
                      <ul className="space-y-2">
                        {userSections.map((section, index) => (
                          <li
                            key={section.id || `${section.name}-${index}`}
                            className="flex items-center gap-3 rounded-lg border border-[#2A3B5C] bg-[#16223B]/50 px-3 py-2.5 text-sm"
                          >
                            <span className="text-[#E8A33D]" aria-hidden="true">✓</span>
                            {section.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[13px] text-[#9AA6BC]">
                        {hasSectionMetadata ? "No user-provided sections." : "Waiting for section details."}
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#F5F3EC] mb-3">
                      AI-generated sections
                    </h3>
                    {aiSections.length ? (
                      <ul className="space-y-2">
                        {aiSections.map((section, index) => (
                          <li key={section.id || `${section.name}-${index}`}>
                            <label className={`flex items-center gap-3 rounded-lg border border-[#2A3B5C] bg-[#16223B]/50 px-3 py-2.5 text-sm ${
                              contentAction === "add_section"
                                ? "cursor-not-allowed opacity-60"
                                : "cursor-pointer hover:border-[#3D6EA5]"
                            }`}>
                              <input
                                type="checkbox"
                                checked={selectedSections.includes(section.name)}
                                onChange={() => handleSectionSelection(section.name)}
                                disabled={submittingContentChanges || contentAction === "add_section"}
                                className="accent-[#E8A33D]"
                              />
                              {section.name}
                            </label>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[13px] text-[#9AA6BC]">
                        {hasSectionMetadata ? "No AI-generated sections." : "Waiting for section details."}
                      </p>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmitContentChanges}>
                  <fieldset disabled={submittingContentChanges}>
                    <legend className="text-sm font-semibold mb-3">Choose a content action</legend>
                    <div className="grid gap-3 sm:grid-cols-3 mb-6">
                      {[
                        ["provide_content", "Use my own content"],
                        ["remove_sections", "Remove selected sections"],
                        ["add_section", "Add a new section"],
                      ].map(([value, label]) => (
                        <label
                          key={value}
                          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm cursor-pointer ${
                            contentAction === value
                              ? "border-[#E8A33D] bg-[#16223B]/70"
                              : "border-[#2A3B5C] bg-[#16223B]/40"
                          }`}
                        >
                          <input
                            type="radio"
                            name="contentAction"
                            value={value}
                            checked={contentAction === value}
                            onChange={() => {
                              setContentAction(value);
                              setContentRefinementError("");
                              setContentRefinementSent(false);
                            }}
                            className="mt-0.5 accent-[#E8A33D]"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {contentAction === "provide_content" && (
                    <div className="space-y-4 mb-6">
                      {selectedSections.length ? (
                        selectedSections.map((name) => (
                          <div key={name}>
                            <label
                              htmlFor={`section-content-${encodeURIComponent(name)}`}
                              className="block text-sm font-medium mb-2"
                            >
                              {name}
                            </label>
                            <textarea
                              id={`section-content-${encodeURIComponent(name)}`}
                              value={sectionContent[name] || ""}
                              onChange={(e) => {
                                setSectionContent((current) => ({
                                  ...current,
                                  [name]: e.target.value,
                                }));
                                setContentRefinementError("");
                              }}
                              rows={3}
                              placeholder={`Enter your content for ${name}`}
                              disabled={submittingContentChanges}
                              className="w-full bg-[#16223B] border border-[#2A3B5C] rounded-xl px-4 py-3 text-[15px] text-[#F5F3EC] placeholder-[#9AA6BC]/70 focus:outline-none focus:border-[#E8A33D] focus:ring-2 focus:ring-[#E8A33D]/20 resize-y"
                            />
                          </div>
                        ))
                      ) : (
                        <p className="text-[13px] text-[#9AA6BC]">
                          Select one or more AI-generated sections above to provide replacement content.
                        </p>
                      )}
                    </div>
                  )}

                  {contentAction === "remove_sections" && (
                    <p className="mb-6 text-[13px] text-[#9AA6BC]">
                      Select one or more AI-generated sections above to remove them.
                    </p>
                  )}

                  {contentAction === "add_section" && (
                    <div className="space-y-4 mb-6">
                      {newSections.map((section, index) => (
                        <fieldset
                          key={section.id}
                          className="rounded-xl border border-[#2A3B5C] p-4"
                        >
                          <legend className="px-2 text-sm font-semibold">
                            New section {index + 1}
                          </legend>
                          <div className="space-y-4">
                            <div>
                              <label
                                htmlFor={`new-section-name-${section.id}`}
                                className="block text-sm font-medium mb-2"
                              >
                                Section name
                              </label>
                              <input
                                id={`new-section-name-${section.id}`}
                                value={section.name}
                                onChange={(e) => {
                                  const name = e.target.value;
                                  setNewSections((current) =>
                                    current.map((item) =>
                                      item.id === section.id ? { ...item, name } : item
                                    )
                                  );
                                  setContentRefinementError("");
                                }}
                                placeholder="e.g. Special Offers"
                                disabled={submittingContentChanges}
                                className="w-full bg-[#16223B] border border-[#2A3B5C] rounded-xl px-4 py-3 text-[15px] text-[#F5F3EC] placeholder-[#9AA6BC]/70 focus:outline-none focus:border-[#E8A33D] focus:ring-2 focus:ring-[#E8A33D]/20"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor={`new-section-content-${section.id}`}
                                className="block text-sm font-medium mb-2"
                              >
                                Section content
                              </label>
                              <textarea
                                id={`new-section-content-${section.id}`}
                                value={section.content}
                                onChange={(e) => {
                                  const content = e.target.value;
                                  setNewSections((current) =>
                                    current.map((item) =>
                                      item.id === section.id ? { ...item, content } : item
                                    )
                                  );
                                  setContentRefinementError("");
                                }}
                                rows={3}
                                placeholder="Enter the content for this section"
                                disabled={submittingContentChanges}
                                className="w-full bg-[#16223B] border border-[#2A3B5C] rounded-xl px-4 py-3 text-[15px] text-[#F5F3EC] placeholder-[#9AA6BC]/70 focus:outline-none focus:border-[#E8A33D] focus:ring-2 focus:ring-[#E8A33D]/20 resize-y"
                              />
                            </div>
                            {newSections.length > 1 && (
                              <button
                                type="button"
                                disabled={submittingContentChanges}
                                onClick={() => {
                                  setNewSections((current) =>
                                    current.filter((item) => item.id !== section.id)
                                  );
                                  setContentRefinementError("");
                                }}
                                className="text-sm text-[#9AA6BC] hover:text-[#F5F3EC]"
                              >
                                Remove this new section
                              </button>
                            )}
                          </div>
                        </fieldset>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setNewSections((current) => [
                            ...current,
                            { id: nextSectionId.current++, name: "", content: "" },
                          ]);
                          setContentRefinementError("");
                        }}
                        disabled={submittingContentChanges}
                        className="border border-[#2A3B5C] bg-[#16223B]/50 text-[#F5F3EC] text-sm font-semibold px-4 py-2.5 rounded-lg hover:border-[#3D6EA5] disabled:opacity-60"
                      >
                        Add another section
                      </button>
                    </div>
                  )}

                  {contentRefinementError && (
                    <p role="alert" className="mb-4 text-[13px] text-[#F2A6A6]">
                      {contentRefinementError}
                    </p>
                  )}
                  {contentRefinementSent && (
                    <p role="status" className="mb-4 text-[13px] text-[#9AA6BC]">
                      Content changes submitted.
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={submittingContentChanges}
                    className="bg-[#E8A33D] text-[#16223B] font-semibold text-sm px-5 py-2.5 rounded-lg disabled:opacity-60"
                  >
                    {submittingContentChanges ? "Applying..." : "Apply Content Changes"}
                  </button>
                </form>
              </section>
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
                  {feedbackError && (
                    <p role="alert" className="mb-3 text-[13px] text-[#F2A6A6]">
                      {feedbackError}
                    </p>
                  )}
                  {feedbackSent ? (
                    <p className="text-[13px] text-[#9AA6BC]">
                      Your design has been updated.
                    </p>
                  ) : (
                    <>
                      <label htmlFor="feedback" className="block text-sm font-medium mb-2">
                        Anything you want to change in the design?
                      </label>
                      <textarea
                        id="feedback"
                        value={feedback}
                        onChange={(e) => {
                          setFeedback(e.target.value);
                          setFeedbackError("");
                          setFeedbackSent(false);
                        }}
                        rows={3}
                        placeholder="e.g. Make the hero darker, change the services layout..."
                        disabled={submittingFeedback}
                        className="w-full bg-[#1D2C4A] border border-[#2A3B5C] rounded-xl px-4 py-3 text-[15px] text-[#F5F3EC] placeholder-[#9AA6BC]/70 focus:outline-none focus:border-[#E8A33D] focus:ring-2 focus:ring-[#E8A33D]/20 resize-none"
                      />
                      <button
                        type="submit"
                        disabled={submittingFeedback || !feedback.trim()}
                        className="mt-3 bg-[#E8A33D] text-[#16223B] font-semibold text-sm px-5 py-2.5 rounded-lg disabled:opacity-60"
                      >
                        {submittingFeedback ? "Applying..." : "Request Changes"}
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
