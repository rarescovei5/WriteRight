import { useAppDispatch, useAppSelector } from '@/app/hooks/hooks';
import { getFolderName } from '@/pages/Home';
import { useParams } from 'react-router-dom';
import FolderHierarchy from '../../../components/layout/FolderHierarchy';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { FilePlus, FolderPlus } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { addNode } from '@/app/workspaces/workspacesSlice';

const FilesSidebar = () => {
  const dispatch = useAppDispatch();
  const { workspacePath } = useParams();
  const { currentWorkspace } = useAppSelector((state) => state.workspaces);

  const addChildHandler = async (isDir: boolean) => {
    const namePrompt = isDir ? 'New folder name:' : 'New file name:';
    const newName = await window.prompt(namePrompt, isDir ? 'NewFolder' : 'NewFile.md');
    if (!newName || !newName.trim()) return;
    const parentPath = workspacePath!;
    try {
      if (isDir) {
        await invoke('create_directory', { path: parentPath + '/' + newName });
      } else {
        await invoke('create_file', { folderPath: parentPath, fileName: newName });
      }
      // Dispatch into Redux so the tree updates immediately:
      dispatch(
        addNode({
          parentPath,
          name: newName,
          is_dir: isDir,
        })
      );
      // If you want the newly created file to be opened automatically:
      // if (!isDir) dispatch(openFile({ path: `${parentPath}/${newName}` }));
    } catch (e) {
      console.error('Create child failed:', e);
      window.alert('Could not create. Check console.');
    }
  };

  return (
    <>
      <div className="px-4 pt-4 flex justify-between items-center">
        <h2 className="text-sm font-medium text-primary overflow-ellipsis flex-1 truncate">
          {getFolderName(workspacePath!).toUpperCase()}
        </h2>
        <div className="flex gap-1">
          <button
            className="cursor-pointer hover:bg-muted grid place-content-center w-6 h-6 rounded-sm"
            onClick={() => addChildHandler(false)}
          >
            <FilePlus height={16} className="stroke-foreground/50" />
          </button>
          <button
            className="cursor-pointer hover:bg-muted grid place-content-center w-6 h-6 rounded-sm"
            onClick={() => addChildHandler(true)}
          >
            <FolderPlus height={16} className="stroke-foreground/50" />
          </button>
        </div>
      </div>
      <ScrollArea className="py-4 flex flex-col flex-1 !overflow-auto">
        <FolderHierarchy tree={currentWorkspace.workspaceTree.children} level={8} inset={24} showPreviews={false} />

        <ScrollBar orientation="vertical" />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </>
  );
};

export default FilesSidebar;
