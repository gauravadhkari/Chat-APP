export default function TypingIndicator({ name }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 4px 4px 2px" }}>
      <span className="typing-wave">
        <span />
        <span />
        <span />
        <span />
      </span>
      <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{name} is typing</span>
    </div>
  );
}
