import React, { useRef, useState, useEffect, useMemo } from 'react';
import type { IToken } from 'vscode-textmate';

interface MarkdownLiveProps {
  text: string;
  onChange: (value: string) => void;
  tokenLines: IToken[][];
}

const MarkdownLive: React.FC<MarkdownLiveProps> = ({ text, onChange, tokenLines }) => {
  // Split text into lines
  const textLines = useMemo(() => text.split(/\r?\n/), [text]);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const [selection, setSelection] = useState({ start: 0, end: 0 });

  return (
    <div className="relative w-full h-full font-mono">
      <textarea
        ref={textareaRef}
        onChange={(e) => onChange(e.target.value)}
        value={text}
        className="absolute left-[-9999px] top-0 opacity-0"
        aria-hidden="true"
      />
      <div
        ref={previewRef}
        className="p-4 min-h-[300px] outline-none cursor-text whitespace-pre-wrap"
        contentEditable
        suppressContentEditableWarning
      >
        {text}
      </div>
    </div>
  );
};

export default MarkdownLive;
