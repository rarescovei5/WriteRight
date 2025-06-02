import { Link, Outlet, useLocation, useParams } from 'react-router-dom';

import ContentWebview from '@/features/Workspaces/Content/ContentWebview';
import Titlebar from '@/components/layout/Titlebar';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { Blocks, File, Search } from 'lucide-react';
import React from 'react';
import { prepareWorkspaceClose, loadWorkspace } from '@/app/workspaces/workspacesSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks/hooks';

const Workspace = () => {
  const dispatch = useAppDispatch();
  const isWorkspaceLoaded = useAppSelector((state) => state.workspaces.currentWorkspace.loaded);

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
      isWorkspaceLoaded && dispatch(prepareWorkspaceClose({ workspacePath }));
    };
  }, [dispatch]);

  return (
    <div className="h-svh flex flex-col">
      <Titlebar />
      <div className="flex flex-row flex-1 min-h-0">
        <aside className="border-r flex flex-col h-full items-center justify-start">
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Link
                  className={`px-2 py-3 border-l ${isFiles ? 'border-primary' : 'border-transparent'}`}
                  to={`/workspaces/${encodeURIComponent(workspacePath!)}/files`}
                >
                  <File size={24} strokeWidth={1} />
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
                  <Search size={24} strokeWidth={1} />
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
                  <Blocks size={24} strokeWidth={1} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Extensions (Coming Soon)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </aside>
        <ResizablePanelGroup className="flex-1" direction="horizontal">
          {/* Left Webview */}
          <ResizablePanel className="flex flex-col relative" defaultSize={20} maxSize={80}>
            <Outlet />
          </ResizablePanel>
          <ResizableHandle />
          {/* Content Webview */}
          <ResizablePanel className="flex flex-col relative">
            <ContentWebview />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Workspace;
