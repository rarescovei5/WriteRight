import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Provider } from 'react-redux';
import { store } from './app/store.tsx';

import './globals.css';
import App from './App.tsx';
import WorkspaceSyncEffect from './features/Sync/WorkspacesSyncEffect.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <WorkspaceSyncEffect />
    </Provider>
  </StrictMode>
);
