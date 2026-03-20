"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Message, Subject, Difficulty, ChatState } from "@/types";
import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

const STORAGE_KEY = "studymind_history";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function StudyAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [subject, setSubject] = useState<Subject>("General");
  const [difficulty, setDifficulty] = useState<Difficulty>("Intermediate");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: ChatState & { messages: Array<Message & { timestamp: string }> } =
          JSON.parse(saved);
        setMessages(
          (data.messages || []).map((m) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }))
        );
        setSubject(data.subject || "General");
        setDifficulty(data.difficulty || "Intermediate");
      }
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ messages, subject, difficulty })
      );
    } catch {}
  }, [messages, subject, difficulty]);

  // Auto-scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: Message = {
        id: generateId(),
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setError(null);

      try {
        const apiMessages = [...messages, userMsg]
          .slice(-30)
          .map(({ role, content }) => ({ role, content }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, subject, difficulty }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Error ${res.status}`);
        }

        const data = await res.json();
        const aiMsg: Message = {
          id: generateId(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMsg]);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
        // Remove the user message on failure
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      } finally {
        setIsLoading(false);
      }
    },
    [messages, subject, difficulty, isLoading]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar
        subject={subject}
        difficulty={difficulty}
        onSubjectChange={setSubject}
        onDifficultyChange={setDifficulty}
        onNewChat={clearChat}
      />
      <div className="main-area">
        <ChatHeader
          subject={subject}
          difficulty={difficulty}
          onClear={clearChat}
        />
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          error={error}
          onSuggestionClick={sendMessage}
          bottomRef={chatBottomRef}
        />
        <ChatInput
          onSend={sendMessage}
          isLoading={isLoading}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
