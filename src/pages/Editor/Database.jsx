import React, { useEffect, useMemo, useState } from 'react';
import {
  Bot,
  Check,
  Copy,
  Database as DatabaseIcon,
  Download,
  Key,
  Loader2,
  Plus,
  Search,
  Table2,
  Trash2
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import {
  addColumn,
  createTable,
  deleteColumn,
  deleteTable,
  generateSqlPreview,
  getSchema,
  updateColumn,
  updateTable
} from '../../services/databaseService';
import { addActivity } from '../../services/activityService';
import { generateDatabaseSchema } from '../../services/aiService';

const projectId = () => localStorage.getItem('api_fe_active_project_id') || 'default';

const dataTypes = ['UUID', 'VARCHAR(255)', 'TEXT', 'INTEGER', 'DECIMAL(12,2)', 'BOOLEAN', 'DATE', 'TIMESTAMP', 'JSONB'];
const starterColumns = [
  { id: 'id', name: 'id', type: 'UUID', primaryKey: true, nullable: false, unique: true },
  { id: 'created_at', name: 'created_at', type: 'TIMESTAMP', primaryKey: false, nullable: false, unique: false }
];

export default function Database() {
  const [schema, setSchema] = useState({ tables: [] });
  const [activeTableId, setActiveTableId] = useState('');
  const [searchTable, setSearchTable] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const tables = schema.tables || [];
  const activeTable = tables.find((table) => table.id === activeTableId) || tables[0];
  const sql = useMemo(() => generateSqlPreview(schema), [schema]);
  const filteredTables = tables.filter((table) => table.name.toLowerCase().includes(searchTable.toLowerCase()));

  useEffect(() => {
    let mounted = true;
    getSchema(projectId())
      .then((data) => {
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
      .catch((error) => toast.error(error.message || 'Không thể tải schema'))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const syncSchema = (nextSchema) => {
    setSchema(nextSchema);
    if (!nextSchema.tables.some((table) => table.id === activeTableId)) {
      setActiveTableId(nextSchema.tables[0]?.id || '');
    }
  };

  const handleServiceAction = async (action, successMessage, activityText) => {
    setSaving(true);
    try {
      const nextSchema = await action();
      syncSchema(nextSchema);
      toast.success(successMessage);
      if (activityText) addActivity('database', activityText);
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật schema');
    } finally {
      setSaving(false);
    }
  };

  const handleNewTable = (name = `table_${Date.now().toString().slice(-4)}`) => {
    handleServiceAction(
      () => createTable(projectId(), { name, columns: starterColumns }),
      `Đã tạo bảng ${name}`,
      `Đã tạo bảng: ${name}`
    );
  };

  const handleAiSchema = async () => {
    const generated = await generateDatabaseSchema({ prompt: 'booking database schema' });
    if (!generated?.tables?.length) {
      toast.error('AI chưa tạo được schema');
      return;
    }
    const name = generated.tables[0].name || 'bookings';
    handleServiceAction(
      () => createTable(projectId(), {
        name,
        columns: generated.tables[0].columns
      }),
      'AI đã gợi ý schema bookings',
      'AI đã gợi ý schema database'
    );
  };

  const handleRenameTable = (name) => {
    if (!activeTable || !name.trim() || name === activeTable.name) return;
    handleServiceAction(
      () => updateTable(projectId(), activeTable.id, { name }),
      'Đã cập nhật tên bảng',
      `Đã đổi tên bảng thành ${name}`
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

  const handleCopySql = () => {
    navigator.clipboard.writeText(sql);
    toast.success('Đã copy SQL');
  };

  const handleExportSql = () => {
    const blob = new Blob([sql], { type: 'text/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'api-fe-schema.sql';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Đã export SQL');
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-950 text-slate-300">
      <header className="z-20 flex min-h-16 shrink-0 flex-col gap-3 border-b border-white/5 bg-slate-900/60 px-4 py-4 backdrop-blur-3xl lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
            <DatabaseIcon size={18} />
          </div>
          <div>
            <h1 className="font-black tracking-tight text-white">Thiết kế CSDL</h1>
            <p className="text-xs text-slate-500">Database Designer + SQL Preview</p>
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

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_500px]">
        <aside className="min-h-0 border-b border-white/5 bg-slate-900/55 lg:border-b-0 lg:border-r">
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
                onChange={(event) => setSearchTable(event.target.value)}
                placeholder="Tìm bảng..."
                className="w-full rounded-xl border border-white/5 bg-slate-950/60 py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          <div className="max-h-72 space-y-2 overflow-y-auto p-3 custom-scrollbar lg:max-h-none">
            {loading && <div className="p-6 text-center text-slate-500"><Loader2 className="mx-auto mb-2 animate-spin" />Đang tải schema...</div>}
            {!loading && filteredTables.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-5 text-center text-sm text-slate-500">
                Chưa có bảng nào. Tạo bảng đầu tiên hoặc dùng AI để gợi ý schema.
              </div>
            )}
            {filteredTables.map((table) => (
              <button
                key={table.id}
                onClick={() => setActiveTableId(table.id)}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  activeTable?.id === table.id ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-white/5 bg-slate-950/40 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-bold text-white">{table.name}</span>
                  <span className="text-[10px] text-slate-500">{table.columns.length} cột</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {table.columns.slice(0, 3).map((column) => (
                    <span key={column.id} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">{column.name}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-white/5 p-3">
            <button disabled={saving} onClick={() => handleNewTable()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-60">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} className="text-indigo-300" />}
              Bảng mới
            </button>
          </div>
        </aside>

        <div className="min-h-0 border-t border-white/5 bg-black/20 xl:border-l xl:border-t-0">
          <div className="flex h-full min-h-[420px] flex-col">
            <div className="flex items-center justify-between border-b border-white/5 bg-slate-900/60 px-4 py-3">
              <div>
                <h2 className="text-sm font-bold text-white">SQL Preview</h2>
                <p className="text-xs text-slate-500">Sinh realtime từ table editor</p>
              </div>
              <button onClick={handleCopySql} className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white" title="Copy SQL">
                <Copy size={16} />
              </button>
            </div>
            <div className="min-h-0 flex-1 p-2">
              <Editor height="100%" defaultLanguage="sql" theme="vs-dark" value={sql} options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, wordWrap: 'on', scrollBeyondLastLine: false }} />
            </div>
          </div>
        </div>

        <main className="min-h-0 overflow-y-auto p-4 custom-scrollbar lg:p-6 xl:border-l xl:border-white/5 bg-slate-950">
          {!activeTable ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-indigo-500/25 bg-slate-900/35 p-8 text-center">
              <DatabaseIcon size={42} className="mb-4 text-indigo-300" />
              <h2 className="text-xl font-black text-white">Chưa có bảng nào</h2>
              <p className="mt-2 max-w-md text-sm text-slate-400">Chưa có bảng nào. Tạo bảng đầu tiên hoặc dùng AI để gợi ý schema.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button onClick={() => handleNewTable()} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-500">Tạo bảng đầu tiên</button>
                <button onClick={handleAiSchema} className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-5 py-3 text-sm font-bold text-violet-200 transition hover:bg-violet-500/20">AI gợi ý schema</button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <section className="rounded-2xl border border-white/5 bg-slate-900/45 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <label className="block flex-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tên bảng</span>
                    <input
                      defaultValue={activeTable.name}
                      onBlur={(event) => handleRenameTable(event.target.value.trim())}
                      className="mt-2 w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-3 text-lg font-black text-white outline-none focus:border-indigo-500/50"
                    />
                  </label>
                  <button onClick={() => handleDeleteTable(activeTable)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500/20">
                    <Trash2 size={16} /> Xóa bảng
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-white/5 bg-slate-900/45">
                <div className="flex items-center justify-between border-b border-white/5 p-4">
                  <h2 className="text-sm font-bold text-white">Danh sách cột</h2>
                  <button onClick={handleAddColumn} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 disabled:opacity-50">
                    <Plus size={14} /> Thêm cột
                  </button>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  <div className="min-w-[500px]">
                    <div className="grid grid-cols-[1fr_1fr_60px_60px_60px_40px] gap-2 border-b border-white/5 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <span>Tên cột</span>
                      <span>Kiểu DL</span>
                      <span className="text-center">PK</span>
                      <span className="text-center">Null</span>
                      <span className="text-center">Uniq</span>
                      <span />
                    </div>
                    {activeTable.columns.map((column) => (
                      <div key={column.id} className="grid grid-cols-[1fr_1fr_60px_60px_60px_40px] items-center gap-2 border-b border-white/5 px-4 py-3 last:border-b-0">
                        <div className="flex items-center gap-2 min-w-0">
                          {column.primaryKey ? <Key size={13} className="shrink-0 text-amber-300" /> : <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />}
                          <input
                            defaultValue={column.name}
                            onBlur={(event) => handleUpdateColumn(column, { name: event.target.value.trim() })}
                            className="min-w-0 w-full rounded-lg border border-white/5 bg-slate-950/60 px-2 py-2 text-xs font-semibold text-white outline-none focus:border-indigo-500/50"
                          />
                        </div>
                        <select
                          value={column.type}
                          onChange={(event) => handleUpdateColumn(column, { type: event.target.value })}
                          className="rounded-lg border border-white/5 bg-slate-950/60 px-2 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50 min-w-0 w-full"
                        >
                          {dataTypes.map((type) => <option key={type} value={type} className="bg-slate-900">{type}</option>)}
                        </select>
                        {['primaryKey', 'nullable', 'unique'].map((field) => (
                          <label key={field} className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={Boolean(column[field])}
                              onChange={(event) => handleUpdateColumn(column, { [field]: event.target.checked, ...(field === 'primaryKey' && event.target.checked ? { nullable: false, unique: true } : {}) })}
                              className="peer sr-only"
                            />
                            <span className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-slate-950 text-slate-600 transition peer-checked:border-indigo-500/40 peer-checked:bg-indigo-500/20 peer-checked:text-indigo-200">
                              <Check size={12} />
                            </span>
                          </label>
                        ))}
                        <div className="flex justify-center">
                          <button onClick={() => handleDeleteColumn(column)} className="rounded-md p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-300">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
