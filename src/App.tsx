import React from 'react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Home from './pages/Home';
import Workspace from './pages/Workspace';

import { useAppDispatch } from './app/hooks/hooks';
import { loadWorkspacesPaths } from './app/workspaces/workspacesSlice';

import ExtensionsSidebar from '@/features/Workspaces/Sidebar/ExtensionsSidebar';
import FilesSidebar from '@/features/Workspaces/Sidebar/FilesSidebar';
import SearchSidebar from '@/features/Workspaces/Sidebar/SearchSidebar';

function App() {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(loadWorkspacesPaths());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/workspaces/:workspacePath" element={<Workspace />}>
          <Route path="files" element={<FilesSidebar />} />
          <Route path="search" element={<SearchSidebar />} />
          <Route path="extensions" element={<ExtensionsSidebar />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
