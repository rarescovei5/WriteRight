import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Home from './pages/Home';
import WorkspaceLayout from './pages/WorkspaceLayout';
import Editor from './features/TextEditor/Editor';
import NoEditor from './features/TextEditor/NoEditor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/workspace" element={<WorkspaceLayout />}>
          <Route index element={<NoEditor />} />
          <Route path=":fileName" element={<Editor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
