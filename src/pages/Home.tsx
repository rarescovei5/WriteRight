import { invoke } from '@tauri-apps/api/core';

import Titlebar from '@/features/Titlebar/Titlebar';
import AddWorkspace from '@/features/Home/AddWorkspace';

import { Input } from '@/components/ui/input';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Calendar, ChartColumnIcon, Folder, Search, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

const Home = () => {
  const [file, setFile] = useState<any>(null);

  useEffect(() => {
    if (!file) return;
    console.log(file);
    invoke('get_folder_hierarchy', { folderPath: file }).then((res) => console.log(res));
  }, [file]);

  return (
    <div className="h-svh flex flex-col">
      <Titlebar />
      <ResizablePanelGroup className="flex-1" direction="horizontal" autoSaveId={'Home-ResizeablePanelGroup'}>
        {/* Aside */}
        <ResizablePanel
          className="flex flex-col !overflow-y-auto scrollbar-hidden flex-1"
          defaultSize={20}
          minSize={15}
          maxSize={30}
        >
          {/* Search Through Categories  */}
          <div className="relative border-b border-border p-4">
            <Input className="peer transition-[padding] pl-8 focus:pl-3" placeholder="Search..." />
            <Search className="absolute top-1/2 -translate-y-1/2 left-7 block peer-focus:hidden" width={16} />
          </div>
          {/* Projects/Folders Section  */}
          <div className="relative border-b border-border p-4">
            <div className="flex flex-row gap-2 ">
              <Folder width={16} /> <h3>Projects</h3>
            </div>
          </div>
          {/* Pinned Section  */}
          <div className="relative border-b border-border p-4">
            <div className="flex flex-row gap-2 ">
              <Star width={16} /> <h3>Pinned</h3>
            </div>
          </div>

          {/* Projects/Folders Section  */}
          <div className="relative border-b border-border p-4">
            <div className="flex flex-row gap-2 ">
              <Calendar width={16} /> <h3>Calendar</h3>
            </div>
          </div>

          {/* Activity Section  */}
          <div className="relative p-4">
            <div className="flex flex-row gap-2 ">
              <ChartColumnIcon width={16} /> <h3>Activity</h3>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        {/* Main */}
        <ResizablePanel className="p-4 relative">
          <h1 className="font-bold text-2xl mb-4">Workspaces</h1>
          <div
            style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,200px))', gridTemplateRows: '300px' }}
            className="grid gap-4"
          ></div>
          <AddWorkspace setFile={setFile} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Home;
