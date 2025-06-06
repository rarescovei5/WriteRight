import { invoke } from '@tauri-apps/api/core';
import React from 'react';

const FileSync = ({ text, filePath }: { text: string; filePath: string }) => {
  const mountedRef = React.useRef<boolean>(false);
  const debounceRef = React.useRef<NodeJS.Timeout>(null);

  React.useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    // Clear any pending saves
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      invoke('save_file', { filePath, newContent: text }).catch(console.error);
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text]);

  return null;
};

export default FileSync;
