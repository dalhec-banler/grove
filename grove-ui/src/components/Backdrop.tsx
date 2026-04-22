export default function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 md:p-0">
      {children}
    </div>
  );
}
