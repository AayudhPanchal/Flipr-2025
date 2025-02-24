import Modal from './Modal';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title }) {
  const actions = (
    <>
      <button
        type="button"
        onClick={onConfirm}
        className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
      >
        Delete
      </button>
      <button
        type="button"
        onClick={onClose}
        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
      >
        Cancel
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || "Delete Confirmation"}
      actions={actions}
    >
      <p className="text-sm text-gray-500">
        Are you sure you want to delete this item? This action cannot be undone.
      </p>
    </Modal>
  );
}
