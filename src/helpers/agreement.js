import axios from "axios";
import { empid } from "../utils";

const API_BASE = import.meta.env.VITE_API;

// Agreement Types
export const fetchAgreementTypes = async (params = {}) => {
  const response = await axios.get(`${API_BASE}agreements/types`, {
    params,
    skipErrorInterceptor: true
  });
  return response.data;
};

export const createAgreementType = async (data) => {
  const response = await axios.post(`${API_BASE}agreements/types`, {
    ...data,
    creator: empid()
  }, {
    skipErrorInterceptor: true
  });
  return response.data;
};

export const updateAgreementType = async (data) => {
  const response = await axios.post(`${API_BASE}agreements/types`, {
    ...data,
    creator: empid()
  }, {
    skipErrorInterceptor: true
  });
  return response.data;
};

export const deleteAgreementType = async (perj_id) => {
  const response = await axios.delete(`${API_BASE}agreements/types/${perj_id}`, {
    data: { perj_id, creator: empid() },
    skipErrorInterceptor: true
  });
  return response.data;
};

// Document Number Request
export const previewDocumentNumber = async (data) => {
  const response = await axios.post(`${API_BASE}agreements/preview`, data, {
    skipErrorInterceptor: true
  });
  return response.data;
};

export const requestDocumentNumber = async (data) => {
  const response = await axios.post(`${API_BASE}agreements/request`, data, {
    skipErrorInterceptor: true
  });
  return response.data;
};

// Validation
export const validateSPK = async (spk) => {
  const response = await axios.get(`${API_BASE}agreements/validate-spk/${spk}`, {
    skipErrorInterceptor: true
  });
  return response.data;
};

export const validateUser = async (nik) => {
  const response = await axios.get(`${API_BASE}agreements/validate-user/${nik}`, {
    skipErrorInterceptor: true
  });
  return response.data;
};

// Approval (public - no auth)
export const getApprovalDetails = async (token) => {
  const response = await axios.get(`${API_BASE}agreements/approve/${token}`, {
    skipErrorInterceptor: true
  });
  return response.data;
};

export const approveDocumentNumber = async (data) => {
  const response = await axios.post(`${API_BASE}agreements/approve`, data, {
    skipErrorInterceptor: true
  });
  return response.data;
};

