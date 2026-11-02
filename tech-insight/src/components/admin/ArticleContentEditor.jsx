import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  ARTICLE_FONT_FAMILIES,
  articleContentToHtml,
  sanitizeArticleHtml,
} from "../../lib/articleUtils";
import { uploadArticleImage } from "../../lib/articleService";
import {
  applyImageWidth as resizeArticleImage,
  insertImageAtSelection,
  selectImageAtIndex,
} from "../../lib/articleEditorUtils";

const FontStyle = ReactQuill.Quill.import("attributors/style/font");
FontStyle.whitelist = ARTICLE_FONT_FAMILIES;
ReactQuill.Quill.register(FontStyle, true);

const formattingActions = [
  { command: "bold", label: "Bold", text: "B" },
  { command: "italic", label: "Italic", text: "I" },
  { command: "underline", label: "Underline", text: "U" },
];

const editorFormats = ["font", "bold", "italic", "underline", "list", "image"];

function toQuillHtml(value) {
  return articleContentToHtml(value).replace(
    /<span data-font="([^"]+)">/g,
    '<span style="font-family: $1">'
  );
}

export default function ArticleContentEditor({ value, onChange, resetKey }) {
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);
  const lastChangeRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const selectedImageNodeRef = useRef(null);
  const [editorHtml, setEditorHtml] = useState(() => toQuillHtml(value));
  const [imageError, setImageError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(false);

  useEffect(() => {
    if (lastChangeRef.current === value) {
      lastChangeRef.current = null;
      return;
    }

    setEditorHtml(toQuillHtml(value));
  }, [resetKey, value]);

  useEffect(() => {
    const editor = editorRef.current?.getEditor();
    if (!editor) {
      return undefined;
    }

    function handleImageClick(event) {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) {
        return;
      }

      const imageBlot = ReactQuill.Quill.find(target);
      if (!imageBlot) {
        return;
      }

      const selection = selectImageAtIndex(editor, editor.getIndex(imageBlot));
      if (!selection) {
        return;
      }

      selectedImageNodeRef.current?.classList.remove("article-image-selected");
      target.classList.add("article-image-selected");
      selectedImageNodeRef.current = target;
      savedSelectionRef.current = selection;
      setSelectedImage(true);
      setImageError("");
    }

    editor.root.addEventListener("click", handleImageClick);
    return () => editor.root.removeEventListener("click", handleImageClick);
  }, [resetKey]);

  function saveSelection() {
    const selection = editorRef.current?.getEditor().getSelection();
    if (selection) {
      savedSelectionRef.current = selection;
    }
  }

  function applyFormatting(command) {
    const editor = editorRef.current?.getEditor();
    if (!editor) {
      return;
    }

    editor.focus();
    const currentFormat = editor.getFormat();
    if (command === "insertUnorderedList" || command === "insertOrderedList") {
      const list = command === "insertUnorderedList" ? "bullet" : "ordered";
      editor.format("list", currentFormat.list === list ? false : list, "user");
      return;
    }

    editor.format(command, !currentFormat[command], "user");
  }

  function applyFont(fontFamily) {
    const editor = editorRef.current?.getEditor();
    if (!editor) {
      return;
    }

    if (savedSelectionRef.current) {
      editor.setSelection(savedSelectionRef.current, "silent");
    }
    editor.focus();
    editor.format("font", fontFamily, "user");
    savedSelectionRef.current = null;
  }

  function applyImageSize(event) {
    const percentage = Number(event.target.value);
    event.target.value = "";
    const editor = editorRef.current?.getEditor();
    const wasResized = resizeArticleImage(
      editor,
      savedSelectionRef.current,
      percentage,
      editor?.root.clientWidth || 0
    );

    if (!wasResized) {
      setImageError("Select an image in the article before changing its size.");
    } else {
      setImageError("");
    }
  }

  async function handleImageSelection(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setImageError("");
    setUploadingImage(true);
    try {
      const { publicUrl } = await uploadArticleImage(file);
      const editor = editorRef.current?.getEditor();
      if (!insertImageAtSelection(editor, publicUrl, savedSelectionRef.current)) {
        throw new Error("The image could not be inserted into the article.");
      }
      savedSelectionRef.current = null;
    } catch (error) {
      console.error("Could not upload article content image:", error);
      setImageError(error?.message || "Could not upload image.");
    } finally {
      setUploadingImage(false);
    }
  }

  function handleEditorChange(html) {
    setEditorHtml(html);
    const safeHtml = sanitizeArticleHtml(html);
    lastChangeRef.current = safeHtml;
    onChange(safeHtml);
  }

  return (
    <div className="article-content-editor">
      <div
        aria-label="Article text formatting"
        className="article-content-toolbar"
        role="toolbar"
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
            className={`article-editor-button article-editor-${command}`}
            key={command}
            onClick={() => applyFormatting(command)}
            onMouseDown={(event) => event.preventDefault()}
            title={label}
            type="button"
          >
            {text}
          </button>
        ))}
        <button
          aria-label="Bulleted list"
          className="article-editor-button"
          onClick={() => applyFormatting("insertUnorderedList")}
          onMouseDown={(event) => event.preventDefault()}
          type="button"
        >
          • List
        </button>
        <button
          aria-label="Numbered list"
          className="article-editor-button"
          onClick={() => applyFormatting("insertOrderedList")}
          onMouseDown={(event) => event.preventDefault()}
          type="button"
        >
          1. List
        </button>
        <button
          aria-label="Insert image"
          className="article-editor-button"
          disabled={uploadingImage}
          onClick={() => imageInputRef.current?.click()}
          onMouseDown={(event) => {
            event.preventDefault();
            saveSelection();
          }}
          type="button"
        >
          {uploadingImage ? "Uploading..." : "Image"}
        </button>
        <label className="article-font-picker">
          <span className="visually-hidden">Set selected image size</span>
          <select
            aria-label="Set selected image size"
            defaultValue=""
            onChange={applyImageSize}
            onMouseDown={saveSelection}
            title={selectedImage ? "Resize selected image" : "Select an image to resize"}
          >
            <option value="" disabled>Image size</option>
            <option value="25">25%</option>
            <option value="50">50%</option>
            <option value="75">75%</option>
            <option value="100">100%</option>
          </select>
        </label>
        <input
          accept="image/jpeg,image/png,image/webp"
          aria-label="Choose image to insert"
          className="visually-hidden"
          onChange={handleImageSelection}
          ref={imageInputRef}
          type="file"
        />
      </div>
      {imageError && <p className="admin-error" role="alert">{imageError}</p>}
      <p className="article-content-help">
        Click an image to select it, then use Image size to resize it.
      </p>
      <ReactQuill
        formats={editorFormats}
        onChange={handleEditorChange}
        onChangeSelection={(selection) => {
          if (selection) {
            savedSelectionRef.current = selection;
            const editor = editorRef.current?.getEditor();
            const index = Math.min(selection.index, Math.max(0, editor?.getLength() - 1));
            const imageCandidates = [index, index - 1].filter((candidate) => candidate >= 0);
            const isImageSelected = imageCandidates.some(
              (candidate) => editor?.getLeaf(candidate)?.[0]?.domNode?.tagName === "IMG"
            );
            setSelectedImage(isImageSelected);
            if (!isImageSelected) {
              selectedImageNodeRef.current?.classList.remove("article-image-selected");
              selectedImageNodeRef.current = null;
            }
          }
        }}
        placeholder="Write your article..."
        ref={editorRef}
        theme="snow"
        value={editorHtml}
      />
    </div>
  );
}
