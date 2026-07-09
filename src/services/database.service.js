import api, { normalizeApiError, unwrap } from './api';

const asSchema = async (projectId, payload) => {
  if (payload?.schema) return payload.schema;
  if (payload?.tables) return payload;
  return getSchema(projectId);
};

export async function getSchema(projectId = 'default') {
  try {
    return unwrap(await api.get(`/projects/${projectId}/database-schema`));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tải database schema');
  }
}

export async function saveSchema(projectId = 'default', schema) {
  try {
    return unwrap(await api.put(`/projects/${projectId}/database-schema`, schema));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể lưu database schema');
  }
}

export async function createTable(projectId = 'default', table) {
  try {
    return asSchema(projectId, unwrap(await api.post(`/projects/${projectId}/database-schema/tables`, table)));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tạo bảng');
  }
}

export async function updateTable(projectId = 'default', tableId, payload) {
  try {
    return asSchema(projectId, unwrap(await api.patch(`/database/tables/${tableId}`, payload)));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể cập nhật bảng');
  }
}

export async function deleteTable(projectId = 'default', tableId) {
  try {
    return asSchema(projectId, unwrap(await api.delete(`/database/tables/${tableId}`)));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể xóa bảng');
  }
}

export async function addColumn(projectId = 'default', tableId, column) {
  try {
    return asSchema(projectId, unwrap(await api.post(`/database/tables/${tableId}/columns`, column)));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tạo cột');
  }
}

export async function updateColumn(projectId = 'default', tableId, columnId, payload) {
  try {
    return asSchema(projectId, unwrap(await api.patch(`/database/columns/${columnId}`, { ...payload, tableId })));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể cập nhật cột');
  }
}

export async function deleteColumn(projectId = 'default', tableId, columnId) {
  try {
    return asSchema(projectId, unwrap(await api.delete(`/database/columns/${columnId}`, { data: { tableId } })));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể xóa cột');
  }
}

export async function getSchemaSql(projectId = 'default') {
  try {
    return unwrap(await api.get(`/projects/${projectId}/database-schema/sql`));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tải SQL');
  }
}

export function generateSqlPreview(schema) {
  if (!schema?.tables?.length) return '-- Chưa có bảng nào được tạo';
  return schema.tables.map((table) => (
    `CREATE TABLE "${table.name}" (\n${(table.columns || []).map((column) => `  "${column.name}" ${column.type || 'VARCHAR(255)'}`).join(',\n')}\n);`
  )).join('\n\n');
}

export function exportSql(schema) {
  return generateSqlPreview(schema);
}

export async function applyAiGeneratedSchema(projectId = 'default', schema) {
  return saveSchema(projectId, schema);
}
