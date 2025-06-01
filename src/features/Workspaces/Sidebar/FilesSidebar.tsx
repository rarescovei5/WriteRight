import { useAppSelector } from '@/app/hooks/hooks';
import { getFolderName } from '@/pages/Home';
import { useParams } from 'react-router-dom';
import FolderHierarchy from './FolderHierarchy';

const FilesSidebar = () => {
  const { workspacePath } = useParams();
  const { currentWorkspace } = useAppSelector((state) => state.workspaces);

  return (
    <>
      <h2 className="text-sm font-medium text-primary px-4 pt-4">{getFolderName(workspacePath!).toUpperCase()}</h2>
      <div className="py-4 flex flex-col !overflow-y-auto flex-1 scrollbar-hidden">
        <FolderHierarchy tree={currentWorkspace.workspaceTree.children} level={8} inset={24} showPreviews={false} />
      </div>
    </>
  );
};

export default FilesSidebar;
