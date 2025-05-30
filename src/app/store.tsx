import { configureStore } from '@reduxjs/toolkit';
import workspacesReducer from './workspaces/workspacesSlice';

export const store = configureStore({
  reducer: { workspaces: workspacesReducer },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
