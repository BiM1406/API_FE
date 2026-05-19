import { mockDelay } from './api';
import { getCollections } from './collectionService';
import { createId, readStorage, writeStorage } from '../utils/storage';

const DOC_KEY = 'api_fe_documentation';

const readAll = () => readStorage(DOC_KEY, {});
const saveAll = (value) => writeStorage(DOC_KEY, value);

export async function getDocumentation(projectId = 'default') {
  return mockDelay(readAll()[projectId] || { projectId, endpoints: [], updatedAt: null });
}

export async function saveDocumentation(projectId = 'default', docs) {
  const all = readAll();
  const saved = { projectId, ...docs, updatedAt: new Date().toISOString() };
  all[projectId] = saved;
  saveAll(all);
  return mockDelay(saved);
}

export async function generateDocumentationFromCollections(projectId = 'default') {
  const collections = await getCollections(projectId);
  const endpoints = collections.flatMap((collection) => [
    ...(collection.requests || []),
    ...(collection.folders || []).flatMap((folder) => folder.requests || [])
  ]).map((request) => ({
    id: createId('endpoint'),
    method: request.method || 'GET',
    url: request.url || '/endpoint',
    description: request.description || `Endpoint ${request.name || request.url}`,
    headers: request.headers || [],
    params: request.params || [],
    bodyExample: request.body || '',
    responseExample: request.responseExample || '{\n  "success": true\n}',
    errorExample: '{\n  "message": "Request failed"\n}'
  }));
  return saveDocumentation(projectId, { endpoints });
}

export async function updateEndpointDoc(projectId, endpointId, payload) {
  const docs = await getDocumentation(projectId);
  const next = { ...docs, endpoints: docs.endpoints.map((endpoint) => endpoint.id === endpointId ? { ...endpoint, ...payload } : endpoint) };
  return saveDocumentation(projectId, next);
}

export async function exportMarkdown(projectId = 'default') {
  const docs = await getDocumentation(projectId);
  const markdown = [`# API Documentation`, '']
    .concat((docs.endpoints || []).flatMap((endpoint) => [
      `## ${endpoint.method} ${endpoint.url}`,
      '',
      endpoint.description || '',
      '',
      '### Headers',
      '```json',
      JSON.stringify(endpoint.headers || [], null, 2),
      '```',
      '',
      '### Body Example',
      '```json',
      endpoint.bodyExample || '{}',
      '```',
      ''
    ]))
    .join('\n');
  return mockDelay(markdown);
}

export async function exportHtml(projectId = 'default') {
  const markdown = await exportMarkdown(projectId);
  return mockDelay(`<pre>${markdown.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char])}</pre>`);
}

