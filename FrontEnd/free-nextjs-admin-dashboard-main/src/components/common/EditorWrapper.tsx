"use client";

import React, { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

interface EditorWrapperProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  placeholder?: string;
}

export default function EditorWrapper({
  value,
  onChange,
  height = 500,
  placeholder = "اكتب محتوى المقال هنا...",
}: EditorWrapperProps) {
  const editorRef = useRef<any>(null);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xs">
      <Editor
        apiKey="7vpq23klawh2g0wn1s5ql3be8hwd186kf1bfb2j21fnfvoaq"
        onInit={(_evt, editor) => {
          editorRef.current = editor;
        }}
        value={value}
        init={{
          height: height,
          menubar: "file edit view insert format tools table help",
          directionality: "rtl",
          language: "ar",
          forced_root_block: "p",
          valid_elements: "*[*]",
          placeholder: placeholder,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks fontfamily fontsize | bold italic underline forecolor backcolor | " +
            "alignright aligncenter alignleft alignjustify | bullist numlist outdent indent | " +
            "link image media table blockquote | removeformat | fullscreen preview code",
          content_style:
            "body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; font-size: 15px; direction: rtl; text-align: right; line-height: 1.8; color: #1f2937; padding: 12px; } " +
            "h1, h2, h3, h4 { color: #3F4A2B; font-weight: bold; } " +
            "blockquote { border-right: 4px solid #3F4A2B; margin-right: 0; padding-right: 12px; font-style: italic; background: #fafaf5; padding: 8px 12px; border-radius: 6px; }",
          image_advtab: true,
          automatic_uploads: true,
          file_picker_types: "image",
          images_upload_handler: (blobInfo: any) =>
            new Promise((resolve, reject) => {
              // Convert to Base64 data URL for self-contained image storage
              try {
                const reader = new FileReader();
                reader.readAsDataURL(blobInfo.blob());
                reader.onloadend = () => {
                  resolve(reader.result as string);
                };
                reader.onerror = () => {
                  reject("فشل تحميل الصورة");
                };
              } catch (e: any) {
                reject(e?.message || "فشل معالجة الصورة");
              }
            }),
        }}
        onEditorChange={(newContent) => onChange(newContent)}
      />
    </div>
  );
}
