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
    openedFilesPaths: [],
    selectedFilePath: '',
    workspaceTree: {} as WorkspaceTree,
  },
};

const isDev = process.env.NODE_ENV === 'development';

// async thunks
export const loadWorkspacesPaths = createAsyncThunk('workspaces/loadWorkspacesPaths', async () => {
  return await invoke<WorkspaceState['folders']>('load_workspaces');
});
export const loadWorkspace = createAsyncThunk('workspace/treeLoad', async (workspacePath: string) => {
  const workspacesInfo: WorkspacesInfo = JSON.parse(localStorage.getItem('workspace')!) || {};

  if (!workspacesInfo[workspacePath]) {
    workspacesInfo[workspacePath] = {
      openedFilesPaths: [],
      selectedFilePath: '',
    };
  }

  const { openedFilesPaths, selectedFilePath } = workspacesInfo[workspacePath];
  const workspaceTree = await invoke<WorkspaceTree>('get_folder_hierarchy', { folderPath: workspacePath });

  return {
    workspacePath,
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
    prepareWorkspaceClose(state, action: PayloadAction<{ workspacePath: string }>) {
      const { workspacePath } = action.payload;

      const workspacesInfo: WorkspacesInfo = JSON.parse(localStorage.getItem('workspacesInfo')!) || {};

      workspacesInfo[workspacePath] = state.currentWorkspace;

      localStorage.setItem('workspacesInfo', JSON.stringify(workspacesInfo));
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadWorkspacesPaths.fulfilled, (state, action) => {
      state.folders = action.payload;
      isDev && console.log(`Loaded workspaces paths:`, action.payload);
      state.loaded = true;
    });
    builder.addCase(loadWorkspace.fulfilled, (state, action) => {
      const { openedFilesPaths, selectedFilePath, workspaceTree } = action.payload;
      isDev && console.log(`Loaded workspace: ${action.payload.workspacePath}`, action.payload);
      state.currentWorkspace = {
        openedFilesPaths,
        selectedFilePath,
        workspaceTree,
      };
    });
  },
});

export const { updateWorkspaces, prepareWorkspaceClose } = workspaceSlice.actions;
export default workspaceSlice.reducer;
