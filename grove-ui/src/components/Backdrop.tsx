export default function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      {children}
    </div>
  );
}
