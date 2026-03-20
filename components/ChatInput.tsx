"use client";

import { useState, useRef, useCallback } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  disabled: boolean;
}

const SHORTCUTS = [
  { label: "Explain", prefix: "Explain " },
  { label: "Summarize", prefix: "Summarize " },
  { label: "Step-by-step", prefix: "Solve step by step: " },
  { label: "Examples", prefix: "Give me examples of " },
  { label: "Compare", prefix: "Compare " },
  { label: "Code", prefix: "Write code for " },
];

export default function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, []);

  const handleSend = useCallback(() => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const prefill = useCallback((prefix: string) => {
    setValue(prefix);
    textareaRef.current?.focus();
    setTimeout(autoResize, 0);
  }, [autoResize]);

  return (
    <div className="input-area">
      <div className="input-inner">
        {/* Shortcut pills */}
        <div className="input-shortcuts">
          {SHORTCUTS.map((s) => (
            <button
              key={s.label}
              className="shortcut-pill"
              onClick={() => prefill(s.prefix)}
              tabIndex={-1}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Text input */}
        <div className="input-box-wrap">
          <textarea
            ref={textareaRef}
            className="input-box"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your studies..."
            rows={1}
            disabled={disabled}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            title="Send (Enter)"
          >
            {isLoading ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10" style={{ animation: "spin 1s linear infinite" }} />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
        <div className="input-hint">
          Press <kbd>Enter</kbd> to send · <kbd>Shift + Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
}
