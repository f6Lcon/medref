"use client"

import { FaExclamationTriangle, FaTimes, FaTrash } from "react-icons/fa"

const DeleteConfirmationModal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-2" />
            {title}
          </h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="py-4">
          <p className="text-gray-700">{message}</p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition flex items-center"
          >
            <FaTrash className="mr-2" />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal
