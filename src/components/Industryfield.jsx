const fieldCls =
  "w-full bg-[#1D2C4A] border border-[#2A3B5C] rounded-xl px-4 py-3.5 " +
  "text-[15px] text-[#F5F3EC] placeholder-[#9AA6BC]/70 " +
  "focus:outline-none focus:border-[#E8A33D] " +
  "focus:ring-2 focus:ring-[#E8A33D]/20 " +
  "transition-all duration-150";

const IndustryFields = ({
  fields = [],
  values = {},
  onChange,
  disabled,
}) => {
  if (!fields.length) return null;

  /**
   * businessName is already handled
   * by the main BriefForm.
   *
   * So don't render it again here.
   */
  const industryFields = fields.filter(
    (field) => field.id !== "businessName"
  );

  if (!industryFields.length) return null;

  return (
    <div className="space-y-5">
      {industryFields.map((field) => {
        const value = values[field.id];

        return (
          <div key={field.id}>
            {/* Label */}

            <label
              htmlFor={field.id}
              className="flex flex-wrap items-center gap-2 text-sm font-medium mb-2"
            >
              {field.label}

              {field.required ? (
                <span className="text-[#E8A33D]">
                  *
                </span>
              ) : (
                <span className="text-[11px] font-normal text-[#9AA6BC] border border-[#2A3B5C] rounded-full px-2 py-0.5">
                  Optional
                </span>
              )}
            </label>

            {/* TEXT */}

            {field.type === "text" && (
              <input
                id={field.id}
                type="text"
                value={value || ""}
                onChange={(e) =>
                  onChange(
                    field.id,
                    e.target.value
                  )
                }
                disabled={disabled}
                className={fieldCls}
              />
            )}

            {/* TEXTAREA */}

            {field.type === "textarea" && (
              <textarea
                id={field.id}
                value={value || ""}
                onChange={(e) =>
                  onChange(
                    field.id,
                    e.target.value
                  )
                }
                disabled={disabled}
                rows={4}
                className={`${fieldCls} resize-none`}
              />
            )}

            {/* SELECT */}

            {field.type === "select" && (
              <select
                id={field.id}
                value={value || ""}
                onChange={(e) =>
                  onChange(
                    field.id,
                    e.target.value
                  )
                }
                disabled={disabled}
                className={fieldCls}
              >
                <option value="">
                  Select an option
                </option>

                {field.options?.map((option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ))}
              </select>
            )}

            {/* LIST */}

            {field.type === "list" && (
              <textarea
                id={field.id}
                value={
                  Array.isArray(value)
                    ? value.join("\n")
                    : ""
                }
                onChange={(e) =>
                  onChange(
                    field.id,
                    e.target.value
                      .split("\n")
                      .map((item) => item.trim())
                      .filter(Boolean)
                  )
                }
                disabled={disabled}
                rows={4}
                placeholder="Enter one item per line"
                className={`${fieldCls} resize-none`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default IndustryFields;