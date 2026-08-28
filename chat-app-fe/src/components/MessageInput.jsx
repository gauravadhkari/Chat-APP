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

  // auto-grow the textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value]);

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
        className="glass"
        style={{
          margin: "12px 20px 18px",
          padding: "13px 16px",
          borderRadius: 18,
          color: "var(--text-faint)",
          fontSize: 13.5,
          textAlign: "center",
        }}
      >
        {disabledReason || "You can't message this user."}
      </div>
    );
  }

  const canSend = Boolean(value.trim());

  return (
    <form onSubmit={submit} style={{ padding: "12px 20px 18px", position: "relative" }}>
      <div
        className="glass"
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          padding: 8,
          borderRadius: 22,
        }}
      >
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          aria-label="Add emoji"
          className="btn"
          style={{
            width: 38,
            height: 38,
            flexShrink: 0,
            fontSize: 18,
            borderRadius: 14,
            background: pickerOpen ? "var(--glass-hover)" : "transparent",
          }}
        >
          🙂
        </button>

        {pickerOpen && (
          <EmojiPicker onSelect={(emoji) => insertEmoji(emoji)} onClose={() => setPickerOpen(false)} />
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
            background: "transparent",
            border: "none",
            outline: "none",
            padding: "9px 4px",
            fontSize: 14.5,
            lineHeight: 1.45,
            color: "var(--text-primary)",
            maxHeight: 140,
          }}
        />

        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="btn-primary"
          style={{
            height: 38,
            padding: "0 20px",
            fontSize: 14,
            flexShrink: 0,
            borderRadius: 14,
          }}
        >
          Send
        </button>
      </div>
      <div style={{ fontSize: 10.5, color: "var(--text-faint)", marginTop: 6, paddingLeft: 12 }}>
        Enter to send · Shift + Enter for a new line
      </div>
    </form>
  );
}
