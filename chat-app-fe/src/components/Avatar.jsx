import { initials } from "../../../chat-app-fe/src/utils/format";

export default function Avatar({ name, online, size = 40 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(155deg, var(--accent), #ff9166)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize: size * 0.38,
        color: "#170a06",
        flexShrink: 0,
        position: "relative",
      }}
    >
      {initials(name)}
      {online !== undefined && (
        <span
          className={`presence-dot ${online ? "online" : ""}`}
          style={{
            position: "absolute",
            right: -1,
            bottom: -1,
            border: "2px solid var(--bg-surface)",
          }}
        />
      )}
    </div>
  );
}
