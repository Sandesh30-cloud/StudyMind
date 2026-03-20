"use client";

import type { RefObject } from "react";
import { SUGGESTIONS } from "@/types";
import type { Message } from "@/types";
import MessageBubble from "./MessageBubble";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onSuggestionClick: (text: string) => void;
  bottomRef: RefObject<HTMLDivElement>;
}

export default function ChatMessages({
  messages,
  isLoading,
  error,
  onSuggestionClick,
  bottomRef,
}: ChatMessagesProps) {
  const isEmpty = messages.length === 0;

  return (
    <div className="chat-area">
      <div className="chat-inner">
        {isEmpty ? (
          <WelcomeState onSuggestionClick={onSuggestionClick} />
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && <ThinkingIndicator />}
            {error && (
              <div className="error-banner">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function WelcomeState({ onSuggestionClick }: { onSuggestionClick: (t: string) => void }) {
  return (
    <div className="welcome">
      <div className="welcome-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <h1 className="welcome-title">What are you studying today?</h1>
      <p className="welcome-subtitle">
        Your personal AI study companion. Ask me to explain concepts, solve problems
        step-by-step, summarize topics, or quiz you on anything.
      </p>
      <div className="suggestions-grid">
        {SUGGESTIONS.map((s, i) => (
          <div
            key={i}
            className="suggestion-card"
            onClick={() => onSuggestionClick(s.text)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSuggestionClick(s.text)}
          >
            <div className="suggestion-label" style={{ color: s.labelColor }}>
              {s.label}
            </div>
            <div className="suggestion-text">{s.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="thinking-row">
      <div className="avatar ai">S</div>
      <div className="thinking-bubble">
        <div className="thinking-dots">
          <span />
          <span />
          <span />
        </div>
        <span className="thinking-text">Thinking...</span>
      </div>
    </div>
  );
}
