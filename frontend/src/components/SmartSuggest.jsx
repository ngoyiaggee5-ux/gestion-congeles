import { useEffect, useId, useRef, useState } from "react";

export default function SmartSuggest({
  value,
  onChange,
  onSelect,
  suggestions = [],
  placeholder,
  label,
  required = false,
  emptyText = "Aucune suggestion",
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef(null);
  const listId = useId();

  useEffect(() => {
    setActiveIndex(0);
  }, [suggestions, value]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const pick = (item) => {
    onSelect?.(item);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && open && suggestions[activeIndex]) {
      e.preventDefault();
      pick(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="smart-suggest" ref={wrapRef}>
      {label && <label className="form-label">{label}</label>}
      <div className="smart-suggest-input-wrap">
        <i className="bi bi-search smart-suggest-icon" />
        <input
          className="form-control smart-suggest-input"
          value={value}
          placeholder={placeholder}
          required={required}
          aria-expanded={open}
          aria-controls={listId}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </div>

      {open && (
        <div className="smart-suggest-panel" id={listId} role="listbox">
          {!suggestions.length && (
            <div className="smart-suggest-empty">{emptyText}</div>
          )}
          {suggestions.map((item, index) => (
            <button
              key={`${item.id ?? item.label ?? item.name}-${index}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              className={`smart-suggest-item ${index === activeIndex ? "active" : ""}`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => pick(item)}
            >
              <div>
                <div className="smart-suggest-title">
                  {item.label || item.name}
                </div>
                {(item.meta || item.phone) && (
                  <div className="smart-suggest-meta">
                    {item.meta || item.phone}
                  </div>
                )}
              </div>
              <div className="smart-suggest-side">
                {item.badge && (
                  <span className="smart-suggest-badge">{item.badge}</span>
                )}
                {item.price != null && (
                  <span className="smart-suggest-price">
                    {typeof item.price === "string" ? item.price : null}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
