import { getCurrentWindow } from '@tauri-apps/api/window';
import { Minus, Square, X } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const appWindow = getCurrentWindow();

const Titlebar = () => {
  return (
    <div data-tauri-drag-region className="h-10 flex">
      <div className="flex-1 border-b border-border"></div>
      <div className="inline-flex border-b border-border">
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger
              onClick={() => appWindow.minimize()}
              className="cursor-pointer w-12 grid place-content-center hover:bg-ring/50"
            >
              <span className="sr-only">Minimize</span>
              <Minus height={16} strokeWidth="1" />
            </TooltipTrigger>
            <TooltipContent>Minimize</TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={300}>
            <TooltipTrigger
              onClick={() => appWindow.toggleMaximize()}
              className="cursor-pointer w-12 grid place-content-center hover:bg-ring/50"
            >
              <span className="sr-only">Maximize</span>
              <Square height={16} strokeWidth="1" />
            </TooltipTrigger>
            <TooltipContent>Maximize</TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={300}>
            <TooltipTrigger
              onClick={() => appWindow.close()}
              className="cursor-pointer w-12 grid place-content-center hover:bg-destructive/80"
            >
              <span className="sr-only">Close</span>
              <X height={16} strokeWidth="1" />
            </TooltipTrigger>
            <TooltipContent>Close</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default Titlebar;
