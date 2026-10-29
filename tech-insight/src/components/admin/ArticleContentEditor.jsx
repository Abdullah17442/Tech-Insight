import { useEffect, useRef } from "react";
import {
  ARTICLE_FONT_FAMILIES,
  articleContentToHtml,
  sanitizeArticleHtml,
} from "../../lib/articleUtils";

const formattingActions = [
  { command: "bold", label: "Bold", text: "B" },
  { command: "italic", label: "Italic", text: "I" },
  { command: "underline", label: "Underline", text: "U" },
  { command: "insertUnorderedList", label: "Bulleted list", text: "• List" },
  { command: "insertOrderedList", label: "Numbered list", text: "1. List" },
];

export default function ArticleContentEditor({
  value,
  onChange,
  resetKey,
}) {
  const editorRef = useRef(null);
  const lastChangeRef = useRef(null);
  const savedSelectionRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      if (lastChangeRef.current === value) {
        lastChangeRef.current = null;
        return;
      }
      editorRef.current.innerHTML = articleContentToHtml(value);
    }
  }, [resetKey, value]);

  function applyFormatting(command) {
    editorRef.current?.focus();
    document.execCommand(command);
    handleInput();
  }

  function saveSelection() {
    const selection = window.getSelection();
    if (
      selection?.rangeCount &&
      editorRef.current?.contains(selection.anchorNode) &&
      editorRef.current.contains(selection.focusNode)
    ) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  }

  function applyFont(fontFamily) {
    editorRef.current?.focus();
    const selection = window.getSelection();
    const savedRange = savedSelectionRef.current;

    if (selection && savedRange && editorRef.current?.contains(savedRange.commonAncestorContainer)) {
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }

    document.execCommand("styleWithCSS", false, false);
    document.execCommand("fontName", false, fontFamily);
    savedSelectionRef.current = null;
    handleInput();
  }

  function handleInput() {
    if (!editorRef.current) {
      return;
    }

    const html = sanitizeArticleHtml(editorRef.current.innerHTML);
    if (editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
    lastChangeRef.current = html;
    onChange(html);
  }

  return (
    <div className="article-content-editor">
      <div
        aria-label="Article text formatting"
        className="article-content-toolbar"
        role="toolbar"
        style={{ display: "flex", gap: "6px", flexWrap: "wrap", margin: "8px 0" }}
      >
        <label className="article-font-picker">
          <span className="visually-hidden">Choose article font</span>
          <select
            aria-label="Choose article font"
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) {
                applyFont(event.target.value);
              }
              event.target.value = "";
            }}
            onMouseDown={saveSelection}
            title="Choose font for selected text"
          >
            <option value="" disabled>Font family</option>
            {ARTICLE_FONT_FAMILIES.map((fontFamily) => (
              <option key={fontFamily} value={fontFamily}>
                {fontFamily}
              </option>
            ))}
          </select>
        </label>
        {formattingActions.map(({ command, label, text }) => (
          <button
            aria-label={label}
            key={command}
            onClick={() => applyFormatting(command)}
            onMouseDown={(event) => event.preventDefault()}
            title={label}
            type="button"
            style={{ minHeight: "34px", padding: "6px 10px" }}
          >
            {text}
          </button>
        ))}
      </div>
      <div
        aria-label="Article content"
        aria-multiline="true"
        className="article-content-editable"
        contentEditable
        onInput={handleInput}
        ref={editorRef}
        role="textbox"
        suppressContentEditableWarning
        style={{
          minHeight: "220px",
          padding: "12px",
          border: "1px solid #aaa",
          borderRadius: "6px",
          background: "#fff",
          lineHeight: 1.6,
        }}
      />
    </div>
  );
}
