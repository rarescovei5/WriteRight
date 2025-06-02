import { openFile, updateOpenedFiles, type WorkspaceTree } from '@/app/workspaces/workspacesSlice';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { useAppDispatch, useAppSelector } from '@/app/hooks/hooks';

const FolderHierarchy = ({
  tree,
  level,
  inset = 24,
  showPreviews = false,
}: {
  tree: Array<WorkspaceTree>;
  level: number;
  inset?: number;
  showPreviews?: boolean;
}) => {
  if (!tree) return null;

  return (
    <>
      {tree.map((item) => (
        <TreeNode key={item.name + item.is_dir} item={item} level={level} inset={inset} showPreviews={showPreviews} />
      ))}
    </>
  );
};

const TreeNode = ({
  item,
  level,
  inset,
  showPreviews,
}: {
  item: WorkspaceTree;
  level: number;
  inset: number;
  showPreviews: boolean;
}) => {
  const [open, setOpen] = useState(true);
  const paddingLeft = `${level}px`;

  const dispatch = useAppDispatch();
  const { selectedFilePath } = useAppSelector((state) => state.workspaces.currentWorkspace);

  const handleOpen = (path: string) => {
    if (selectedFilePath !== item.path) {
      dispatch(openFile({ path }));
    } else {
      dispatch(updateOpenedFiles({ updateKind: 'add', path }));
    }
  };

  if (item.is_dir) {
    return (
      <div className="flex flex-col">
        <div
          className="flex items-center gap-1 px-2 py-2 cursor-pointer hover:bg-muted"
          style={{ paddingLeft }}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span className="text-sm font-medium text-primary">{item.name}</span>
        </div>
        {open && (
          <div>
            <FolderHierarchy tree={item.children} level={level + inset} inset={inset} showPreviews={showPreviews} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`px-2 py-2 cursor-pointer text-sm text-secondary-foreground transition-all duration-100 ${
        showPreviews && 'flex flex-col'
      } ${selectedFilePath === item.path ? 'bg-muted' : 'hover:bg-muted'}`}
      style={{ paddingLeft }}
      onClick={() => handleOpen(item.path)}
    >
      <span>{item.name}</span>
      {showPreviews && (
        <div className="mt-1 text-xs text-muted-foreground line-clamp-2 italic">
          {/* You can insert a real preview by loading content */}
          [Preview]
        </div>
      )}
    </div>
  );
};

export default FolderHierarchy;
