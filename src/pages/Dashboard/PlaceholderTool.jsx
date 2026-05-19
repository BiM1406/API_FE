import React, { useEffect, useState } from 'react';
import { BookOpen, Bot, Boxes, Copy, Download, Network, Plus, Save, Trash2, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createCollection, deleteCollection, getCollections, saveRequest } from '../../services/collectionService';
import { addVariable, createEnvironment, deleteVariable, getActiveEnvironment, getEnvironments, setActiveEnvironment, updateVariable } from '../../services/environmentService';
import { exportMarkdown, generateDocumentationFromCollections, getDocumentation, saveDocumentation } from '../../services/documentationService';
import { createMockEndpoint, deleteMockEndpoint, generateMockResponse, getMockEndpoints, updateMockEndpoint } from '../../services/mockServerService';
import { addActivity } from '../../services/activityService';

const projectId = () => localStorage.getItem('api_fe_active_project_id') || 'default';

const toolConfig = {
  collections: { title: 'Collections', description: 'Lưu và quản lý request theo project.', icon: Boxes },
  environments: { title: 'Environments', description: 'Quản lý biến {{baseUrl}}, {{token}} và active environment.', icon: Network },
  documentation: { title: 'Documentation', description: 'Sinh tài liệu API từ collections/request.', icon: BookOpen },
  mockServer: { title: 'Mock Server', description: 'Thiết kế mock endpoint và response mẫu.', icon: Bot }
};

export default function PlaceholderTool({ type = 'collections' }) {
  const config = toolConfig[type] || toolConfig.collections;
  const Icon = config.icon;

  return (
    <div className="min-h-full w-full p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-white/5 bg-slate-900/50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
              <Icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-300">Project workspace module</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white">{config.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{config.description}</p>
            </div>
          </div>
        </header>

        {type === 'collections' && <CollectionsPanel />}
        {type === 'environments' && <EnvironmentsPanel />}
        {type === 'documentation' && <DocumentationPanel />}
        {type === 'mockServer' && <MockServerPanel />}
      </div>
    </div>
  );
}

function CollectionsPanel() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('Auth APIs');
  const [loading, setLoading] = useState(true);

  const load = () => getCollections(projectId()).then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) return toast.error('Tên collection không được để trống');
    await createCollection(projectId(), { name });
    addActivity('collection', `Tạo collection ${name}`);
    toast.success('Đã tạo collection');
    setName('');
    load();
  };

  const handleSaveSample = async (collectionId) => {
    await saveRequest(collectionId, null, { method: 'GET', url: '{{baseUrl}}/users', headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }], body: '' });
    toast.success('Đã lưu request mẫu');
    load();
  };

  return (
    <section className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input value={name} onChange={(event) => setName(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/5 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50" placeholder="Tên collection" />
        <button onClick={handleCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-500"><Plus size={16} /> Tạo collection</button>
      </div>
      <ListState loading={loading} empty={items.length === 0} emptyText="Chưa có collection nào." />
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/5 bg-slate-950/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-white">{item.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{(item.requests || []).length} request, {(item.folders || []).length} folder</p>
              </div>
              <button onClick={async () => { await deleteCollection(item.id); toast.success('Đã xóa collection'); load(); }} className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-300"><Trash2 size={16} /></button>
            </div>
            <button onClick={() => handleSaveSample(item.id)} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10"><Save size={14} /> Lưu request mẫu</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function EnvironmentsPanel() {
  const [envs, setEnvs] = useState([]);
  const [active, setActive] = useState(null);
  const [name, setName] = useState('Development');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await getEnvironments(projectId());
    const activeEnv = await getActiveEnvironment(projectId());
    setEnvs(data);
    setActive(activeEnv);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    await createEnvironment(projectId(), { name });
    toast.success('Đã tạo environment');
    setName('');
    load();
  };

  const handleAddVar = async () => {
    if (!active) return;
    await addVariable(active.id, { key: 'newVar', currentValue: 'value', type: 'text' });
    toast.success('Đã thêm biến');
    load();
  };

  return (
    <section className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input value={name} onChange={(event) => setName(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/5 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50" />
        <button onClick={handleCreate} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-500">Tạo environment</button>
      </div>
      <ListState loading={loading} empty={envs.length === 0} emptyText="Chưa có environment." />
      <div className="mt-5 grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="space-y-2">
          {envs.map((env) => (
            <button key={env.id} onClick={() => { setActiveEnvironment(projectId(), env.id); load(); }} className={`w-full rounded-xl border p-3 text-left text-sm font-bold ${active?.id === env.id ? 'border-indigo-500/40 bg-indigo-500/10 text-white' : 'border-white/5 bg-slate-950/40 text-slate-400'}`}>
              {env.name}
            </button>
          ))}
        </div>
        {active && (
          <div className="rounded-2xl border border-white/5 bg-slate-950/35 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-black text-white">{active.name}</h3>
              <button onClick={handleAddVar} className="rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10">Thêm biến</button>
            </div>
            <div className="space-y-2">
              {(active.variables || []).map((variable) => (
                <div key={variable.id} className="grid gap-2 md:grid-cols-[1fr_1fr_90px_36px]">
                  <input value={variable.key} onChange={(event) => updateVariable(active.id, variable.id, { key: event.target.value }).then(load)} className="rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-xs text-white" />
                  <input type={variable.type === 'secret' ? 'password' : 'text'} value={variable.currentValue} onChange={(event) => updateVariable(active.id, variable.id, { currentValue: event.target.value }).then(load)} className="rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-xs text-white" />
                  <select value={variable.type} onChange={(event) => updateVariable(active.id, variable.id, { type: event.target.value }).then(load)} className="rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-xs text-white">
                    <option value="text">text</option>
                    <option value="secret">secret</option>
                  </select>
                  <button onClick={() => deleteVariable(active.id, variable.id).then(load)} className="rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-300"><Trash2 size={15} className="mx-auto" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function DocumentationPanel() {
  const [docs, setDocs] = useState({ endpoints: [] });
  const [loading, setLoading] = useState(true);
  const load = () => getDocumentation(projectId()).then(setDocs).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    const generated = await generateDocumentationFromCollections(projectId());
    setDocs(generated);
    toast.success('Đã sinh documentation từ collections');
  };

  const handleExport = async () => {
    const markdown = await exportMarkdown(projectId());
    await navigator.clipboard.writeText(markdown);
    toast.success('Đã copy Markdown');
  };

  return (
    <section className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
      <div className="flex flex-wrap gap-2">
        <button onClick={handleGenerate} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-500"><Wand2 size={16} /> Generate docs</button>
        <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/10"><Download size={16} /> Export Markdown</button>
      </div>
      <ListState loading={loading} empty={(docs.endpoints || []).length === 0} emptyText="Chưa có documentation. Hãy tạo collection/request rồi generate docs." />
      <div className="mt-5 space-y-3">
        {(docs.endpoints || []).map((endpoint) => (
          <div key={endpoint.id} className="rounded-2xl border border-white/5 bg-slate-950/40 p-4">
            <p className="font-mono text-sm font-black text-indigo-300">{endpoint.method} {endpoint.url}</p>
            <textarea defaultValue={endpoint.description} onBlur={(event) => saveDocumentation(projectId(), { ...docs, endpoints: docs.endpoints.map((item) => item.id === endpoint.id ? { ...item, description: event.target.value } : item) }).then(load)} className="mt-3 min-h-20 w-full rounded-xl border border-white/5 bg-slate-900/60 p-3 text-sm text-slate-200 outline-none focus:border-indigo-500/50" />
          </div>
        ))}
      </div>
    </section>
  );
}

function MockServerPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({ method: 'GET', path: '/api/mock', statusCode: 200, responseBody: '{\n  "success": true\n}' });
  const load = () => getMockEndpoints(projectId()).then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await createMockEndpoint(projectId(), draft);
      toast.success('Đã tạo mock endpoint');
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAi = async () => {
    const generated = await generateMockResponse(draft);
    setDraft((current) => ({ ...current, ...generated }));
    toast.success('AI đã sinh mock response');
  };

  return (
    <section className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
      <div className="grid gap-3 md:grid-cols-[120px_minmax(0,1fr)_120px]">
        <select value={draft.method} onChange={(event) => setDraft({ ...draft, method: event.target.value })} className="rounded-xl border border-white/5 bg-slate-950/60 px-3 py-3 text-sm text-white">
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((method) => <option key={method}>{method}</option>)}
        </select>
        <input value={draft.path} onChange={(event) => setDraft({ ...draft, path: event.target.value })} className="rounded-xl border border-white/5 bg-slate-950/60 px-4 py-3 text-sm text-white" />
        <input type="number" value={draft.statusCode} onChange={(event) => setDraft({ ...draft, statusCode: Number(event.target.value) })} className="rounded-xl border border-white/5 bg-slate-950/60 px-4 py-3 text-sm text-white" />
      </div>
      <textarea value={draft.responseBody} onChange={(event) => setDraft({ ...draft, responseBody: event.target.value })} className="mt-3 min-h-32 w-full rounded-xl border border-white/5 bg-slate-950/60 p-4 font-mono text-xs text-white" />
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={handleCreate} className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-500">Tạo endpoint</button>
        <button onClick={handleAi} className="inline-flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm font-bold text-violet-200"><Wand2 size={16} /> AI response</button>
      </div>
      <ListState loading={loading} empty={items.length === 0} emptyText="Chưa có mock endpoint." />
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/5 bg-slate-950/40 p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm font-black text-indigo-300">{item.method} {item.path}</p>
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(item.responseBody); toast.success('Đã copy response'); }} className="rounded-lg p-2 text-slate-500 hover:text-white"><Copy size={15} /></button>
                <button onClick={() => deleteMockEndpoint(item.id).then(load)} className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-300"><Trash2 size={15} /></button>
              </div>
            </div>
            <textarea defaultValue={item.responseBody} onBlur={(event) => updateMockEndpoint(item.id, { responseBody: event.target.value }).then(load)} className="mt-3 min-h-24 w-full rounded-xl border border-white/5 bg-slate-900/60 p-3 font-mono text-xs text-slate-200" />
          </div>
        ))}
      </div>
    </section>
  );
}

function ListState({ loading, empty, emptyText }) {
  if (loading) return <p className="mt-5 rounded-xl border border-white/5 bg-slate-950/40 p-5 text-center text-sm text-slate-500">Đang tải...</p>;
  if (empty) return <p className="mt-5 rounded-xl border border-dashed border-white/10 bg-slate-950/30 p-8 text-center text-sm text-slate-500">{emptyText}</p>;
  return null;
}
