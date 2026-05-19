import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Bot, Check, Copy, Database as DatabaseIcon, Download, Key,
  Loader2, Plus, Save, Search, Table2, Trash2
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import {
  addColumn, createTable, deleteColumn, deleteTable,
  generateSqlPreview, getSchema, updateColumn, updateTable
} from '../../services/databaseService';
import { addActivity } from '../../services/activityService';
import { generateDatabaseSchema } from '../../services/aiService';

const projectId = () => localStorage.getItem('api_fe_active_project_id') || 'default';

const DATA_TYPES = ['UUID', 'VARCHAR(255)', 'TEXT', 'INTEGER', 'DECIMAL(12,2)', 'BOOLEAN', 'DATE', 'TIMESTAMP', 'JSONB'];
const STARTER_COLUMNS = [
  { id: 'id', name: 'id', type: 'UUID', primaryKey: true, nullable: false, unique: true },
  { id: 'created_at', name: 'created_at', type: 'TIMESTAMP', primaryKey: false, nullable: false, unique: false }
];

// Parse SQL code back into column definitions
function parseSqlToColumns(sql, tableName) {
  try {
    const tableMatch = sql.match(/CREATE\s+TABLE\s+["']?(\w+)["']?\s*\(([\s\S]*?)\)\s*;?/i);
    if (!tableMatch) return null;

    const parsedName = tableMatch[1];
    const body = tableMatch[2];
    const lines = body.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('--'));

    const columns = [];
    for (const line of lines) {
      const clean = line.replace(/,$/, '').trim();
      if (!clean || clean.toUpperCase().startsWith('PRIMARY KEY') || clean.toUpperCase().startsWith('UNIQUE') || clean.toUpperCase().startsWith('FOREIGN')) continue;

      const parts = clean.match(/^["']?(\w+)["']?\s+([A-Z]+(?:\([^)]*\))?)(.*)/i);
      if (!parts) continue;

      const colName = parts[1];
      const colType = parts[2].toUpperCase();
      const rest = parts[3].toUpperCase();

      const matchedType = DATA_TYPES.find(t => t.toUpperCase().startsWith(colType)) || colType;

      columns.push({
        id: colName + '_' + Date.now() + Math.random(),
        name: colName,
        type: matchedType,
        primaryKey: rest.includes('PRIMARY KEY'),
        nullable: !rest.includes('NOT NULL'),
        unique: rest.includes('UNIQUE')
      });
    }

    return { name: parsedName || tableName, columns };
  } catch {
    return null;
  }
}

export default function Database() {
  const [schema, setSchema] = useState({ tables: [] });
  const [activeTableId, setActiveTableId] = useState('');
  const [searchTable, setSearchTable] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editor state: the raw SQL string the user sees/edits
  const [editorSql, setEditorSql] = useState('');
  // Track if the user manually changed the code (vs auto-generated)
  const [manuallyEdited, setManuallyEdited] = useState(false);

  const tables = schema.tables || [];
  const activeTable = tables.find(t => t.id === activeTableId) || tables[0];

  // Auto-generate SQL from current schema (read-only baseline)
  const autoSql = useMemo(() => generateSqlPreview(schema), [schema]);

  const filteredTables = tables.filter(t =>
    t.name.toLowerCase().includes(searchTable.toLowerCase())
  );

  // When switching tables or schema changes from service, update editor
  useEffect(() => {
    if (!manuallyEdited) {
      setEditorSql(autoSql);
    }
  }, [autoSql, manuallyEdited]);

  // Reset manual edit flag when switching to a different table
  useEffect(() => {
    setManuallyEdited(false);
  }, [activeTableId]);

  useEffect(() => {
    let mounted = true;
    getSchema(projectId())
      .then(data => {
        if (!mounted) return;
        const pending = localStorage.getItem('api_fe_pending_database_schema');
        const nextSchema = pending ? JSON.parse(pending) : data.tables?.length ? data : { tables: [] };
        if (pending) {
          localStorage.removeItem('api_fe_pending_database_schema');
          toast.success('Đã nhập schema từ AI');
        }
        setSchema(nextSchema);
        setActiveTableId(nextSchema.tables?.[0]?.id || '');
      })
      .catch(err => toast.error(err.message || 'Không thể tải schema'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const syncSchema = useCallback((nextSchema) => {
    setSchema(nextSchema);
    if (!nextSchema.tables.some(t => t.id === activeTableId)) {
      setActiveTableId(nextSchema.tables[0]?.id || '');
    }
  }, [activeTableId]);

  const handleServiceAction = async (action, successMsg, activityText) => {
    setSaving(true);
    try {
      const nextSchema = await action();
      syncSchema(nextSchema);
      toast.success(successMsg);
      if (activityText) addActivity('database', activityText);
      setManuallyEdited(false);
    } catch (err) {
      toast.error(err.message || 'Không thể cập nhật schema');
    } finally {
      setSaving(false);
    }
  };

  const handleNewTable = (name = `table_${Date.now().toString().slice(-4)}`) => {
    handleServiceAction(
      () => createTable(projectId(), { name, columns: STARTER_COLUMNS }),
      `Đã tạo bảng ${name}`,
      `Đã tạo bảng: ${name}`
    );
  };

  const handleAiSchema = async () => {
    const generated = await generateDatabaseSchema({ prompt: 'booking database schema' });
    if (!generated?.tables?.length) { toast.error('AI chưa tạo được schema'); return; }
    const t = generated.tables[0];
    handleServiceAction(
      () => createTable(projectId(), { name: t.name || 'bookings', columns: t.columns }),
      'AI đã gợi ý schema bookings',
      'AI đã gợi ý schema database'
    );
  };

  const handleAddColumn = () => {
    if (!activeTable) return;
    const name = `column_${Date.now().toString().slice(-3)}`;
    handleServiceAction(
      () => addColumn(projectId(), activeTable.id, { name, type: 'VARCHAR(255)', nullable: true }),
      `Đã thêm cột ${name}`,
      `Đã thêm cột ${name} vào ${activeTable.name}`
    );
  };

  const handleUpdateColumn = (column, payload) => {
    handleServiceAction(
      () => updateColumn(projectId(), activeTable.id, column.id, payload),
      'Đã cập nhật cột',
      `Đã cập nhật cột ${column.name}`
    );
  };

  const handleDeleteColumn = (column) => {
    handleServiceAction(
      () => deleteColumn(projectId(), activeTable.id, column.id),
      `Đã xóa cột ${column.name}`,
      `Đã xóa cột ${column.name}`
    );
  };

  const handleDeleteTable = (table) => {
    handleServiceAction(
      () => deleteTable(projectId(), table.id),
      `Đã xóa bảng ${table.name}`,
      `Đã xóa bảng: ${table.name}`
    );
  };

  // Unified Save: if manual edit, parse SQL back to schema; otherwise save from visual editor
  const handleSave = async () => {
    if (!activeTable) return;
    if (manuallyEdited) {
      // Parse the manually typed SQL
      const parsed = parseSqlToColumns(editorSql, activeTable.name);
      if (!parsed || parsed.columns.length === 0) {
        toast.error('Không thể đọc SQL. Kiểm tra lại cú pháp.');
        return;
      }
      // Rename if needed
      const nameChanged = parsed.name && parsed.name !== activeTable.name;
      setSaving(true);
      try {
        let current = schema;
        if (nameChanged) {
          current = await updateTable(projectId(), activeTable.id, { name: parsed.name });
        }
        // Replace all columns: delete old ones, add new ones
        for (const col of activeTable.columns) {
          current = await deleteColumn(projectId(), activeTable.id, col.id);
        }
        for (const col of parsed.columns) {
          current = await addColumn(projectId(), activeTable.id, {
            name: col.name, type: col.type,
            primaryKey: col.primaryKey, nullable: col.nullable, unique: col.unique
          });
        }
        syncSchema(current);
        setManuallyEdited(false);
        toast.success('Đã lưu thay đổi từ code SQL');
        addActivity('database', 'Đã lưu schema từ code SQL');
      } catch (err) {
        toast.error(err.message || 'Lỗi khi lưu');
      } finally {
        setSaving(false);
      }
    } else {
      // Save from visual editor (already persisted via service calls, just confirm)
      toast.success('Đã lưu bảng ' + activeTable.name);
      addActivity('database', `Đã lưu bảng: ${activeTable.name}`);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(editorSql);
    toast.success('Đã copy SQL');
  };

  const handleExportSql = () => {
    const blob = new Blob([editorSql], { type: 'text/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'api-fe-schema.sql'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã export SQL');
  };

  const handleEditorChange = (value) => {
    setEditorSql(value || '');
    setManuallyEdited(true);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-950 text-slate-300">
      {/* Header */}
      <header className="z-20 flex min-h-14 shrink-0 flex-col gap-3 border-b border-white/5 bg-slate-900/60 px-4 py-3 backdrop-blur-3xl lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
            <DatabaseIcon size={18} />
          </div>
          <div>
            <h1 className="font-black tracking-tight text-white">Thiết kế CSDL</h1>
            <p className="text-xs text-slate-500">Visual Editor + SQL Code</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleAiSchema} disabled={saving} className="inline-flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-bold text-violet-200 transition hover:bg-violet-500/20 disabled:opacity-50">
            <Bot size={15} /> AI gợi ý schema
          </button>
          <button onClick={handleCopySql} className="inline-flex items-center gap-2 rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/5">
            <Copy size={15} /> Copy SQL
          </button>
          <button onClick={handleExportSql} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-500">
            <Download size={15} /> Export SQL
          </button>
        </div>
      </header>

      {/* 3-column grid: Sidebar | Code Editor | Visual Editor */}
      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_420px]">

        {/* LEFT: Table list */}
        <aside className="min-h-0 border-b border-white/5 bg-slate-900/55 lg:border-b-0 lg:border-r flex flex-col">
          <div className="border-b border-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                <Table2 size={16} className="text-indigo-300" />
                Bảng
              </h2>
              <span className="rounded-lg border border-white/5 bg-slate-950 px-2 py-1 text-[10px] font-bold text-slate-400">{tables.length}</span>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={searchTable}
                onChange={e => setSearchTable(e.target.value)}
                placeholder="Tìm bảng..."
                className="w-full rounded-xl border border-white/5 bg-slate-950/60 py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {loading && <div className="p-6 text-center text-slate-500"><Loader2 className="mx-auto mb-2 animate-spin" />Đang tải...</div>}
            {!loading && filteredTables.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-5 text-center text-sm text-slate-500">
                Chưa có bảng nào.
              </div>
            )}
            {filteredTables.map(table => (
              <button
                key={table.id}
                onClick={() => setActiveTableId(table.id)}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  activeTable?.id === table.id
                    ? 'border-indigo-500/40 bg-indigo-500/10'
                    : 'border-white/5 bg-slate-950/40 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-bold text-white">{table.name}</span>
                  <span className="shrink-0 text-[10px] text-slate-500">{table.columns.length} cột</span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {table.columns.slice(0, 4).map(col => (
                    <span key={col.id} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">{col.name}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-white/5 p-3">
            <button
              disabled={saving}
              onClick={() => handleNewTable()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} className="text-indigo-300" />}
              Bảng mới
            </button>
          </div>
        </aside>

        {/* MIDDLE: SQL Code Editor (editable) */}
        <div className="min-h-0 flex flex-col border-b border-white/5 xl:border-b-0">
          <div className="flex items-center justify-between border-b border-white/5 bg-slate-900/60 px-4 py-2.5">
            <div>
              <h2 className="text-sm font-bold text-white">SQL Code</h2>
              <p className="text-[11px] text-slate-500">
                {manuallyEdited
                  ? <span className="text-amber-400">● Đang sửa tay — nhớ bấm Lưu</span>
                  : 'Tự động sinh từ bảng chức năng'}
              </p>
            </div>
            <button onClick={handleCopySql} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white" title="Copy">
              <Copy size={15} />
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <Editor
              height="100%"
              defaultLanguage="sql"
              theme="vs-dark"
              value={editorSql}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                padding: { top: 12 }
              }}
            />
          </div>
        </div>

        {/* RIGHT: Visual editor */}
        <div className="min-h-0 overflow-y-auto border-l border-white/5 bg-slate-950 custom-scrollbar xl:block">
          {!activeTable ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
              <DatabaseIcon size={40} className="mb-4 text-indigo-300" />
              <h2 className="text-lg font-black text-white">Chưa có bảng</h2>
              <p className="mt-2 text-sm text-slate-400">Tạo bảng mới hoặc dùng AI.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button onClick={() => handleNewTable()} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-500">Tạo bảng</button>
                <button onClick={handleAiSchema} className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-2.5 text-sm font-bold text-violet-200 hover:bg-violet-500/20">AI gợi ý</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {/* Table name + Save + Delete */}
              <section className="rounded-2xl border border-white/5 bg-slate-900/45 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tên bảng</span>
                <input
                  key={activeTable.id}
                  defaultValue={activeTable.name}
                  onBlur={e => {
                    const val = e.target.value.trim();
                    if (val && val !== activeTable.name) {
                      handleServiceAction(
                        () => updateTable(projectId(), activeTable.id, { name: val }),
                        'Đã cập nhật tên bảng',
                        `Đổi tên bảng thành ${val}`
                      );
                    }
                  }}
                  className="mt-2 w-full rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2.5 text-base font-black text-white outline-none focus:border-indigo-500/50"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Lưu bảng
                    {manuallyEdited && <span className="rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[10px] text-amber-300">SQL</span>}
                  </button>
                  <button
                    onClick={() => handleDeleteTable(activeTable)}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                  >
                    <Trash2 size={14} /> Xóa
                  </button>
                </div>
              </section>

              {/* Column list */}
              <section className="rounded-2xl border border-white/5 bg-slate-900/45">
                <div className="flex items-center justify-between border-b border-white/5 p-3">
                  <h2 className="text-sm font-bold text-white">Danh sách cột</h2>
                  <button
                    onClick={handleAddColumn}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    <Plus size={13} /> Thêm cột
                  </button>
                </div>

                <div className="space-y-0 divide-y divide-white/5">
                  {activeTable.columns.map(column => (
                    <div key={column.id} className="px-3 py-3">
                      {/* Name input */}
                      <div className="flex items-center gap-2 mb-2">
                        {column.primaryKey
                          ? <Key size={13} className="shrink-0 text-amber-300" />
                          : <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />}
                        <input
                          defaultValue={column.name}
                          onBlur={e => {
                            const val = e.target.value.trim();
                            if (val && val !== column.name) handleUpdateColumn(column, { name: val });
                          }}
                          className="min-w-0 flex-1 rounded-lg border border-white/5 bg-slate-950/60 px-2 py-1.5 text-xs font-semibold text-white outline-none focus:border-indigo-500/50"
                        />
                        <button
                          onClick={() => handleDeleteColumn(column)}
                          className="shrink-0 rounded-md p-1 text-slate-500 hover:bg-red-500/10 hover:text-red-300"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      {/* Type select */}
                      <select
                        value={column.type}
                        onChange={e => handleUpdateColumn(column, { type: e.target.value })}
                        className="w-full rounded-lg border border-white/5 bg-slate-950/60 px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500/50 mb-2"
                      >
                        {DATA_TYPES.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                      </select>
                      {/* Checkboxes */}
                      <div className="flex gap-2">
                        {[
                          { field: 'primaryKey', label: 'PK' },
                          { field: 'nullable', label: 'Null' },
                          { field: 'unique', label: 'Uniq' }
                        ].map(({ field, label }) => (
                          <label key={field} className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(column[field])}
                              onChange={e => handleUpdateColumn(column, {
                                [field]: e.target.checked,
                                ...(field === 'primaryKey' && e.target.checked ? { nullable: false, unique: true } : {})
                              })}
                              className="peer sr-only"
                            />
                            <span className="flex h-5 items-center gap-1 rounded-md border border-white/10 bg-slate-950 px-2 py-0.5 text-[10px] font-bold text-slate-500 transition peer-checked:border-indigo-500/40 peer-checked:bg-indigo-500/20 peer-checked:text-indigo-200">
                              <Check size={10} /> {label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
