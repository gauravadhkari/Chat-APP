import { useEffect, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";
import EmojiPicker from "./EmojiPicker";

export default function MessageInput({ disabled = false, disabledReason = "" }) {
  const { sendMessage, emitTyping, emitStopTyping } = useChat();
  const [value, setValue] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const stopTypingTimeout = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => () => clearTimeout(stopTypingTimeout.current), []);

  const handleChange = (e) => {
    setValue(e.target.value);
    emitTyping();
    clearTimeout(stopTypingTimeout.current);
    stopTypingTimeout.current = setTimeout(() => emitStopTyping(), 1200);
  };

  const insertEmoji = (emoji) => {
    const el = textareaRef.current;
    if (!el) {
      setValue((v) => v + emoji);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + emoji + value.slice(end);
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + emoji.length;
      el.setSelectionRange(cursor, cursor);
    });
  };

  const submit = (e) => {
    e.preventDefault();
    if (disabled || !value.trim()) return;
    sendMessage(value);
    setValue("");
    clearTimeout(stopTypingTimeout.current);
    emitStopTyping();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      submit(e);
    }
  };

  if (disabled) {
    return (
      <div
        style={{
          margin: "12px 20px 18px",
          padding: "12px 16px",
          borderRadius: 18,
          background: "var(--bg-surface-raised)",
          border: "1px solid var(--border)",
          color: "var(--text-faint)",
          fontSize: 13.5,
          textAlign: "center",
        }}
      >
        {disabledReason || "You can't message this user."}
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      style={{ display: "flex", gap: 10, padding: "12px 20px 18px", position: "relative" }}
    >
      <button
        type="button"
        onClick={() => setPickerOpen((v) => !v)}
        aria-label="Add emoji"
        style={{
          background: "var(--bg-surface-raised)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          width: 40,
          flexShrink: 0,
          fontSize: 18,
          color: "var(--text-muted)",
        }}
      >
        🙂
      </button>

      {pickerOpen && (
        <EmojiPicker
          onSelect={(emoji) => insertEmoji(emoji)}
          onClose={() => setPickerOpen(false)}
        />
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Write a message…"
        rows={1}
        style={{
          flex: 1,
          resize: "none",
          background: "var(--bg-surface-raised)",
          border: "1px solid var(--border)",
          borderRadius: 18,
          padding: "10px 16px",
          fontSize: 14.5,
          color: "var(--text-primary)",
          maxHeight: 120,
        }}
      />
      <button
        type="submit"
        disabled={!value.trim()}
        style={{
          background: value.trim() ? "var(--accent)" : "var(--bg-surface-raised)",
          color: value.trim() ? "#1a0d08" : "var(--text-faint)",
          border: "none",
          borderRadius: 18,
          padding: "0 20px",
          fontWeight: 600,
          fontSize: 14,
          fontFamily: "var(--font-display)",
          transition: "background .15s",
        }}
      >
        Send
      </button>
    </form>
  );
}