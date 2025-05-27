import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Home from './pages/Home';
import Workspace from './pages/Workspace';
import Editor from './features/text_editor/Editor';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/workspace" element={<Workspace />}>
            <Route path="/:fileName" element={<Editor />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
