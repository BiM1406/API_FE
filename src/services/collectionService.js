import { get, post, put, del } from './api';

export async function getCollections(projectId = 'default') {
  return get(`/collections?projectId=${projectId}`);
}

export async function createCollection(projectId = 'default', payload = {}) {
  return post('/collections', {
    projectId,
    name: payload.name?.trim() || 'New Collection',
    description: payload.description || ''
  });
}

export async function updateCollection(collectionId, payload) {
  return put(`/collections/${collectionId}`, payload);
}

export async function deleteCollection(collectionId) {
  return del(`/collections/${collectionId}`);
}

export async function createFolder(collectionId, payload = {}) {
  return post(`/collections/${collectionId}/folders`, {
    name: payload.name?.trim() || 'New Folder'
  });
}

export async function updateFolder(collectionId, folderId, payload) {
  return put(`/collections/${collectionId}/folders/${folderId}`, payload);
}

export async function deleteFolder(collectionId, folderId) {
  return del(`/collections/${collectionId}/folders/${folderId}`);
}

export async function saveRequest(collectionId, folderId, requestPayload) {
  if (folderId) {
    return post(`/collections/${collectionId}/folders/${folderId}/requests`, requestPayload);
  }
  return post(`/collections/${collectionId}/requests`, requestPayload);
}

export async function updateRequest(collectionId, folderId, requestId, payload) {
  if (folderId) {
    return put(`/collections/${collectionId}/folders/${folderId}/requests/${requestId}`, payload);
  }
  return put(`/collections/${collectionId}/requests/${requestId}`, payload);
}

export async function deleteRequest(collectionId, folderId, requestId) {
  if (folderId) {
    return del(`/collections/${collectionId}/folders/${folderId}/requests/${requestId}`);
  }
  return del(`/collections/${collectionId}/requests/${requestId}`);
}

export async function duplicateRequest(collectionId, folderId, requestId) {
  if (folderId) {
    return post(`/collections/${collectionId}/folders/${folderId}/requests/${requestId}/duplicate`);
  }
  return post(`/collections/${collectionId}/requests/${requestId}/duplicate`);
}

export async function exportCollection(collectionId) {
  return get(`/collections/${collectionId}/export`);
}

export async function importCollection(fileOrJson) {
  return post('/collections/import', typeof fileOrJson === 'string' ? JSON.parse(fileOrJson) : fileOrJson);
}


