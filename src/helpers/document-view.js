import api from "axios";

/**
 * Document View API Helper
 * Handles API calls for document view module
 */

/**
 * Fetch all documents (final + pending)
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.rowsPerPage - Rows per page
 * @param {string} params.sortBy - Sort column
 * @param {boolean} params.descending - Sort direction
 * @param {string} params.filter - Search filter
 * @returns {Promise<Object>} Response with data and pagination
 */
export const fetchDocuments = async (params) => {
  try {
    const response = await api.get('/document-view/list', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  fetchDocuments
};

