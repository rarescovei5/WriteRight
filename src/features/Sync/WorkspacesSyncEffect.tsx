import { useAppSelector } from '@/app/hooks/hooks';
import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export default function WorkspaceSyncEffect() {
  const { folders, loaded } = useAppSelector((state) => state.workspaces);

  useEffect(() => {
    if (!loaded) return;

    console.log('Loaded');

    console.log('Trying to save');
    // Debounce
    const timeout = setTimeout(() => {
      invoke('save_opened_folders', { folders: folders })
        .then(() => console.log('Workspaces saved!'))
        .catch((err) => console.error('Failed to save workspaces:', err));
    }, 500);

    return () => clearTimeout(timeout);
  }, [folders, loaded]);

  return null; // no UI since this is only for functional purposes
}
