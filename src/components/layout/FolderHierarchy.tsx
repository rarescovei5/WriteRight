// src/components/FolderHierarchy.tsx
import {
  openFile,
  updateOpenedFiles,
  addNode,
  removeNode,
  renameNode,
  type WorkspaceTree,
} from '@/app/workspaces/workspacesSlice';
import { ChevronDown, ChevronRight, File } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/hooks';
import { invoke } from '@tauri-apps/api/core';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuItem,
  ContextMenuSeparator,
} from '../ui/context-menu';
import { useParams } from 'react-router-dom';

interface FolderHierarchyProps {
  tree: WorkspaceTree[];
  level: number;
  inset?: number;
  showPreviews?: boolean;
}

const FolderHierarchy = ({ tree, level, inset = 24, showPreviews = false }: FolderHierarchyProps) => {
  if (!tree) return null;
  return (
    <>
      {tree.map((item) => (
        <TreeNode key={item.path} item={item} level={level} inset={inset} showPreviews={showPreviews} />
      ))}
    </>
  );
};

interface TreeNodeProps {
  item: WorkspaceTree;
  level: number;
  inset: number;
  showPreviews: boolean;
}

const TreeNode = ({ item, level, inset, showPreviews }: TreeNodeProps) => {
  const { workspacePath: workspaceRoot } = useParams();
  const [open, setOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(item.name);

  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const { selectedFilePath } = useAppSelector((s) => s.workspaces.currentWorkspace);

  const paddingLeft = `${level}px`;

  const handleOpenFile = (path: string) => {
    if (selectedFilePath !== path) {
      dispatch(openFile({ path }));
    } else {
      dispatch(updateOpenedFiles({ updateKind: 'add', path }));
    }
  };

  const startRename = () => {
    setTempName(item.name);
    setIsEditing(true);
  };

  const submitRename = async () => {
    const newName = tempName.trim();
    const oldName = item.name;
    const oldPath = item.path;

    if (!newName || newName === oldName) {
      setTempName(oldName);
      setIsEditing(false);
      return;
    }

    try {
      if (item.is_dir) {
        await invoke('rename_folder', { workspaceRoot, oldPath, newName });
      } else {
        await invoke('rename_file', { workspaceRoot, oldPath, newName });
      }

      dispatch(renameNode({ oldPath, newName }));
    } catch (e) {
      console.error('Rename failed:', e);
      window.alert('Could not rename. Reverting.');
      setTempName(oldName);
    }
    setIsEditing(false);
  };

  const onKeyDownRename = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setTempName(item.name);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();

        const val = inputRef.current.value;
        inputRef.current.setSelectionRange(val.length, val.length);
      }
    }, 100);
  }, [isEditing]);

  const deleteNodeHandler = async () => {
    const confirm = await window.confirm(
      `Are you sure you want to delete ${item.is_dir ? 'folder' : 'file'} “${item.name}”?`
    );
    if (!confirm) return;

    try {
      if (item.is_dir) {
        await invoke('delete_directory', { workspaceRoot, folderPath: item.path });
      } else {
        await invoke('delete_file', { workspaceRoot, filePath: item.path });
      }
      // Now remove it from the in-memory tree
      dispatch(removeNode({ targetPath: item.path }));
    } catch (e) {
      console.error('Delete failed:', e);
      window.alert('Could not delete. Check console.');
    }
  };

  const addChildHandler = async (isDir: boolean) => {
    const namePrompt = isDir ? 'New folder name:' : 'New file name:';
    const newName = await window.prompt(namePrompt, isDir ? 'NewFolder' : 'NewFile.md');
    if (!newName || !newName.trim()) return;
    const parentPath = item.path;
    try {
      if (isDir) {
        await invoke('create_directory', {
          workspaceRoot,
          folderPath: parentPath,
          newFolderName: parentPath + '/' + newName,
        });
      } else {
        await invoke('create_file', { workspaceRoot, folderPath: parentPath, fileName: newName });
      }

      dispatch(
        addNode({
          parentPath,
          name: newName,
          is_dir: isDir,
        })
      );
    } catch (e) {
      console.error('Create child failed:', e);
      window.alert('Could not create. Check console.');
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Render a directory node
  // ───────────────────────────────────────────────────────────────────────────

  if (item.is_dir) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className="flex items-center gap-1 px-2 py-2 cursor-pointer hover:bg-muted"
            style={{ paddingLeft }}
            onClick={() => {
              if (!isEditing) setOpen((prev) => !prev);
            }}
          >
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}

            <input
              ref={inputRef}
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={onKeyDownRename}
              onBlur={submitRename}
              className={`${isEditing ? '' : 'hidden'} px-1 py-0.5 rounded-sm text-sm outline-none`}
            />

            <span className={`${isEditing ? 'hidden' : ''} text-sm font-medium text-primary truncate`}>
              {item.name}
            </span>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuLabel>Folder Actions</ContextMenuLabel>
          <ContextMenuItem
            onSelect={() => {
              setTimeout(() => startRename(), 0);
            }}
          >
            Rename
          </ContextMenuItem>
          <ContextMenuItem onSelect={deleteNodeHandler} className="text-red-600">
            Delete
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={() => addChildHandler(false)}>New File</ContextMenuItem>
          <ContextMenuItem onSelect={() => addChildHandler(true)}>New Folder</ContextMenuItem>
        </ContextMenuContent>

        {open && (
          <div>
            <FolderHierarchy tree={item.children} level={level + inset} inset={inset} showPreviews={showPreviews} />
          </div>
        )}
      </ContextMenu>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Render a file node
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={`flex items-center px-2 py-2 cursor-pointer text-sm text-secondary-foreground transition-all duration-100 ${
            showPreviews ? 'flex-col' : ''
          } ${selectedFilePath === item.path ? 'bg-muted' : 'hover:bg-muted'}`}
          style={{ paddingLeft }}
          onClick={() => {
            if (!isEditing) handleOpenFile(item.path);
          }}
        >
          <File size={16} className="mr-1" />

          <input
            ref={inputRef}
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={onKeyDownRename}
            onBlur={submitRename}
            className={`${isEditing ? '' : 'hidden'} px-1 py-0.5 rounded-sm text-sm outline-none`}
          />

          <span className={`${isEditing ? 'hidden' : ''} text-sm`}>{item.name}</span>

          {showPreviews && <div className="mt-1 text-xs text-muted-foreground line-clamp-2 italic">[Preview]</div>}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuLabel>File Actions</ContextMenuLabel>
        <ContextMenuItem
          onSelect={() => {
            setTimeout(() => startRename(), 0);
          }}
        >
          Rename
        </ContextMenuItem>
        <ContextMenuItem onSelect={deleteNodeHandler} className="text-red-600">
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default FolderHierarchy;
