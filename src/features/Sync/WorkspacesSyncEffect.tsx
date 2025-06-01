import { useAppSelector } from '@/app/hooks/hooks';
import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export default function WorkspaceSyncEffect() {
  const { folders, loaded } = useAppSelector((state) => state.workspaces);

  useEffect(() => {
    if (!loaded) return;

    // Debounce
    const timeout = setTimeout(() => {
      invoke('save_workspaces', { folders: folders }).catch((err) => console.error('Failed to save workspaces:', err));
    }, 500);

    return () => clearTimeout(timeout);
  }, [folders, loaded]);

  return null; // no UI since this is only for functional purposes
}
