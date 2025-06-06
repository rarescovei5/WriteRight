import React from 'react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Home from './pages/Home';
import Workspace from './pages/Workspace';

import { useAppDispatch } from './app/hooks/hooks';
import { loadWorkspacesPaths } from './app/workspaces/workspacesSlice';

function App() {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(loadWorkspacesPaths());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/workspaces/:workspacePath" element={<Workspace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
