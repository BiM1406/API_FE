import api, { normalizeApiError, unwrap } from './api';

const listFrom = (payload, key) => Array.isArray(payload) ? payload : payload?.[key] || payload?.items || [];

export async function getCollections(projectId = 'default') {
  try {
    return listFrom(unwrap(await api.get(`/projects/${projectId}/collections`)), 'collections');
  } catch (error) {
    throw normalizeApiError(error, 'Khong the tai collections');
  }
}

export async function createCollection(projectId = 'default', payload = {}) {
  try {
    return unwrap(await api.post(`/projects/${projectId}/collections`, payload));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the tao collection');
  }
}

export async function updateCollection(collectionId, payload) {
  try {
    return unwrap(await api.patch(`/collections/${collectionId}`, payload));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the cap nhat collection');
  }
}

export async function deleteCollection(collectionId) {
  try {
    return unwrap(await api.delete(`/collections/${collectionId}`));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the xoa collection');
  }
}

export async function createFolder(collectionId, payload = {}) {
  try {
    return unwrap(await api.post(`/collections/${collectionId}/folders`, payload));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the tao folder');
  }
}

export async function updateFolder(_collectionId, _parentFolderId, folderId, payload) {
  try {
    return unwrap(await api.patch(`/folders/${folderId}`, payload));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the cap nhat folder');
  }
}

export async function deleteFolder(_collectionId, folderId) {
  try {
    return unwrap(await api.delete(`/folders/${folderId}`));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the xoa folder');
  }
}

export async function saveRequest(collectionId, folderId, request) {
  try {
    return unwrap(await api.post(`/collections/${collectionId}/requests`, { ...request, folderId }));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the luu request');
  }
}

export async function updateRequest(_collectionId, _folderId, requestId, payload) {
  try {
    return unwrap(await api.patch(`/requests/${requestId}`, payload));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the cap nhat request');
  }
}

export async function deleteRequest(_collectionId, _folderId, requestId) {
  try {
    return unwrap(await api.delete(`/requests/${requestId}`));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the xoa request');
  }
}

export async function duplicateRequest(collectionId, folderId, requestId) {
  try {
    return unwrap(await api.post(`/requests/${requestId}/duplicate`, { collectionId, folderId }));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the nhan ban request');
  }
}

export async function exportCollection(collectionId, projectId) {
  try {
    const collection = unwrap(await api.get(`/collections/${collectionId}`));
    return JSON.stringify(collection, null, 2);
  } catch (error) {
    if (projectId) {
      const collections = await getCollections(projectId);
      const collection = collections.find((item) => item.id === collectionId);
      if (collection) return JSON.stringify(collection, null, 2);
    }
    throw normalizeApiError(error, 'Khong the export collection');
  }
}

export async function importCollection(projectId = 'default', payload = {}) {
  try {
    const body = typeof payload === 'string' ? JSON.parse(payload) : payload;
    return unwrap(await api.post(`/projects/${projectId}/collections/import`, body));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the import collection');
  }
}
