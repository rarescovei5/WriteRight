import { useAppSelector } from '@/app/hooks/hooks';

const Editor = () => {
  const { selectedFilePath } = useAppSelector((state) => state.workspaces.currentWorkspace);

  return selectedFilePath !== '' ? <div className="px-20 flex-1"></div> : <></>;
};

export default Editor;
