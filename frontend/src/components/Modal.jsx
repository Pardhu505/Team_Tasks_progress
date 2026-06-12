import { AnimatePresence, motion } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

export const Modal = ({ open, onClose, title, children, wide }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`card my-auto w-full ${wide ? 'max-w-3xl' : 'max-w-lg'}`}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
          <div className="px-6 py-5">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const ConfirmDialog = ({ open, onCancel, onConfirm, title, message, busy }) => (
  <Modal open={open} onClose={onCancel} title={title || 'Confirm action'}>
    <div className="flex gap-4">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-bad/10">
        <AlertTriangle className="h-5 w-5 text-bad" />
      </div>
      <p className="pt-1.5 text-sm text-muted">{message}</p>
    </div>
    <div className="mt-6 flex justify-end gap-3">
      <button className="btn-ghost" onClick={onCancel} disabled={busy}>
        Cancel
      </button>
      <button className="btn-danger" onClick={onConfirm} disabled={busy}>
        {busy ? 'Deleting…' : 'Delete'}
      </button>
    </div>
  </Modal>
);
