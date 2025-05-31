import { Link, Outlet, useLocation, useParams } from 'react-router-dom';

import Editor from '@/features/TextEditor/Editor';
import Titlebar from '@/features/Titlebar/Titlebar';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { Blocks, File, Search } from 'lucide-react';
import React from 'react';
import { prepareWorkspaceClose, loadWorkspace } from '@/app/workspaces/workspacesSlice';
import { useAppDispatch } from '@/app/hooks/hooks';

const Workspace = () => {
  const dispatch = useAppDispatch();
  const { workspacePath } = useParams();

  // For Sidebar Item Highlighting
  const location = useLocation();
  const isFiles = location.pathname.includes('/files');
  const isSearch = location.pathname.includes('/search');
  const isExtensions = location.pathname.includes('/extensions');

  React.useEffect(() => {
    if (!workspacePath) return;
    dispatch(loadWorkspace(workspacePath));
    return () => {
      prepareWorkspaceClose({ workspacePath });
    };
  }, [dispatch]);

  return (
    <div className="h-svh flex flex-col">
      <Titlebar />
      <div className="flex-1 flex flex-row">
        <aside className="border-r border-border flex flex-col h-full items-center justify-start">
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Link
                  className={`px-2 py-3 border-l ${isFiles ? 'border-primary' : 'border-transparent'}`}
                  to={`/workspaces/${encodeURIComponent(workspacePath!)}/files`}
                >
                  <File width={24} strokeWidth={1} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Files</TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Link
                  className={`px-2 py-3 border-l ${isSearch ? 'border-primary' : 'border-transparent'}`}
                  to={`/workspaces/${encodeURIComponent(workspacePath!)}/search`}
                >
                  <Search width={24} strokeWidth={1} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Search (Coming Soon)</TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Link
                  className={`px-2 py-3 border-l ${isExtensions ? 'border-primary' : 'border-transparent'}`}
                  to={`/workspaces/${encodeURIComponent(workspacePath!)}/extensions`}
                >
                  <Blocks width={24} strokeWidth={1} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Extensions (Coming Soon)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </aside>
        <ResizablePanelGroup className="flex-1" direction="horizontal" autoSaveId={'Home-ResizeablePanelGroup'}>
          {/* Left Webview */}
          <ResizablePanel
            className="flex flex-col !overflow-y-auto scrollbar-hidden flex-1"
            defaultSize={20}
            maxSize={80}
          >
            <Outlet />
          </ResizablePanel>
          <ResizableHandle />
          {/* Content Webview */}
          <ResizablePanel className="flex flex-col relative">
            <Editor />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Workspace;
