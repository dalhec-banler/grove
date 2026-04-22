import Backdrop from './Backdrop';

interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <Backdrop onClose={onCancel}>
      <div className="bg-surface rounded-lg shadow-xl w-[90vw] max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="text-sm px-3 py-1.5 text-muted hover:text-ink">Cancel</button>
          <button onClick={onConfirm} className="text-sm px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700">Confirm</button>
        </div>
      </div>
    </Backdrop>
  );
}
