import { useAppSelector } from '@/app/hooks/hooks';
import TabList from '@/components/layout/TabList';
import Editor from './Editor';

const ContentWebview = () => {
  const { selectedFilePath } = useAppSelector((state) => state.workspaces.currentWorkspace);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TabList />
      {!selectedFilePath.startsWith('%CUSTOM%') ? <Editor /> : <></>}
    </div>
  );
};

export default ContentWebview;
