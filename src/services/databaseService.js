import { mockDelay } from './api';

const SCHEMA_KEY = 'api_fe_database_schemas';

const readSchemas = () => {
  try { return JSON.parse(localStorage.getItem(SCHEMA_KEY) || '{}'); } catch { return {}; }
};

const saveSchemas = (schemas) => {
  localStorage.setItem(SCHEMA_KEY, JSON.stringify(schemas));
  return schemas;
};

export async function getSchema(projectId = 'default') {
  return mockDelay(readSchemas()[projectId] || { tables: [] });
}

export async function saveSchema(projectId = 'default', schema) {
  const schemas = readSchemas();
  schemas[projectId] = schema;
  saveSchemas(schemas);
  return mockDelay(schema);
}

export function generateSqlPreview(schema) {
  if (!schema?.tables?.length) return '-- Chưa có bảng nào được tạo';
  return schema.tables.map((table) => {
    const columns = (table.columns || []).map((column) => {
      const constraints = [
        column.primaryKey ? 'PRIMARY KEY' : '',
        column.unique ? 'UNIQUE' : '',
        column.nullable === false ? 'NOT NULL' : ''
      ].filter(Boolean).join(' ');
      return `  ${column.name} ${column.type || 'VARCHAR(255)'} ${constraints}`.trimEnd();
    }).join(',\n');
    return `CREATE TABLE ${table.name} (\n${columns}\n);`;
  }).join('\n\n');
}
