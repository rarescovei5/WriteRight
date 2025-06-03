import React from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/hooks';
import { FileText } from 'lucide-react';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { updateOpenedFiles } from '@/app/workspaces/workspacesSlice';

import { invoke } from '@tauri-apps/api/core';
import { useEditorRegistry } from '@/hooks/useAppRegistry';
import type { IGrammar, IToken } from 'vscode-textmate';

const scopeToClass = {
  'markup.bold.markdown': 'font-bold',
  'markup.italic.markdown': 'italic',
  'markup.inline.raw.markdown': 'bg-zinc-100 px-1 rounded font-mono text-sm',
  'heading.1.markdown': 'text-3xl font-bold',
  'heading.2.markdown': 'text-2xl font-bold',
  'heading.3.markdown': 'text-xl font-bold',
  'markup.list.markdown': 'list-disc ml-6',
};

const Editor = () => {
  const dispatch = useAppDispatch();
  const { selectedFilePath, openedFilesPaths } = useAppSelector((state) => state.workspaces.currentWorkspace);
  const [text, setText] = React.useState<string>('');

  // Load Text
  React.useEffect(() => {
    if (selectedFilePath === '') return;
    invoke<string>('read_file', { filePath: selectedFilePath }).then((fileContents) => setText(fileContents));
  }, [selectedFilePath]);

  // VSC-TEXTMATE
  const { registry, loading: regLoading, error } = useEditorRegistry();
  const grammarRef = React.useRef<IGrammar | null>(null);
  const [tokenLines, setTokenLines] = React.useState<IToken[][]>();

  // Load Grammar
  React.useEffect(() => {
    if (!registry || regLoading) return;

    const load = async () => {
      const grammar = await registry.loadGrammar('text.html.markdown');
      if (!grammar) {
        console.warn('Grammar not found!');
        return;
      }
      grammarRef.current = grammar;
    };

    load();
  }, [registry, regLoading]);

  // Tokenzie Lines
  React.useEffect(() => {
    if (!grammarRef.current || !text) return;

    const grammar = grammarRef.current;
    const lines = text.split(/\r?\n/);
    const allTokens = [];

    let ruleStack = null;
    for (const line of lines) {
      const result = grammar.tokenizeLine(line, ruleStack);
      allTokens.push(result.tokens);
      ruleStack = result.ruleStack;
    }

    setTokenLines(allTokens);
    console.log(text, allTokens);
  }, [text]);

  if (selectedFilePath === '') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <h2 className="text-xl font-semibold">No file selected</h2>
          <p className="text-sm mt-1">Choose a markdown file from the explorer to start editing.</p>
        </div>
      </div>
    );
  }

  if (regLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Loading editor syntax...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Actual Markdown Content  */}
      <ScrollArea className="flex-1 min-h-0 @container">
        <div
          className="whitespace-pre-wrap break-all focus:outline-none @3xl:w-[700px] @3xl:mx-auto px-9 mt-[40px] pb-[400px]"
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => {
            if (!openedFilesPaths.includes(selectedFilePath))
              dispatch(updateOpenedFiles({ updateKind: 'add', path: selectedFilePath }));
            const target = e.currentTarget as HTMLDivElement;
            setText(target.textContent || '');
          }}
        >
          {text}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};

export default Editor;
