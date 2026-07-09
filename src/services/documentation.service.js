import api, { normalizeApiError, unwrap } from './api';

export async function getDocumentation(projectId = 'default') {
  try {
    return unwrap(await api.get(`/projects/${projectId}/documentation`));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tải documentation');
  }
}

export async function saveDocumentation(projectId = 'default', docs) {
  try {
    return unwrap(await api.put(`/projects/${projectId}/documentation`, docs));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể lưu documentation');
  }
}

export async function generateDocumentationFromCollections(projectId = 'default') {
  try {
    return unwrap(await api.post(`/projects/${projectId}/documentation/generate`));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tạo documentation');
  }
}

export async function updateEndpointDoc(projectId, endpointId, payload) {
  const docs = await getDocumentation(projectId);
  const next = {
    ...docs,
    endpoints: (docs.endpoints || []).map((endpoint) => (
      endpoint.id === endpointId ? { ...endpoint, ...payload } : endpoint
    ))
  };
  return saveDocumentation(projectId, next);
}

export async function exportMarkdown(projectId = 'default') {
  try {
    return unwrap(await api.get(`/projects/${projectId}/documentation/export.md`, {
      responseType: 'text'
    }));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể export Markdown');
  }
}

export async function exportHtml(projectId = 'default') {
  const markdown = await exportMarkdown(projectId);
  return `<pre>${String(markdown).replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char])}</pre>`;
}
