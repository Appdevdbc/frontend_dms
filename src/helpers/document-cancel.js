import api from "axios";
/**
 * Cancel document number
 * @param {Object} data - Cancellation data
 * @param {string} data.doc_id - Document number
 * @param {string} data.doc_alasan_batal - Cancellation reason
 * @returns {Promise<Object>} Response
 */
export const cancelDocument = async (data) => {
  try {
    const response = await api.post('/document-cancel/cancel', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  cancelDocument
};

