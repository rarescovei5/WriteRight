import React from 'react';
import { useAppSelector } from '@/app/hooks/hooks';
import { FileText } from 'lucide-react';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

import { invoke } from '@tauri-apps/api/core';
import HyperMDEditor from './HyperMdEditor';

const Editor = () => {
  // Store
  const { selectedFilePath } = useAppSelector((state) => state.workspaces.currentWorkspace);

  // State & Refs
  const [text, setText] = React.useState<string>('');

  // Effects
  React.useEffect(() => {
    if (selectedFilePath === '') return;
    invoke<string>('read_file', { filePath: selectedFilePath }).then((fileContents) => setText(fileContents));
  }, [selectedFilePath]); // Load File Contents

  // Prompt open file
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

  // Editor
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ScrollArea className="flex-1 min-h-0">
        <HyperMDEditor value={text} onChange={setText} />
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};

export default Editor;
