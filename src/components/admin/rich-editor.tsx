"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useImperativeHandle, forwardRef } from "react";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Strikethrough,
  Link as LinkIcon,
  List,
  ListOrdered,
} from "lucide-react";

export interface RichEditorRef {
  getHTML: () => string;
  getText: () => string;
  clear: () => void;
  insertContent: (text: string) => void;
  isEmpty: () => boolean;
}

interface RichEditorProps {
  placeholder?: string;
  className?: string;
}

const RichEditor = forwardRef<RichEditorRef, RichEditorProps>(
  ({ placeholder = "Write your reply...", className }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: false,
          codeBlock: false,
          code: false,
          horizontalRule: false,
          blockquote: { HTMLAttributes: { class: "border-l-3 border-gray-300 pl-3 text-gray-500" } },
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { class: "text-blue-600 underline", target: "_blank", rel: "noopener noreferrer" },
        }),
        Placeholder.configure({ placeholder }),
      ],
      editorProps: {
        attributes: {
          class: "prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2 text-sm",
        },
      },
    });

    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() || "",
      getText: () => editor?.getText() || "",
      clear: () => editor?.commands.clearContent(),
      insertContent: (text: string) => {
        if (!editor) return;
        // Insert as plain text paragraphs
        const paragraphs = text.split("\n\n").filter(Boolean);
        const content = paragraphs.map((p) => ({
          type: "paragraph" as const,
          content: p.split("\n").flatMap((line, i, arr) => {
            const nodes: Array<{ type: string; text?: string }> = [{ type: "text", text: line }];
            if (i < arr.length - 1) nodes.push({ type: "hardBreak" });
            return nodes;
          }),
        }));

        if (editor.isEmpty) {
          editor.commands.setContent({ type: "doc", content });
        } else {
          // Append after existing content
          editor.commands.focus("end");
          for (const p of paragraphs) {
            editor.commands.insertContent({ type: "paragraph", content: [{ type: "text", text: p }] });
          }
        }
      },
      isEmpty: () => editor?.isEmpty ?? true,
    }));

    // Cleanup
    useEffect(() => {
      return () => {
        editor?.destroy();
      };
    }, [editor]);

    const setLink = useCallback(() => {
      if (!editor) return;
      const previousUrl = editor.getAttributes("link").href;
      const url = window.prompt("URL", previousUrl);
      if (url === null) return;
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }, [editor]);

    if (!editor) return null;

    return (
      <div className={cn("rounded-md border bg-background", className)}>
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 border-b px-1.5 py-1">
          <ToolbarButton
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </ToolbarButton>

          <div className="w-px h-4 bg-border mx-1" />

          <ToolbarButton
            active={editor.isActive("link")}
            onClick={setLink}
            title="Link"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </ToolbarButton>

          <div className="w-px h-4 bg-border mx-1" />

          <ToolbarButton
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet list"
          >
            <List className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered list"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarButton>
        </div>

        {/* Editor content */}
        <EditorContent editor={editor} />
      </div>
    );
  }
);

RichEditor.displayName = "RichEditor";
export default RichEditor;

function ToolbarButton({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "inline-flex items-center justify-center h-7 w-7 rounded transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
