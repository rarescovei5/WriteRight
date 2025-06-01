import { open } from '@tauri-apps/plugin-dialog';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus } from 'lucide-react';

import { useAppDispatch } from '@/app/hooks/hooks';
import { updateWorkspaces } from '@/app/workspaces/workspacesSlice';

const AddWorkspace = () => {
  const dispatch = useAppDispatch();

  const handleClick = async () => {
    // Open file explorer
    const folderPath = await open({
      directory: true,
    });

    // If user closes the popup just return
    if (!folderPath) return;

    // Else, add the folder to opened folders
    dispatch(updateWorkspaces({ updateKind: 'add', path: folderPath }));
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-md cursor-pointer absolute right-4 bottom-4"
            onClick={handleClick}
          >
            <Plus width={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add new workspace</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AddWorkspace;
