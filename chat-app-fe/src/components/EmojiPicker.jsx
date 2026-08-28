import { useEffect, useRef } from "react";
import EmojiPickerReact, { Theme, EmojiStyle } from "emoji-picker-react";

export default function EmojiPicker({ onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        bottom: "calc(100% + 10px)",
        left: 20,
        zIndex: 20,
        boxShadow: "var(--shadow-glass)",
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid var(--border-strong)",
        animation: "pop-in .16s ease-out",
      }}
    >
      <EmojiPickerReact
        onEmojiClick={(emojiData) => onSelect(emojiData.emoji)}
        theme={Theme.DARK}
        emojiStyle={EmojiStyle.NATIVE}
        width={320}
        height={380}
        searchDisabled={false}
        skinTonesDisabled
        previewConfig={{ showPreview: false }}
        lazyLoadEmojis
      />
    </div>
  );
}
