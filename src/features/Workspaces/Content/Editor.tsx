import React from 'react';
import { useAppSelector } from '@/app/hooks/hooks';

import { invoke } from '@tauri-apps/api/core';
import HyperMDEditor from './HyperMDEditor';
import FileSync from '@/features/Sync/FileSync';

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

  // Editor
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <HyperMDEditor value={text} onChange={setText} />
      <FileSync text={text} filePath={selectedFilePath} />
    </div>
  );
};

export default Editor;
