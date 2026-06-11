import { mockDelay } from './api';
import { createId, readObjectStorage, writeStorage } from '../utils/storage';

const SCHEMA_KEY = 'api_fe_database_schemas';

const readSchemas = () => readObjectStorage(SCHEMA_KEY, {});
const saveSchemas = (schemas) => writeStorage(SCHEMA_KEY, schemas);
const normalizeName = (value) => String(value || '').trim();

const normalizeColumn = (column) => ({
  id: column.id || createId('column'),
  name: normalizeName(column.name),
  type: column.type || 'VARCHAR(255)',
  length: column.length || '',
  primaryKey: Boolean(column.primaryKey),
  nullable: column.primaryKey ? false : column.nullable !== false,
  unique: column.primaryKey ? true : Boolean(column.unique),
  defaultValue: column.defaultValue || ''
});

const normalizeTable = (table) => ({
  id: table.id || createId('table'),
  name: normalizeName(table.name),
  rows: table.rows || 0,
  columns: (Array.isArray(table.columns) ? table.columns : []).map(normalizeColumn),
  createdAt: table.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const normalizeSchema = (schema = {}, projectId = 'default') => ({
  projectId,
  dbType: schema.dbType || 'postgresql',
  tables: (Array.isArray(schema.tables) ? schema.tables : []).map(normalizeTable)
});

const getSchemaSync = (projectId = 'default') => normalizeSchema(readSchemas()[projectId] || { tables: [] }, projectId);

const persistSchema = (projectId, schema) => {
  const schemas = readSchemas();
  const normalized = normalizeSchema(schema, projectId);
  schemas[projectId] = normalized;
  saveSchemas(schemas);
  return normalized;
};

export async function getSchema(projectId = 'default') {
  return mockDelay(getSchemaSync(projectId));
}

export async function saveSchema(projectId = 'default', schema) {
  return mockDelay(persistSchema(projectId, schema));
}

export async function createTable(projectId = 'default', table) {
  const schema = getSchemaSync(projectId);
  const name = normalizeName(table.name);
  if (!name) throw new Error('Tên bảng không được để trống');
  if (schema.tables.some((item) => item.name.toLowerCase() === name.toLowerCase())) throw new Error('Tên bảng đã tồn tại');
  const nextTable = normalizeTable({ ...table, name });
  return mockDelay(persistSchema(projectId, { ...schema, tables: [...schema.tables, nextTable] }));
}

export async function updateTable(projectId = 'default', tableId, payload) {
  const schema = getSchemaSync(projectId);
  const name = payload.name === undefined ? undefined : normalizeName(payload.name);
  if (name === '') throw new Error('Tên bảng không được để trống');
  if (name && schema.tables.some((item) => item.id !== tableId && item.name.toLowerCase() === name.toLowerCase())) throw new Error('Tên bảng đã tồn tại');
  return mockDelay(persistSchema(projectId, {
    ...schema,
    tables: schema.tables.map((table) => table.id === tableId ? normalizeTable({ ...table, ...payload, name: name || table.name }) : table)
  }));
}

export async function deleteTable(projectId = 'default', tableId) {
  const schema = getSchemaSync(projectId);
  return mockDelay(persistSchema(projectId, { ...schema, tables: schema.tables.filter((table) => table.id !== tableId) }));
}

export async function addColumn(projectId = 'default', tableId, column) {
  const schema = getSchemaSync(projectId);
  const table = schema.tables.find((item) => item.id === tableId);
  if (!table) throw new Error('Không tìm thấy bảng');
  const nextColumn = normalizeColumn(column);
  if (!nextColumn.name) throw new Error('Tên cột không được để trống');
  if (table.columns.some((item) => item.name.toLowerCase() === nextColumn.name.toLowerCase())) throw new Error('Tên cột đã tồn tại trong bảng');
  return updateTable(projectId, tableId, { columns: [...table.columns, nextColumn] });
}

export async function updateColumn(projectId = 'default', tableId, columnId, payload) {
  const schema = getSchemaSync(projectId);
  const table = schema.tables.find((item) => item.id === tableId);
  if (!table) throw new Error('Không tìm thấy bảng');
  const name = payload.name === undefined ? undefined : normalizeName(payload.name);
  if (name === '') throw new Error('Tên cột không được để trống');
  if (name && table.columns.some((item) => item.id !== columnId && item.name.toLowerCase() === name.toLowerCase())) throw new Error('Tên cột đã tồn tại trong bảng');
  return updateTable(projectId, tableId, {
    columns: table.columns.map((column) => column.id === columnId ? normalizeColumn({ ...column, ...payload, name: name || column.name }) : column)
  });
}

export async function deleteColumn(projectId = 'default', tableId, columnId) {
  const schema = getSchemaSync(projectId);
  const table = schema.tables.find((item) => item.id === tableId);
  if (!table) throw new Error('Không tìm thấy bảng');
  return updateTable(projectId, tableId, { columns: table.columns.filter((column) => column.id !== columnId) });
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
  const normalized = normalizeSchema({
    dbType: schema.dbType || 'postgresql',
    tables: (Array.isArray(schema.tables) ? schema.tables : []).map((table) => normalizeTable(table))
  }, projectId);
  return mockDelay(persistSchema(projectId, normalized));
}

