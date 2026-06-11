import { mockDelay } from './api';
import { createId, readArrayStorage, writeStorage } from '../utils/storage';

const COLLECTIONS_KEY = 'api_fe_collections';

const readAll = () => readArrayStorage(COLLECTIONS_KEY, []);
const saveAll = (items) => writeStorage(COLLECTIONS_KEY, items);
const now = () => new Date().toISOString();

export async function getCollections(projectId = 'default') {
  return mockDelay(readAll().filter((item) => item.projectId === projectId));
}

export async function createCollection(projectId = 'default', payload = {}) {
  const collection = {
    id: createId('collection'),
    projectId,
    name: payload.name?.trim() || 'New Collection',
    description: payload.description || '',
    folders: [],
    requests: [],
    createdAt: now(),
    updatedAt: now()
  };
  saveAll([collection, ...readAll()]);
  return mockDelay(collection);
}

export async function updateCollection(collectionId, payload) {
  const next = readAll().map((collection) => collection.id === collectionId ? { ...collection, ...payload, updatedAt: now() } : collection);
  saveAll(next);
  return mockDelay(next.find((collection) => collection.id === collectionId));
}

export async function deleteCollection(collectionId) {
  saveAll(readAll().filter((collection) => collection.id !== collectionId));
  return mockDelay({ success: true });
}

export async function createFolder(collectionId, payload = {}) {
  let folder;
  const next = readAll().map((collection) => {
    if (collection.id !== collectionId) return collection;
    folder = { id: createId('folder'), name: payload.name?.trim() || 'New Folder', requests: [], createdAt: now(), updatedAt: now() };
    return { ...collection, folders: [...(collection.folders || []), folder], updatedAt: now() };
  });
  saveAll(next);
  return mockDelay(folder);
}

export async function updateFolder(collectionId, folderId, payload) {
  const next = readAll().map((collection) => collection.id === collectionId
    ? { ...collection, folders: (collection.folders || []).map((folder) => folder.id === folderId ? { ...folder, ...payload, updatedAt: now() } : folder), updatedAt: now() }
    : collection);
  saveAll(next);
  return mockDelay({ success: true });
}

export async function deleteFolder(collectionId, folderId) {
  const next = readAll().map((collection) => collection.id === collectionId
    ? { ...collection, folders: (collection.folders || []).filter((folder) => folder.id !== folderId), updatedAt: now() }
    : collection);
  saveAll(next);
  return mockDelay({ success: true });
}

export async function saveRequest(collectionId, folderId, request) {
  const savedRequest = { id: request.id || createId('request'), name: request.name || `${request.method || 'GET'} ${request.url || '/endpoint'}`, ...request, updatedAt: now(), createdAt: request.createdAt || now() };
  const next = readAll().map((collection) => {
    if (collection.id !== collectionId) return collection;
    if (!folderId) return { ...collection, requests: [savedRequest, ...(collection.requests || [])], updatedAt: now() };
    return {
      ...collection,
      folders: (collection.folders || []).map((folder) => folder.id === folderId ? { ...folder, requests: [savedRequest, ...(folder.requests || [])], updatedAt: now() } : folder),
      updatedAt: now()
    };
  });
  saveAll(next);
  return mockDelay(savedRequest);
}

export async function updateRequest(collectionId, folderId, requestId, payload) {
  const updateList = (requests = []) => requests.map((request) => request.id === requestId ? { ...request, ...payload, updatedAt: now() } : request);
  const next = readAll().map((collection) => {
    if (collection.id !== collectionId) return collection;
    if (!folderId) return { ...collection, requests: updateList(collection.requests), updatedAt: now() };
    return { ...collection, folders: (collection.folders || []).map((folder) => folder.id === folderId ? { ...folder, requests: updateList(folder.requests) } : folder), updatedAt: now() };
  });
  saveAll(next);
  return mockDelay({ success: true });
}

export async function deleteRequest(collectionId, folderId, requestId) {
  const filterList = (requests = []) => requests.filter((request) => request.id !== requestId);
  const next = readAll().map((collection) => {
    if (collection.id !== collectionId) return collection;
    if (!folderId) return { ...collection, requests: filterList(collection.requests), updatedAt: now() };
    return { ...collection, folders: (collection.folders || []).map((folder) => folder.id === folderId ? { ...folder, requests: filterList(folder.requests) } : folder), updatedAt: now() };
  });
  saveAll(next);
  return mockDelay({ success: true });
}

export async function duplicateRequest(collectionId, folderId, requestId) {
  const collection = readAll().find((item) => item.id === collectionId);
  const source = folderId
    ? collection?.folders?.find((folder) => folder.id === folderId)?.requests?.find((request) => request.id === requestId)
    : collection?.requests?.find((request) => request.id === requestId);
  if (!source) throw new Error('Không tìm thấy request');
  return saveRequest(collectionId, folderId, { ...source, id: createId('request'), name: `${source.name} Copy` });
}

export async function exportCollection(collectionId) {
  const collection = readAll().find((item) => item.id === collectionId);
  if (!collection) throw new Error('Không tìm thấy collection');
  return mockDelay(JSON.stringify(collection, null, 2));
}

export async function importCollection(fileOrJson) {
  const collection = typeof fileOrJson === 'string' ? JSON.parse(fileOrJson) : fileOrJson;
  const imported = { ...collection, id: createId('collection'), importedAt: now(), updatedAt: now() };
  saveAll([imported, ...readAll()]);
  return mockDelay(imported);
}

