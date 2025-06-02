import { useAppSelector } from '@/app/hooks/hooks';
import { FileText } from 'lucide-react';

const Editor = () => {
  const { selectedFilePath } = useAppSelector((state) => state.workspaces.currentWorkspace);

  if (selectedFilePath === '') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <h2 className="text-xl font-semibold">No file selected</h2>
          <p className="text-sm mt-1">Choose a markdown file from the explorer to start editing.</p>
        </div>
      </div>
    );
  }

  return <div className="px-20 flex-1"></div>;
};

export default Editor;
