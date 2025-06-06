import { useParams } from 'react-router-dom';

import ContentWebview from '@/features/Workspaces/Content/ContentWebview';
import Titlebar from '@/components/layout/Titlebar';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

import React from 'react';
import { prepareWorkspaceClose, loadWorkspace } from '@/app/workspaces/workspacesSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks/hooks';
import FilesSidebar from '@/features/Workspaces/Sidebar/FilesSidebar';

const Workspace = () => {
  const dispatch = useAppDispatch();
  const isWorkspaceLoaded = useAppSelector((state) => state.workspaces.currentWorkspace.loaded);

  const { workspacePath } = useParams();

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
        <ResizablePanelGroup className="flex-1" direction="horizontal" autoSaveId={'Workspace-ResizeablePanelGroup'}>
          {/* Left Webview */}
          <ResizablePanel className="flex flex-col relative" defaultSize={20} maxSize={80}>
            <FilesSidebar />
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
