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

const isDev = process.env.NODE_ENV === 'development';

// async thunks
export const loadWorkspacesPaths = createAsyncThunk('workspaces/loadWorkspacesPaths', async () => {
  return await invoke<WorkspaceState['folders']>('load_workspaces');
});
export const loadWorkspace = createAsyncThunk('workspaces/workspaceLoad', async (workspacePath: string) => {
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
  },
  extraReducers: (builder) => {
    builder.addCase(loadWorkspacesPaths.fulfilled, (state, action) => {
      state.folders = action.payload;
      isDev && console.log(`Loaded workspaces paths:`, action.payload);
      state.loaded = true;
    });
    builder.addCase(loadWorkspace.fulfilled, (state, action) => {
      const { openedFilesPaths, selectedFilePath, workspaceTree } = action.payload;
      isDev && console.log(`Loaded workspace`, action.payload);
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
} = workspaceSlice.actions;
export default workspaceSlice.reducer;
