import React from 'react';
import { useAppSelector } from '@/app/hooks/hooks';
import { FileText } from 'lucide-react';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

import { invoke } from '@tauri-apps/api/core';
import { useEditorRegistry } from '@/hooks/useAppRegistry';
import type { IGrammar, IToken } from 'vscode-textmate';
import MarkdownLive from './MarkdownLive';

const Editor = () => {
  // Store
  const { selectedFilePath } = useAppSelector((state) => state.workspaces.currentWorkspace);

  // Initialize Reigstry for tokenizing Markdown
  const { registry, loading: regLoading, error: regError } = useEditorRegistry();

  // State & Refs
  const [text, setText] = React.useState<string>('');
  const [tokenLines, setTokenLines] = React.useState<IToken[][]>([]);
  const tokenizeDebounceRef = React.useRef<NodeJS.Timeout>(null);
  const grammarRef = React.useRef<IGrammar | null>(null);

  // Effects
  React.useEffect(() => {
    if (selectedFilePath === '') return;
    invoke<string>('read_file', { filePath: selectedFilePath }).then((fileContents) => setText(fileContents));
  }, [selectedFilePath]); // Load File Contents
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
  }, [registry, regLoading]); // Load Markdown Grammar for Registry
  React.useEffect(() => {
    // TODO: Optimise retokenizing only what's changed
    if (!grammarRef.current) return;

    // Clear any pending timer whenever "text" changes
    if (tokenizeDebounceRef.current) {
      clearTimeout(tokenizeDebounceRef.current);
    }

    // Don’t immediately bail out if text is empty; we might want to clear tokens
    tokenizeDebounceRef.current = setTimeout(() => {
      const grammar = grammarRef.current!;
      const lines = text.split(/\r?\n/);
      const allTokens: IToken[][] = [];

      let ruleStack: any = null;
      for (const line of lines) {
        const result = grammar.tokenizeLine(line, ruleStack);
        allTokens.push(result.tokens);
        ruleStack = result.ruleStack;
      }

      setTokenLines(allTokens);
    }, 1000);

    return () => {
      if (tokenizeDebounceRef.current) {
        clearTimeout(tokenizeDebounceRef.current);
      }
    };
  }, [text]); // Tokenize Contents

  // Other helper UIS
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
  } else if (regLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Loading editor syntax...</p>
      </div>
    );
  } else if (regError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-2">Failed to initialize editor syntax.</p>
        <pre className="bg-gray-100 text-sm p-2 rounded">{String(regError)}</pre>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => {
            window.location.reload();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Editor
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ScrollArea className="flex-1 min-h-0">
        <MarkdownLive text={text} onChange={setText} tokenLines={tokenLines} />

        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};

export default Editor;
