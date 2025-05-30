import { open } from '@tauri-apps/plugin-dialog';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus } from 'lucide-react';

const AddWorkspace = (props: any) => {
  const handleClick = async () => {
    const file = await open({
      directory: true,
    });

    console.log(file);

    props.setFile(file);
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
