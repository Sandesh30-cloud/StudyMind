"use client";

import { SUBJECTS } from "@/types";
import type { Subject, Difficulty } from "@/types";

interface SidebarProps {
  subject: Subject;
  difficulty: Difficulty;
  onSubjectChange: (s: Subject) => void;
  onDifficultyChange: (d: Difficulty) => void;
  onNewChat: () => void;
}

const DIFFICULTIES: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];

export default function Sidebar({
  subject,
  difficulty,
  onSubjectChange,
  onDifficultyChange,
  onNewChat,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="logo-text">StudyMind</span>
        </div>
        <div className="logo-tagline">AI Study Assistant</div>
      </div>

      {/* Subjects */}
      <div className="sidebar-section">
        <div className="sidebar-label">Subject</div>
        {SUBJECTS.map((s) => (
          <button
            key={s.value}
            className={`subject-btn ${subject === s.value ? "active" : ""}`}
            onClick={() => onSubjectChange(s.value)}
          >
            <span className="subject-dot" style={{ background: s.dotColor }} />
            {s.short}
          </button>
        ))}
      </div>

      <div className="sidebar-divider" />

      {/* Difficulty */}
      <div className="difficulty-section">
        <div className="difficulty-label">Difficulty</div>
        <div className="difficulty-pills">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              className={`diff-pill ${difficulty === d ? "active" : ""}`}
              onClick={() => onDifficultyChange(d)}
            >
              {d === "Intermediate" ? "Mid" : d}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="new-chat-btn" onClick={onNewChat}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Conversation
        </button>
      </div>
    </aside>
  );
}
