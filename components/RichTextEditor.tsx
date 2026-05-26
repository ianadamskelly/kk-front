"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { useEffect, useRef, useState } from "react";
import { adminFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

// ToolbarButton renders a single formatting control above the editor.
function ToolbarButton({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // keep editor focus
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition ${
        active
          ? "bg-brand-500 text-white"
          : disabled
            ? "text-ink/25"
            : "text-ink/70 hover:bg-ink/5"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({
  editor,
  showSource,
  onToggleSource,
}: {
  editor: Editor;
  showSource: boolean;
  onToggleSource: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  // Image upload: post to the admin image endpoint (which re-encodes to
  // WebP), then insert <img src> at the cursor. Requires the user to
  // be signed in as admin — same as every other admin form on the site.
  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await adminFetch("/api/admin/upload", getToken() || "", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      editor.chain().focus().setImage({ src: data.url }).run();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Could not upload image");
    } finally {
      setUploading(false);
    }
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const inTable = editor.isActive("table");

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-ink/10 bg-ink/[0.02] px-2 py-1.5">
      <ToolbarButton
        title="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton
        title="Inline code"
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <span className="font-mono text-xs">{"<>"}</span>
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-ink/10" />
      <ToolbarButton
        title="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        title="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-ink/10" />
      <ToolbarButton
        title="Bulleted list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        •
      </ToolbarButton>
      <ToolbarButton
        title="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1.
      </ToolbarButton>
      <ToolbarButton
        title="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        ❝
      </ToolbarButton>
      <ToolbarButton
        title="Horizontal rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        —
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-ink/10" />
      <ToolbarButton
        title="Link"
        active={editor.isActive("link")}
        onClick={setLink}
      >
        Link
      </ToolbarButton>
      <ToolbarButton
        title="Clear formatting"
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
      >
        ⨯
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-ink/10" />

      {/* Image upload */}
      <ToolbarButton
        title={uploading ? "Uploading…" : "Insert image"}
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        🖼
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadImage(file);
          e.target.value = "";
        }}
      />

      {/* Tables: insert a 3x3 with header row; inside a table, expose
          row/column add/remove + delete-table controls. */}
      <ToolbarButton title="Insert table" onClick={insertTable}>
        ⊞
      </ToolbarButton>
      {inTable && (
        <>
          <ToolbarButton
            title="Add column"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            +↔
          </ToolbarButton>
          <ToolbarButton
            title="Delete column"
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            −↔
          </ToolbarButton>
          <ToolbarButton
            title="Add row"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            +↕
          </ToolbarButton>
          <ToolbarButton
            title="Delete row"
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            −↕
          </ToolbarButton>
          <ToolbarButton
            title="Delete table"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            ⊟
          </ToolbarButton>
        </>
      )}

      <span className="mx-1 h-5 w-px bg-ink/10" />
      <ToolbarButton
        title="Undo"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        ↶
      </ToolbarButton>
      <ToolbarButton
        title="Redo"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        ↷
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-ink/10" />
      <ToolbarButton
        title={showSource ? "Show rich text view" : "Edit raw HTML"}
        active={showSource}
        onClick={onToggleSource}
      >
        {"</>"}
      </ToolbarButton>
    </div>
  );
}

// RichTextEditor wraps TipTap with our toolbar and standard styling.
export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing…",
  minHeight,
}: RichTextEditorProps) {
  const [showSource, setShowSource] = useState(false);

  const editor = useEditor({
    // immediatelyRender=false avoids the SSR mismatch warning Next 16
    // produces when the editor would render before hydration.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        // StarterKit v3 bundles Link; disable it so our standalone
        // Link.configure() below is the single source of truth and
        // we don't get "Duplicate extension names found: ['link']".
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Image.configure({
        // Images come from /api/admin/upload (already re-encoded as
        // WebP). Allow inline so admins can drop one mid-paragraph.
        inline: false,
        allowBase64: false,
      }),
      Table.configure({ resizable: true, allowTableNodeSelection: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // TipTap renders an empty doc as "<p></p>"; treat that as empty.
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  const toggleSource = () => {
    if (!editor) return;
    if (!showSource) {
      // Switching to source: make sure the textarea opens with the
      // current canonical HTML (in case other extensions normalised
      // anything since the last onUpdate).
      setShowSource(true);
      return;
    }
    setShowSource(false);
  };

  // If the parent resets value externally (e.g. when loading a record), sync.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (current !== next && (current !== "<p></p>" || next !== "")) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
     
  }, [value, editor]);

  return (
    <div
      className="kk-editor overflow-hidden rounded-lg border border-ink/15 bg-white focus-within:border-brand-500"
      style={minHeight ? { minHeight } : undefined}
    >
      {editor && (
        <Toolbar
          editor={editor}
          showSource={showSource}
          onToggleSource={toggleSource}
        />
      )}
      {showSource ? (
        // Raw HTML edit mode. The textarea writes directly to the
        // parent (and to the editor instance) so toggling back to
        // rich-text view picks up whatever was typed.
        <textarea
          spellCheck={false}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            editor?.commands.setContent(e.target.value, { emitUpdate: false });
          }}
          className="block w-full resize-y bg-ink/[0.02] p-3 font-mono text-xs text-ink/85 outline-none"
          style={{ minHeight: 280 }}
        />
      ) : (
        <EditorContent editor={editor} className="kk-prose" />
      )}
    </div>
  );
}
