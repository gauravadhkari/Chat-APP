import { useEffect, useRef } from "react";
import EmojiPickerReact, { Theme } from "emoji-picker-react";

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
      className="animate-picker-in"
      style={{
        position: "absolute",
        bottom: "calc(100% + 8px)",
        left: 0,
        zIndex: 20,
        boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <EmojiPickerReact
        onEmojiClick={(emojiData) => onSelect(emojiData.emoji)}
        theme={Theme.DARK}
        width={300}
        height={360}
        searchDisabled={false}
        skinTonesDisabled
        previewConfig={{ showPreview: false }}
        lazyLoadEmojis
      />
    </div>
  );
}
