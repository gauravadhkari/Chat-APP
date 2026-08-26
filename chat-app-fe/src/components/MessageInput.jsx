import { useEffect, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";

export default function MessageInput() {
  const { sendMessage, emitTyping, emitStopTyping } = useChat();
  const [value, setValue] = useState("");
  const stopTypingTimeout = useRef(null);

  useEffect(() => () => clearTimeout(stopTypingTimeout.current), []);

  const handleChange = (e) => {
    setValue(e.target.value);
    emitTyping();
    clearTimeout(stopTypingTimeout.current);
    stopTypingTimeout.current = setTimeout(() => emitStopTyping(), 1200);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
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

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 10, padding: "12px 20px 18px" }}>
      <textarea
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
