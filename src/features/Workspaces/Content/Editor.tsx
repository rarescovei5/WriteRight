import React from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/hooks';
import { FileText } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { updateOpenedFiles } from '@/app/workspaces/workspacesSlice';

const Editor = () => {
  const dispatch = useAppDispatch();
  const { selectedFilePath, openedFilesPaths } = useAppSelector((state) => state.workspaces.currentWorkspace);
  const [text, setText] = React.useState<string>('');

  React.useEffect(() => {
    if (selectedFilePath === '') return;
    invoke<string>('read_file', { filePath: selectedFilePath }).then((fileContents) => setText(fileContents));
  }, [selectedFilePath]);

  React.useEffect(() => {}, [text]);

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

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Word like Header for editing  */}
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
