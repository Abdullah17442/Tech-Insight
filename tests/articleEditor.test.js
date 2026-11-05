import test from "node:test";
import assert from "node:assert/strict";
import {
  applyImageWidth,
  insertImageAtSelection,
  isSafeArticleImageSource,
  selectImageAtIndex,
} from "../src/lib/articleEditorUtils.js";
import { buildArticlePayload } from "../src/lib/articleUtils.js";

test("inserts multiple images at the active cursor positions", () => {
  const embeds = [];
  let selection = { index: 4, length: 0 };
  const editor = {
    getLength: () => 12,
    getSelection: () => selection,
    insertEmbed: (index, type, value, source) => {
      embeds.push({ index, type, value, source });
    },
    setSelection: (index, length, source) => {
      selection = { index, length, source };
    },
  };

  assert.equal(insertImageAtSelection(editor, "https://cdn.example/one.png"), true);
  selection = { index: 9, length: 0 };
  assert.equal(insertImageAtSelection(editor, "https://cdn.example/two.png"), true);
  assert.deepEqual(embeds, [
    { index: 4, type: "image", value: "https://cdn.example/one.png", source: "user" },
    { index: 9, type: "image", value: "https://cdn.example/two.png", source: "user" },
  ]);
  assert.deepEqual(selection, { index: 10, length: 0, source: "silent" });
});

test("inserts an image at the document end when there is no active selection", () => {
  let insertedIndex = null;
  const editor = {
    getLength: () => 8,
    getSelection: () => null,
    insertEmbed: (index) => {
      insertedIndex = index;
    },
    setSelection: () => {},
  };

  assert.equal(insertImageAtSelection(editor, "https://cdn.example/end.webp"), true);
  assert.equal(insertedIndex, 7);
});

test("uses the saved cursor position after an asynchronous image upload", () => {
  let insertedIndex = null;
  const editor = {
    getLength: () => 12,
    getSelection: () => ({ index: 9, length: 0 }),
    insertEmbed: (index) => {
      insertedIndex = index;
    },
    setSelection: () => {},
  };

  assert.equal(
    insertImageAtSelection(editor, "https://cdn.example/position.png", {
      index: 3,
      length: 0,
    }),
    true
  );
  assert.equal(insertedIndex, 3);
});

test("resizes the selected image using a supported percentage of the editor width", () => {
  const formatted = [];
  const imageBlot = { domNode: { tagName: "IMG" } };
  const editor = {
    getLength: () => 10,
    getLeaf: (index) => (index === 4 ? [imageBlot, 0] : [{ domNode: {} }, 0]),
    formatText: (...args) => formatted.push(args),
  };

  assert.equal(applyImageWidth(editor, { index: 4, length: 1 }, 50, 640), true);
  assert.deepEqual(formatted, [[4, 1, "width", "320", "user"]]);
});

test("rejects image resize requests without a selected image or supported size", () => {
  const editor = {
    getLength: () => 10,
    getLeaf: () => [{ domNode: {} }, 0],
    formatText: () => assert.fail("Should not resize non-image content"),
  };

  assert.equal(applyImageWidth(editor, { index: 4, length: 0 }, 50, 640), false);
  assert.equal(applyImageWidth(editor, { index: 4, length: 1 }, 30, 640), false);
});

test("selects an image embed when it is clicked in the editor", () => {
  const selected = [];
  const editor = {
    getLength: () => 10,
    getLeaf: (index) => [
      { domNode: { tagName: index === 4 ? "IMG" : "P" } },
      0,
    ],
    setSelection: (...args) => selected.push(args),
  };

  assert.deepEqual(selectImageAtIndex(editor, 4), { index: 4, length: 1 });
  assert.deepEqual(selected, [[4, 1, "user"]]);
});

test("does not select non-image content as an image", () => {
  const editor = {
    getLength: () => 10,
    getLeaf: () => [{ domNode: { tagName: "P" } }, 0],
    setSelection: () => assert.fail("Should not select non-image content"),
  };

  assert.equal(selectImageAtIndex(editor, 4), null);
});

test("rejects unsafe and empty article image sources", () => {
  assert.equal(isSafeArticleImageSource("https://cdn.example/image.png"), true);
  assert.equal(isSafeArticleImageSource("/storage/article.png"), true);
  assert.equal(isSafeArticleImageSource("javascript:alert(1)"), false);
  assert.equal(isSafeArticleImageSource("data:image/png;base64,abc"), false);
  assert.equal(isSafeArticleImageSource(""), false);
});

test("preserves embedded image markup in article save payloads", () => {
  const content =
    '<p>Before <img src="https://cdn.example/one.png"> between ' +
    '<img src="https://cdn.example/two.png"> after.</p>';
  const payload = buildArticlePayload(
    {
      title: "An article with images",
      content,
      status: "published",
    }
  );

  assert.equal(payload.content, content);
  assert.equal(payload.status, "published");
});
