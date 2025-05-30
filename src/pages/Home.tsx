import React from 'react';

import Titlebar from '@/features/Titlebar/Titlebar';
import AddWorkspace from '@/features/Home/AddWorkspace';

import { Input } from '@/components/ui/input';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Calendar, ChartColumnIcon, Search, Star } from 'lucide-react';
import { useAppSelector } from '@/app/hooks/hooks';

function getFolderName(path: string) {
  return path.substring(path.lastIndexOf('\\') + 1);
}

const Home = () => {
  const folders = useAppSelector((state) => state.workspaces.folders);

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
        <ResizablePanel className=" relative">
          <h1 className="font-bold text-2xl p-4">Workspaces</h1>
          <div
            style={{
              gridTemplateColumns: `repeat(auto-fit,minmax(200px,${
                folders.length >= 4 || window.innerWidth < 864 ? '1fr' : '250px'
              }))`,
              gridAutoRows: '350px',
            }}
            className="grid gap-4 h-full scrollbar-hidden !overflow-y-auto p-4"
          >
            {folders.map((folder, idx) => (
              <div key={idx} className="flex flex-col text-left">
                <h3 className="font-medium mb-2">{getFolderName(folder)}</h3>
                <button className="flex-1 cursor-pointer">
                  <div className="bg-foreground h-full rounded-xs hover:opacity-95 hover:scale-99 transition-[scale_opacity]"></div>
                </button>
              </div>
            ))}
          </div>
          <AddWorkspace />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Home;
