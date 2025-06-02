import { useAppDispatch, useAppSelector } from '@/app/hooks/hooks';
import { openFile, updateOpenedFiles } from '@/app/workspaces/workspacesSlice';
import { X } from 'lucide-react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

export function getFolderName(path: string) {
  return path.substring(path.lastIndexOf('\\') + 1);
}

const TabList = () => {
  const dispatch = useAppDispatch();
  const { openedFilesPaths, selectedFilePath } = useAppSelector((state) => state.workspaces.currentWorkspace);

  return (
    <ScrollArea className="w-full">
      <div className="flex flex-row min-h-6">
        {openedFilesPaths.map((filePath, idx) => (
          <div
            key={idx}
            className={`${
              selectedFilePath === filePath ? 'border-t-foreground border-b-transparent' : 'border-b-border'
            } flex items-center gap-2 relative group cursor-pointer border-b border-t border-r border-r-border py-1 pr-6 pl-3`}
            onClick={() => dispatch(openFile({ path: filePath }))}
          >
            <span className="">{getFolderName(filePath)}</span>
            <button
              className="p-1 hidden group-hover:flex justify-center items-center hover:bg-muted rounded-md absolute right-1 top-1/2 -translate-y-1/2"
              onClick={(e) => {
                e.stopPropagation();
                const isCurrentTab = selectedFilePath === filePath;
                dispatch(updateOpenedFiles({ updateKind: 'remove', path: filePath }));
                if (isCurrentTab) {
                  const nextFilePath = openedFilesPaths[idx + 1] ?? openedFilesPaths[idx - 1] ?? '';
                  dispatch(openFile({ path: nextFilePath }));
                }
              }}
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {selectedFilePath && !openedFilesPaths.includes(selectedFilePath) && (
          <div
            className="flex items-center gap-2 relative border-y group cursor-pointer border-r border-b-transparent border-t-foreground border-r-border py-1 px-2 italic"
            onClick={() => dispatch(updateOpenedFiles({ updateKind: 'add', path: selectedFilePath }))}
          >
            <span className="pr-5">{getFolderName(selectedFilePath)}</span>
            <button
              className="p-1 hidden group-hover:flex justify-center items-center hover:bg-muted rounded-md absolute right-1 top-1/2 -translate-y-1/2"
              onClick={(e) => {
                e.stopPropagation();
                const nextFilePath =
                  openedFilesPaths[openedFilesPaths.length - 1] ?? openedFilesPaths[openedFilesPaths.length - 1] ?? '';
                dispatch(openFile({ path: nextFilePath }));
              }}
            >
              <X size={12} />
            </button>
          </div>
        )}
        <div className="flex-1 border-b" />
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default TabList;
