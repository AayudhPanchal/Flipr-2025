import React from 'react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, isScheduled, scheduledTime }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-black opacity-30"></div>
                
                <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mb-6">
                        <p className="text-gray-600">{message}</p>
                        {isScheduled && scheduledTime && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-md">
                                <p className="text-sm text-blue-800">
                                    Scheduled for: {new Date(scheduledTime).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                        >
                            {isScheduled ? 'Schedule Post' : 'Publish Now'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
