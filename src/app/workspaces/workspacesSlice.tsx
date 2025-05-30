// workspaceSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { invoke } from '@tauri-apps/api/core';

type WorkspaceState = {
  folders: string[];
  loaded: boolean;
};

const initialState: WorkspaceState = {
  folders: [],
  loaded: false,
};

// async thunk to load the folders
export const loadOpenedFolders = createAsyncThunk('workspaces/loadOpenedFolders', async () => {
  return await invoke<WorkspaceState['folders']>('load_opened_folders');
});

const workspaceSlice = createSlice({
  name: 'workspaces',
  initialState,
  reducers: {
    updateWorkspaces(state, action: PayloadAction<{ updateKind: 'add' | 'remove'; path: string }>) {
      const { updateKind, path } = action.payload;
      switch (updateKind) {
        case 'add':
          if (!state.folders.includes(path)) {
            state.folders.push(path);
          }
          break;
        case 'remove':
          state.folders = state.folders.filter((val) => val !== path);
          break;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadOpenedFolders.fulfilled, (state, action) => {
      state.folders = action.payload;
      state.loaded = true;
    });
  },
});

export const { updateWorkspaces } = workspaceSlice.actions;
export default workspaceSlice.reducer;
