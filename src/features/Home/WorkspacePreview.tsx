const WorkspacePreview = ({ name, src }: { name: string; src: string }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-lg font-medium">{name}</p>
      <img src={src} className="w-full h-full rounded-md shadow-xs bg-border" alt="Workspace Preview" />
    </div>
  );
};

export default WorkspacePreview;
