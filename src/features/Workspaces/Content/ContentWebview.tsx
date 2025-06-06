import { useAppSelector } from '@/app/hooks/hooks';
import TabList from '@/components/layout/TabList';
import Editor from './Editor';
import { FileText } from 'lucide-react';

const ContentWebview = () => {
  const { selectedFilePath } = useAppSelector((state) => state.workspaces.currentWorkspace);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TabList />
      {!selectedFilePath ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <h2 className="text-xl font-semibold">No file selected</h2>
            <p className="text-sm mt-1">Choose a markdown file from the explorer to start editing.</p>
          </div>
        </div>
      ) : !selectedFilePath.startsWith('%CUSTOM%') ? (
        <Editor />
      ) : (
        <></>
      )}
    </div>
  );
};

export default ContentWebview;
