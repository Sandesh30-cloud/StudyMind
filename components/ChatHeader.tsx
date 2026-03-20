"use client";

import type { Subject, Difficulty } from "@/types";

interface ChatHeaderProps {
  subject: Subject;
  difficulty: Difficulty;
  onClear: () => void;
}

export default function ChatHeader({ subject, difficulty, onClear }: ChatHeaderProps) {
  const shortSubject = subject.split(" ")[0];

  return (
    <header className="chat-header">
      <div className="header-subject-badge">
        <div className="header-dot" />
        <span>{shortSubject}</span>
      </div>
      <div className="header-spacer" />
      <div className="header-difficulty-badge">{difficulty}</div>
      <button className="header-clear-btn" onClick={onClear} title="Clear conversation">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6M9 6V4h6v2" />
        </svg>
        Clear
      </button>
    </header>
  );
}
