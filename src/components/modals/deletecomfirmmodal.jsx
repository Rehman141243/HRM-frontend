import { RefreshCw, Trash2 } from "lucide-react";
import { Modal, ModalBody, ModalHeader } from "../modal-components/modalcomponents";

export default function DeleteConfirmModal({ open, onClose, onConfirm, title, description, loading }) {
    return (
      <Modal open={open} onClose={onClose} maxWidth="max-w-sm">
        <ModalHeader icon={Trash2} title={title || "Confirm Delete"} onClose={onClose} />
        <ModalBody>
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-gray-600">{description || "Are you sure you want to delete this item? This cannot be undone."}</p>
            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={onConfirm} disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors disabled:opacity-50">
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}Delete
              </button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    );
  }