// workspaceSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { invoke } from '@tauri-apps/api/core';

export type WorkspaceTree = {
  name: string;
  path: string;
  is_dir: boolean;
  children: Array<WorkspaceTree>;
};

type WorkspaceState = {
  folders: Array<string>;
  loaded: boolean;
  currentWorkspace: {
    loaded: boolean;
    openedFilesPaths: Array<string>;
    selectedFilePath: string;
    workspaceTree: WorkspaceTree;
  };
};
type WorkspacesInfo = {
  [workspacePath: string]: {
    openedFilesPaths: Array<string>;
    selectedFilePath: string;
  };
};

const initialState: WorkspaceState = {
  folders: [],
  loaded: false,
  currentWorkspace: {
    loaded: false,
    openedFilesPaths: [],
    selectedFilePath: '',
    workspaceTree: {} as WorkspaceTree,
  },
};

// Helper functions
function hInsertNode(treeNode: WorkspaceTree, parentPath: string, newNode: WorkspaceTree): boolean {
  // If this node’s path matches parentPath, push newNode into its children
  if (treeNode.path === parentPath && treeNode.is_dir) {
    treeNode.children.push(newNode);
    return true;
  }

  // Otherwise, descend into each child
  if (!Array.isArray(treeNode.children)) {
    return false;
  }
  for (let child of treeNode.children) {
    const inserted = hInsertNode(child, parentPath, newNode);
    if (inserted) return true;
  }

  return false;
}
function hDeleteNode(treeNode: WorkspaceTree, targetPath: string): boolean {
  if (!Array.isArray(treeNode.children)) {
    return false;
  }

  // First, try to remove child(s) at this level
  const idx = treeNode.children.findIndex((child) => child.path === targetPath);
  if (idx !== -1) {
    // Found: remove exactly that one child, then return true
    treeNode.children.splice(idx, 1);
    return true;
  }

  // Otherwise, recurse into children
  for (let child of treeNode.children) {
    const deleted = hDeleteNode(child, targetPath);
    if (deleted) return true;
  }

  return false;
}
function hRenameNode(treeNode: WorkspaceTree, oldPath: string, newName: string): boolean {
  if (treeNode.path === oldPath) {
    // We found the node to rename. Compute its parent folder by stripping off "/oldName"
    const parentPath = treeNode.path.substring(0, treeNode.path.lastIndexOf('/') + 1);
    // E.g. "/Users/me/project/src/components/"
    const newFullPath = parentPath + newName;

    // Keep track of old prefix so we can fix children paths
    const oldPrefix = treeNode.path + (treeNode.is_dir ? '/' : '');

    // Update this node's own name & path. For a folder, we do not add a trailing slash on `path`.
    treeNode.name = newName;
    treeNode.path = newFullPath;

    // Now update every descendant's `path` to replace oldPrefix with newFullPath + "/"
    const fixDescendantPaths = (node: WorkspaceTree) => {
      if (!Array.isArray(node.children)) {
        return false;
      }
      for (let child of node.children) {
        // If oldPrefix ends with '/', ensure we replace consistently
        if (child.path.startsWith(oldPrefix)) {
          const suffix = child.path.substring(oldPrefix.length);
          const newChildPath = newFullPath + (treeNode.is_dir ? '/' : '') + suffix;
          child.path = newChildPath;
        }
        // Recurse
        fixDescendantPaths(child);
      }
    };
    fixDescendantPaths(treeNode);
    return true;
  }

  // Descend into children
  if (!Array.isArray(treeNode.children)) {
    return false;
  }
  for (let child of treeNode.children) {
    const renamed = hRenameNode(child, oldPath, newName);
    if (renamed) return true;
  }

  return false;
}

// async thunks
export const loadWorkspacesPaths = createAsyncThunk('workspaces/loadWorkspacesPaths', async () => {
  return await invoke<WorkspaceState['folders']>('load_workspaces');
});
export const loadWorkspace = createAsyncThunk('workspaces/loadWorkspace', async (workspacePath: string) => {
  const workspacesInfo: WorkspacesInfo = JSON.parse(localStorage.getItem('workspacesInfo')!) || {};

  if (!workspacesInfo[workspacePath]) {
    workspacesInfo[workspacePath] = {
      openedFilesPaths: [],
      selectedFilePath: '',
    };
  }

  const { openedFilesPaths, selectedFilePath } = workspacesInfo[workspacePath];
  const workspaceTree = await invoke<WorkspaceTree>('get_folder_hierarchy', { folderPath: workspacePath });

  return {
    openedFilesPaths,
    selectedFilePath,
    workspaceTree,
  };
});

const workspaceSlice = createSlice({
  name: 'workspaces',
  initialState,
  reducers: {
    updateWorkspaces(state, action: PayloadAction<{ updateKind: 'add' | 'remove'; path: string }>) {
      const { updateKind, path } = action.payload;
      switch (updateKind) {
        case 'add':
          const existingIndex = state.folders.indexOf(path);

          // Check for parent path
          const parentIndex = state.folders.findIndex((existingPath) => path.startsWith(existingPath));

          // Check for child path
          const childIndexes = state.folders
            .map((existingPath, index) => ({ existingPath, index }))
            .filter(({ existingPath }) => existingPath.startsWith(path))
            .map(({ index }) => index);

          // Skip if exact match already exists
          if (existingIndex !== -1) break;

          // Replace parent with this more specific path
          if (parentIndex !== -1) {
            state.folders[parentIndex] = path;
            break;
          }

          // Replace all child paths with this broader one
          if (childIndexes.length > 0) {
            // Remove all children
            state.folders = state.folders.filter((_, i) => !childIndexes.includes(i));
            state.folders.push(path);
            break;
          }

          // If no parent or child conflicts, just add
          state.folders.push(path);

          break;
        case 'remove':
          state.folders = state.folders.filter((val) => val !== path);
          break;
      }
    },
    updateOpenedFiles(state, action: PayloadAction<{ updateKind: 'add' | 'remove'; path: string }>) {
      const { updateKind, path } = action.payload;

      switch (updateKind) {
        case 'add':
          if (!state.currentWorkspace.openedFilesPaths.includes(path))
            state.currentWorkspace.openedFilesPaths.push(path);
          break;
        case 'remove':
          state.currentWorkspace.openedFilesPaths = state.currentWorkspace.openedFilesPaths.filter(
            (existingPaths) => existingPaths !== path
          );
          break;
      }
    },
    openFile(state, action: PayloadAction<{ path: string }>) {
      state.currentWorkspace.selectedFilePath = action.payload.path;
    },

    prepareWorkspaceClose(state, action: PayloadAction<{ workspacePath: string }>) {
      const { workspacePath } = action.payload;

      const workspacesInfo: WorkspacesInfo = JSON.parse(localStorage.getItem('workspacesInfo')!) || {};

      const { openedFilesPaths, selectedFilePath } = state.currentWorkspace;

      workspacesInfo[workspacePath] = { openedFilesPaths, selectedFilePath };

      localStorage.setItem('workspacesInfo', JSON.stringify(workspacesInfo));

      state.currentWorkspace.loaded = false;
    },

    addNode(state, action: PayloadAction<{ parentPath: string; name: string; is_dir: boolean }>) {
      const { parentPath, name, is_dir } = action.payload;
      // Build the full path for the new node
      const newPath = parentPath.endsWith('/') ? parentPath + name : parentPath + '/' + name;

      const newNode: WorkspaceTree = {
        name,
        path: newPath,
        is_dir,
        children: [],
      };

      // Insert it into the in-memory workspaceTree
      hInsertNode(state.currentWorkspace.workspaceTree, parentPath, newNode);
    },
    removeNode(state, action: PayloadAction<{ targetPath: string }>) {
      const { targetPath } = action.payload;
      hDeleteNode(state.currentWorkspace.workspaceTree, targetPath);
    },
    renameNode(state, action: PayloadAction<{ oldPath: string; newName: string }>) {
      const { oldPath, newName } = action.payload;
      hRenameNode(state.currentWorkspace.workspaceTree, oldPath, newName);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadWorkspacesPaths.fulfilled, (state, action) => {
      state.folders = action.payload;

      state.loaded = true;
    });
    builder.addCase(loadWorkspace.fulfilled, (state, action) => {
      const { openedFilesPaths, selectedFilePath, workspaceTree } = action.payload;

      state.currentWorkspace = {
        loaded: true,
        openedFilesPaths,
        selectedFilePath,
        workspaceTree,
      };
    });
  },
});

export const {
  // App
  updateWorkspaces, // Update Workspaces shown on Home screen

  // Workspace
  updateOpenedFiles, // Add / Remove from opened file tabs
  openFile, // The current displayed file in the editor
  prepareWorkspaceClose, // Save things for UX

  addNode,
  removeNode,
  renameNode,
} = workspaceSlice.actions;
export default workspaceSlice.reducer;
