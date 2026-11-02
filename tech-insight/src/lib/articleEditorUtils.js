export function isSafeArticleImageSource(source) {
  const value = String(source || "").trim();
  return /^(https?:\/\/|\/(?!\/)|\.{1,2}\/)[^\s]*$/i.test(value);
}

export function selectImageAtIndex(editor, index) {
  if (
    !editor ||
    !Number.isInteger(index) ||
    index < 0 ||
    typeof editor.getLeaf !== "function" ||
    typeof editor.setSelection !== "function"
  ) {
    return null;
  }

  const [leaf] = editor.getLeaf(index) || [];
  if (leaf?.domNode?.tagName !== "IMG") {
    return null;
  }

  const selection = { index, length: 1 };
  editor.setSelection(index, 1, "user");
  return selection;
}

export function applyImageWidth(editor, selection, percentage, containerWidth) {
  const allowedPercentages = new Set([25, 50, 75, 100]);
  if (
    !editor ||
    !selection ||
    !allowedPercentages.has(Number(percentage)) ||
    !Number.isFinite(containerWidth) ||
    containerWidth <= 0 ||
    typeof editor.getLeaf !== "function" ||
    typeof editor.formatText !== "function"
  ) {
    return false;
  }

  const lastIndex = Math.max(0, editor.getLength() - 1);
  const selectionIndex = Math.min(Math.max(0, selection.index), lastIndex);
  const imageIndex = [selectionIndex, selectionIndex - 1].find((index) => {
    if (index < 0) {
      return false;
    }
    const [leaf] = editor.getLeaf(index) || [];
    return leaf?.domNode?.tagName === "IMG";
  });

  if (imageIndex === undefined) {
    return false;
  }

  const width = Math.min(
    4096,
    Math.max(1, Math.round((containerWidth * Number(percentage)) / 100))
  );
  editor.formatText(imageIndex, 1, "width", String(width), "user");
  return true;
}

export function insertImageAtSelection(editor, imageUrl, savedSelection = null) {
  if (
    !editor ||
    !isSafeArticleImageSource(imageUrl) ||
    typeof editor.getLength !== "function" ||
    typeof editor.insertEmbed !== "function" ||
    typeof editor.setSelection !== "function"
  ) {
    return false;
  }

  const selection = savedSelection || editor.getSelection?.();
  const lastInsertableIndex = Math.max(0, editor.getLength() - 1);
  const index = Math.min(
    Math.max(0, Number.isInteger(selection?.index) ? selection.index : lastInsertableIndex),
    lastInsertableIndex
  );

  editor.insertEmbed(index, "image", imageUrl, "user");
  editor.setSelection(index + 1, 0, "silent");
  return true;
}
