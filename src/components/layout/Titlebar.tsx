import { getCurrentWindow } from '@tauri-apps/api/window';
import { Home, Minus, Square, X } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';

const appWindow = getCurrentWindow();

const Titlebar = () => {
  return (
    <div className="h-10 flex">
      <Link to="/" className="grid place-content-center border-b border-border px-2 border-l border-l-transparent">
        <Home width={24} strokeWidth={1} />
      </Link>

      <div data-tauri-drag-region className="flex-1 border-b border-border"></div>
      <div className="inline-flex border-b border-border">
        <button
          onClick={() => appWindow.minimize()}
          className="cursor-pointer w-12 grid place-content-center hover:bg-ring/50"
        >
          <span className="sr-only">Minimize</span>
          <Minus height={16} strokeWidth="1" />
        </button>

        <button
          onClick={() => appWindow.toggleMaximize()}
          className="cursor-pointer w-12 grid place-content-center hover:bg-ring/50"
        >
          <span className="sr-only">Maximize</span>
          <Square height={16} strokeWidth="1" />
        </button>

        <button
          onClick={() => appWindow.close()}
          className="cursor-pointer w-12 grid place-content-center hover:bg-destructive/80"
        >
          <span className="sr-only">Close</span>
          <X height={16} strokeWidth="1" />
        </button>
      </div>
    </div>
  );
};

export default Titlebar;
