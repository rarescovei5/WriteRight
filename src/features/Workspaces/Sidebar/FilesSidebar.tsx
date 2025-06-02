import { useAppSelector } from '@/app/hooks/hooks';
import { getFolderName } from '@/pages/Home';
import { useParams } from 'react-router-dom';
import FolderHierarchy from '../../../components/layout/FolderHierarchy';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const FilesSidebar = () => {
  const { workspacePath } = useParams();
  const { currentWorkspace } = useAppSelector((state) => state.workspaces);

  return (
    <>
      <h2 className="text-sm font-medium text-primary px-4 pt-4">{getFolderName(workspacePath!).toUpperCase()}</h2>
      <ScrollArea className="py-4 flex flex-col flex-1 !overflow-auto">
        <FolderHierarchy tree={currentWorkspace.workspaceTree.children} level={8} inset={24} showPreviews={false} />
        <ScrollBar orientation="vertical" />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </>
  );
};

export default FilesSidebar;
