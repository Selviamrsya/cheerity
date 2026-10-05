"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

interface SearchableSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string; extraInfo?: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  allowCustom?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select option...",
  searchPlaceholder = "Search province or city...",
  className = "",
  disabled = false,
  allowCustom = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      opt.value.toLowerCase().includes(search.toLowerCase()) ||
      (opt.extraInfo && opt.extraInfo.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : value || placeholder;

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch("");
  };

  const handleCustomSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim() && allowCustom) {
      e.preventDefault();
      onChange(search.trim());
      setIsOpen(false);
      setSearch("");
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-white text-gray-900 flex items-center justify-between text-left cursor-pointer focus:outline-none"
        style={{
          minHeight: "38px",
          marginTop: "4px",
          marginBottom: "8px",
          padding:"0 8px"
        }}
      >
        <span className={`truncate text-sm ${!value ? "text-gray-400" : "text-gray-900 font-medium"}`}>
          {displayLabel}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Overlay */}
      {isOpen && (
        <div
          className="absolute z-50 left-0 right-0 mt-2 bg-white border border-gray-200 shadow-2xl overflow-hidden max-h-80 flex flex-col rounded-sm"
          style={{ zIndex: 9999 }}
        >
          {/* Search Box Header - Generous vertical and horizontal padding */}
          <div style={{ padding: "12px 12px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#ffffff",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                padding: "4px 6px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleCustomSubmit}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
                style={{ padding: "2px 0" }}
              />
            </div>
          </div>

          {/* Options List */}
          <div
            className="overflow-y-auto flex-1"
            style={{
              padding: "4px 4px",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              background: "#f9fafb",
            }}
          >
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: "8px",
                  textAlign: "center",
                  fontSize: "10px",
                  color: "#9ca3af",
                  background: "#ffffff",
                  borderRadius: "6px",
                  border: "1px solid #f3f4f6",
                }}
              >
                {allowCustom && search.trim() ? (
                  <button
                    type="button"
                    onClick={() => handleSelect(search.trim())}
                    className="text-green-800 font-semibold hover:underline"
                  >
                    Use &quot;{search.trim()}&quot; as custom value
                  </button>
                ) : (
                  "No options found."
                )}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className="text-left text-sm transition-all cursor-pointer"
                    style={{
                      width: "100%",
                      paddingTop: "8px",
                      paddingBottom: "8px",
                      paddingLeft: "16px",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: isSelected ? "var(--color-primary)" : "#ffffff",
                      color: isSelected ? "var(--color-surface)" : "#1f2937",
                      fontWeight: isSelected ? 600 : 500,
                    }}
                  >
                    <div className="overflow-hidden pr-3">
                      <span className="block truncate text-sm">{opt.label}</span>
                      {opt.extraInfo && (
                        <span
                          className="block truncate"
                          style={{ fontSize: "12px", color: "#6b7280", fontWeight: 400, marginTop: "2px" }}
                        >
                          {opt.extraInfo}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-green-800 flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
