import { api } from './api';

const DEFAULT_PROJECT_UUID = '00000000-0000-0000-0000-000000000000';

const ensureUuid = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return id;
  }
  return DEFAULT_PROJECT_UUID;
};

export async function getSchema(projectId = 'default') {
  return api.get(`/projects/${ensureUuid(projectId)}/database-schema`);
}

export async function saveSchema(projectId = 'default', schema) {
  const payload = {
    dbType: schema.dbType || 'postgresql',
    name: schema.name || 'default_schema',
    tables: (schema.tables || []).map((t) => ({
      name: t.name,
      positionX: t.positionX || 100,
      positionY: t.positionY || 150,
      columns: (t.columns || []).map((c) => ({
        name: c.name,
        type: c.type || 'VARCHAR(255)',
        primaryKey: Boolean(c.primaryKey),
        nullable: Boolean(c.nullable),
        unique: Boolean(c.unique),
        defaultValue: c.defaultValue || ''
      }))
    }))
  };
  return api.put(`/projects/${ensureUuid(projectId)}/database-schema`, payload);
}

export async function createTable(projectId = 'default', table) {
  const payload = {
    name: table.name,
    positionX: table.positionX || 100,
    positionY: table.positionY || 150,
    columns: (table.columns || []).map((c) => ({
      name: c.name,
      type: c.type || 'VARCHAR(255)',
      primaryKey: Boolean(c.primaryKey),
      nullable: Boolean(c.nullable),
      unique: Boolean(c.unique),
      defaultValue: c.defaultValue || ''
    }))
  };
  return api.post(`/projects/${ensureUuid(projectId)}/database-schema/tables`, payload);
}

export async function updateTable(_projectId = 'default', tableId, payload) {
  const body = {
    name: payload.name,
    positionX: payload.positionX,
    positionY: payload.positionY,
    rowCount: payload.rowCount
  };
  return api.patch(`/database/tables/${tableId}`, body);
}

export async function deleteTable(_projectId = 'default', tableId) {
  return api.delete(`/database/tables/${tableId}`);
}

export async function addColumn(_projectId = 'default', tableId, column) {
  const payload = {
    name: column.name,
    type: column.type || 'VARCHAR(255)',
    primaryKey: Boolean(column.primaryKey),
    nullable: Boolean(column.nullable),
    unique: Boolean(column.unique),
    defaultValue: column.defaultValue || ''
  };
  return api.post(`/database/tables/${tableId}/columns`, payload);
}

export async function updateColumn(_projectId = 'default', tableId, columnId, payload) {
  const body = {
    name: payload.name,
    type: payload.type,
    primaryKey: payload.primaryKey !== undefined ? Boolean(payload.primaryKey) : undefined,
    nullable: payload.nullable !== undefined ? Boolean(payload.nullable) : undefined,
    unique: payload.unique !== undefined ? Boolean(payload.unique) : undefined,
    defaultValue: payload.defaultValue
  };
  return api.patch(`/database/columns/${columnId}`, body);
}

export async function deleteColumn(_projectId = 'default', tableId, columnId) {
  return api.delete(`/database/columns/${columnId}`);
}

const quoteIdentifier = (name, dbType) => {
  if (dbType === 'mysql') return `\`${name}\``;
  if (dbType === 'sqlserver') return `[${name}]`;
  return `"${name}"`;
};

export function generateSqlPreview(schema, dbType = schema?.dbType || 'postgresql') {
  if (!schema?.tables?.length) return '-- Chưa có bảng nào được tạo';
  return schema.tables.map((table) => {
    const columns = (table.columns || []).map((column) => {
      const type = column.length && !String(column.type).includes('(') ? `${column.type}(${column.length})` : column.type || 'VARCHAR(255)';
      const constraints = [
        column.primaryKey ? 'PRIMARY KEY' : '',
        column.unique && !column.primaryKey ? 'UNIQUE' : '',
        column.nullable === false ? 'NOT NULL' : '',
        column.defaultValue ? `DEFAULT ${column.defaultValue}` : ''
      ].filter(Boolean).join(' ');
      return `  ${quoteIdentifier(column.name, dbType)} ${type} ${constraints}`.trimEnd();
    }).join(',\n');
    return `CREATE TABLE ${quoteIdentifier(table.name, dbType)} (\n${columns}\n);`;
  }).join('\n\n');
}

export function exportSql(schema, dbType = schema?.dbType || 'postgresql') {
  return generateSqlPreview(schema, dbType);
}

export async function applyAiGeneratedSchema(projectId = 'default', schema) {
  return saveSchema(projectId, schema);
}

export async function getSqlPreview(projectId = 'default') {
  return api.get(`/projects/${ensureUuid(projectId)}/database-schema/sql`);
}
