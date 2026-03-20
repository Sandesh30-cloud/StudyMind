"use client";

import { useMemo } from "react";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { role, content, timestamp } = message;
  const isUser = role === "user";

  const timeStr = useMemo(
    () =>
      timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    [timestamp]
  );

  const parsedContent = useMemo(
    () => (isUser ? null : parseMarkdown(content)),
    [isUser, content]
  );

  return (
    <div className="message-group">
      <div className={`message-row ${isUser ? "user" : ""}`}>
        <div className={`avatar ${isUser ? "user" : "ai"}`}>
          {isUser ? "You" : "S"}
        </div>
        {isUser ? (
          <div className="bubble user">
            {content.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < content.split("\n").length - 1 && <br />}
              </span>
            ))}
          </div>
        ) : (
          <div
            className="bubble ai"
            dangerouslySetInnerHTML={{ __html: parsedContent! }}
          />
        )}
      </div>
      <div className={`message-meta ${isUser ? "user" : ""}`}>{timeStr}</div>
    </div>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseMarkdown(text: string): string {
  // Code blocks
  text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="lang-${lang}">${escapeHtml(code.trim())}</code></pre>`;
  });

  // Inline code
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Headers
  text = text.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  text = text.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  text = text.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold + italic
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*([^*\n]+?)\*/g, "<em>$1</em>");

  // HR
  text = text.replace(/^---$/gm, "<hr />");

  // Blockquote
  text = text.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

  // Tables
  text = text.replace(/(\|.+\|\n)+/g, (match) => {
    const rows = match.trim().split("\n");
    if (rows.length < 2) return match;
    let html = "<table>";
    rows.forEach((row, i) => {
      if (/^\|[-| ]+\|$/.test(row)) return;
      const cells = row.split("|").filter((_, j, a) => j > 0 && j < a.length - 1);
      const tag = i === 0 ? "th" : "td";
      html += "<tr>" + cells.map((c) => `<${tag}>${c.trim()}</${tag}>`).join("") + "</tr>";
    });
    html += "</table>";
    return html;
  });

  // Lists
  text = text.replace(/(^[*-] .+\n?)+/gm, (match) => {
    const items = match
      .trim()
      .split("\n")
      .map((l) => l.replace(/^[*-] /, "").trim())
      .filter(Boolean)
      .map((l) => `<li>${l}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });

  text = text.replace(/(^\d+\. .+\n?)+/gm, (match) => {
    const items = match
      .trim()
      .split("\n")
      .map((l) => l.replace(/^\d+\. /, "").trim())
      .filter(Boolean)
      .map((l) => `<li>${l}</li>`)
      .join("");
    return `<ol>${items}</ol>`;
  });

  // Paragraphs
  const blocks = text.split("\n\n");
  text = blocks
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      if (/^<(h[1-3]|ul|ol|pre|blockquote|hr|table)/.test(block)) return block;
      return `<p>${block.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");

  return text;
}
