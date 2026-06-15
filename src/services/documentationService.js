import { api } from './api';

const DEFAULT_PROJECT_UUID = '00000000-0000-0000-0000-000000000000';

const ensureUuid = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return id;
  }
  return DEFAULT_PROJECT_UUID;
};

export async function getDocumentation(projectId = 'default') {
  return api.get(`/projects/${ensureUuid(projectId)}/documentation`);
}

export async function saveDocumentation(projectId = 'default', docs) {
  return api.put(`/projects/${ensureUuid(projectId)}/documentation`, docs);
}

export async function generateDocumentationFromCollections(projectId = 'default') {
  return api.post(`/projects/${ensureUuid(projectId)}/documentation/generate`);
}

export async function updateEndpointDoc(projectId, endpointId, payload) {
  const docs = await getDocumentation(projectId);
  const endpoints = Array.isArray(docs.endpoints) ? docs.endpoints : [];
  const next = {
    ...docs,
    endpoints: endpoints.map((endpoint) =>
      endpoint.id === endpointId ? { ...endpoint, ...payload } : endpoint
    )
  };
  return saveDocumentation(projectId, next);
}

export async function exportMarkdown(projectId = 'default') {
  return api.get(`/projects/${ensureUuid(projectId)}/documentation/export.md`);
}

export async function exportHtml(projectId = 'default') {
  const markdown = await exportMarkdown(projectId);
  return `<pre>${markdown.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char])}</pre>`;
}
