export default function TypingIndicator({ name }) {
  return (
    <div
      className="glass"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        padding: "5px 12px",
        borderRadius: 999,
      }}
    >
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
