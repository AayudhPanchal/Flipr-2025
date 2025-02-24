import { useState, useEffect } from 'react';
import Modal from './Modal';

export default function BlogFormModal({ isOpen, onClose, onSubmit, initialData, mode = 'create' }) {
  const [form, setForm] = useState({ heading: '', text: '' });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const actions = (
    <>
      <button
        type="submit"
        form="blog-form"
        className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
      >
        {mode === 'create' ? 'Create' : 'Update'} Blog
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
      title={mode === 'create' ? 'Create New Blog' : 'Edit Blog'}
      actions={actions}
    >
      <form id="blog-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="heading" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="heading"
            value={form.heading}
            onChange={(e) => setForm({ ...form, heading: e.target.value })}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="text"
            rows={6}
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </form>
    </Modal>
  );
}
