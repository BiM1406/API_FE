import React, { useState, useEffect } from 'react';
import { Plus, Play, Database as DatabaseIcon, Code, Shield, Table2, Key, Search, MoreVertical, Copy, Hash, Type, Link as LinkIcon, Edit3, Trash2, Check } from 'lucide-react';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { logActivity } from '../../utils/activityLogger';

export default function Database() {
  const [activeTable, setActiveTable] = useState('users');
  const [searchTable, setSearchTable] = useState('');
  const [editingTable, setEditingTable] = useState(null);
  const [editTableName, setEditTableName] = useState('');
  const [manualSQL, setManualSQL] = useState('');
  const [isManuallyEdited, setIsManuallyEdited] = useState(false);

  const [tableList, setTableList] = useState([
    {
      name: 'users',
      rows: 1542,
      columns: [
        { name: 'id', type: 'UUID', meta: 'PK', icon: Key, color: 'text-amber-400' },
        { name: 'email', type: 'VARCHAR', meta: 'UNIQUE', icon: Type, color: 'text-indigo-400' },
        { name: 'password', type: 'VARCHAR', meta: '', icon: Type, color: 'text-indigo-400' },
        { name: 'created_at', type: 'TIMESTAMP', meta: 'DEFAULT NOW', icon: Hash, color: 'text-emerald-400' }
      ]
    },
    {
      name: 'posts',
      rows: 8930,
      columns: [
        { name: 'id', type: 'UUID', meta: 'PK', icon: Key, color: 'text-amber-400' },
        { name: 'user_id', type: 'UUID', meta: 'FK (users)', icon: LinkIcon, color: 'text-rose-400' },
        { name: 'content', type: 'TEXT', meta: '', icon: Type, color: 'text-indigo-400' },
        { name: 'created_at', type: 'TIMESTAMP', meta: 'DEFAULT NOW', icon: Hash, color: 'text-emerald-400' }
      ]
    }
  ]);

  const filteredTables = tableList.filter(t => t.name.toLowerCase().includes(searchTable.toLowerCase()));

  const handleNewTable = () => {
    const newTableName = `table_${Date.now().toString().slice(-4)}`;
    const newTable = {
      name: newTableName,
      rows: 0,
      columns: [
        { name: 'id', type: 'UUID', meta: 'PK', icon: Key, color: 'text-amber-400' },
        { name: 'created_at', type: 'TIMESTAMP', meta: 'DEFAULT NOW', icon: Hash, color: 'text-emerald-400' }
      ]
    };
    setTableList([...tableList, newTable]);
    setActiveTable(newTableName);
    toast.success(`Đã tạo bảng ${newTableName}`);
    logActivity('database', `Đã tạo bảng: ${newTableName}`);
  };

  const handleDeleteTable = (e, tableName) => {
    e.stopPropagation();
    if (tableList.length <= 1) {
      toast.error("Không thể xóa bảng cuối cùng!");
      return;
    }
    const updated = tableList.filter(t => t.name !== tableName);
    setTableList(updated);
    if (activeTable === tableName) setActiveTable(updated[0].name);
    toast.success(`Đã xóa bảng ${tableName}`);
    logActivity('database', `Đã xóa bảng: ${tableName}`);
  };

  const handleRunSQL = () => {
    // Mô phỏng quá trình chạy BE để xử lý Database
    const promise = new Promise(resolve => setTimeout(resolve, 1500));
    toast.promise(promise, {
      loading: 'Đang gửi Request tới Database Engine...',
      success: 'Thực thi SQL thành công!',
      error: 'Lỗi thực thi SQL'
    });
    logActivity('database', 'Đã chạy thực thi SQL');
  };

  const handleRenameStart = (e, tableName) => {
    e.stopPropagation();
    setEditingTable(tableName);
    setEditTableName(tableName);
  };

  const handleRenameSubmit = (e, oldName) => {
    e.preventDefault();
    if (!editTableName.trim()) {
      setEditingTable(null);
      return;
    }
    const newName = editTableName.trim();
    setTableList(tableList.map(t => t.name === oldName ? {...t, name: newName} : t));
    if (activeTable === oldName) setActiveTable(newName);
    setEditingTable(null);
    toast.success(`Đã đổi tên thành ${newName}`);
  };

  const generateSQL = () => {
    let sql = `-- SQL Schema for ChatDMP App\nCREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n`;

    tableList.forEach(table => {
      sql += `CREATE TABLE ${table.name} (\n`;
      const colStrings = table.columns.map(col => {
         let def = `  ${col.name} ${col.type}`;
         if (col.meta === 'PK') def += ' PRIMARY KEY DEFAULT uuid_generate_v4()';
         else if (col.meta === 'UNIQUE') def += ' UNIQUE NOT NULL';
         else if (col.meta === 'DEFAULT NOW') def += ' WITH TIME ZONE DEFAULT NOW()';
         else if (col.meta.startsWith('FK')) {
            const match = col.meta.match(/FK \((.*?)\)/);
            if (match) def += ` REFERENCES ${match[1]}(id) ON DELETE CASCADE`;
         }
         else if (col.name === 'password' || col.name === 'content') def += ' NOT NULL';
         return def;
      });
      sql += colStrings.join(',\n') + '\n);\n\n';
    });

    tableList.forEach(table => {
      table.columns.forEach(col => {
        if (col.meta.startsWith('FK')) {
          sql += `-- Index optimization\nCREATE INDEX idx_${table.name}_${col.name} ON ${table.name}(${col.name});\n`;
        }
      });
    });

    return sql.trim();
  };

  useEffect(() => {
    if (!isManuallyEdited) {
      setManualSQL(generateSQL());
    }
  }, [tableList, isManuallyEdited]); // eslint-disable-line

  const handleSQLChange = (value) => {
    setManualSQL(value);
    setIsManuallyEdited(true);
  };

  const syncSQLToUI = () => {
    try {
      const tableRegex = /CREATE TABLE\s+([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi;
      let newTables = [];
      let match;
      
      const getIconAndColor = (type, meta, name) => {
        if(meta === 'PK' || meta.includes('PRIMARY')) return { icon: Key, color: 'text-amber-400' };
        if(meta.includes('FK') || meta.includes('REFERENCES')) return { icon: LinkIcon, color: 'text-rose-400' };
        if(type && type.includes('TIMESTAMP')) return { icon: Hash, color: 'text-emerald-400' };
        return { icon: Type, color: 'text-indigo-400' };
      };

      while ((match = tableRegex.exec(manualSQL)) !== null) {
         const tableName = match[1];
         const columnsRaw = match[2].split(/,\s*\n/).filter(line => line.trim().length > 0);
         
         const columns = columnsRaw.map(colRaw => {
            const cleanRaw = colRaw.trim();
            const firstSpace = cleanRaw.indexOf(' ');
            if (firstSpace === -1) return null;
            
            const colName = cleanRaw.substring(0, firstSpace).trim();
            const remainder = cleanRaw.substring(firstSpace + 1).trim();
            
            const secondSpace = remainder.indexOf(' ');
            let colType = remainder;
            let metaRaw = '';
            
            if (secondSpace !== -1) {
              colType = remainder.substring(0, secondSpace).trim();
              metaRaw = remainder.substring(secondSpace + 1).trim();
            }

            let meta = '';
            if (metaRaw.includes('PRIMARY KEY')) meta = 'PK';
            else if (metaRaw.includes('UNIQUE')) meta = 'UNIQUE';
            else if (metaRaw.includes('DEFAULT NOW')) meta = 'DEFAULT NOW';
            else if (metaRaw.includes('REFERENCES')) {
               const fkMatch = metaRaw.match(/REFERENCES\s+([a-zA-Z0-9_]+)/i);
               if (fkMatch) meta = `FK (${fkMatch[1]})`;
            } else if (metaRaw.includes('NOT NULL')) meta = 'NOT NULL';

            const style = getIconAndColor(colType, meta, colName);

            return {
               name: colName,
               type: colType,
               meta: meta,
               icon: style.icon,
               color: style.color
            };
         }).filter(Boolean);

         const existingTable = tableList.find(t => t.name === tableName);
         newTables.push({
           name: tableName,
           rows: existingTable ? existingTable.rows : 0,
           columns: columns
         });
      }

      if (newTables.length > 0) {
         setTableList(newTables);
         if (!newTables.find(t => t.name === activeTable)) setActiveTable(newTables[0].name);
         setIsManuallyEdited(false);
         toast.success("Đã phân tích code và cập nhật lại giao diện!");
      } else {
         toast.error("Không tìm thấy cấu trúc bảng nào phân tích được từ Code.");
      }
    } catch (error) {
       toast.error("Lỗi khi đọc mã SQL. Vui lòng đảm bảo cấu trúc CREATE TABLE hợp lệ.");
    }
  };

  return (
    <div className="flex-1 min-h-0 w-full bg-slate-950 text-slate-300 font-sans flex flex-col overflow-hidden relative">
      {/* Background Deep Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[0%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 shrink-0 relative z-40 bg-slate-900/60 backdrop-blur-3xl border-b border-white/5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-inner">
            <DatabaseIcon size={16} />
          </div>
          <h2 className="font-black text-white tracking-tight">Thiết kế Cơ sở dữ liệu</h2>
        </div>

        <button 
          onClick={handleRunSQL}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 active:scale-95 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <Play size={16} className="relative z-10" />
          <span className="relative z-10">Chạy SQL</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden z-10 relative">
        
        {/* Sidebar - Table Drawer */}
        <div className="w-80 border-r border-white/5 bg-slate-900/60 backdrop-blur-2xl flex flex-col relative z-20">
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold tracking-tight text-sm flex items-center gap-2">
                <Table2 size={16} className="text-indigo-400" /> Bảng
              </h3>
              <span className="text-[10px] bg-slate-950 font-bold text-slate-400 px-2.5 py-1 rounded-md border border-white/5 shadow-inner">Tổng cộng {filteredTables.length}</span>
            </div>
            
            <div className="relative group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Tìm bảng..." 
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-slate-200 placeholder-slate-500 shadow-inner"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {filteredTables.map((table) => (
              <div 
                key={table.name}
                onClick={() => setActiveTable(table.name)}
                className={`p-4 rounded-xl border transition-all cursor-pointer group shadow-xl ${activeTable === table.name ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-950/40 border-white/5 hover:border-white/10 hover:bg-slate-900/80'}`}
              >
                <div className="flex justify-between items-center mb-3">
                  {editingTable === table.name ? (
                    <form onSubmit={(e) => handleRenameSubmit(e, table.name)} className="flex items-center gap-2">
                       <input 
                         autoFocus
                         value={editTableName}
                         onChange={e => setEditTableName(e.target.value)}
                         onBlur={(e) => handleRenameSubmit(e, table.name)}
                         onClick={e => e.stopPropagation()}
                         className="bg-slate-900 border border-indigo-500 rounded px-2 py-0.5 text-sm font-bold text-indigo-300 outline-none w-32 shadow-inner focus:ring-1 focus:ring-indigo-500/50"
                       />
                    </form>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${activeTable === table.name ? 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-700'}`}></div>
                      <span className={`font-bold transition-colors text-sm ${activeTable === table.name ? 'text-indigo-400' : 'text-slate-300 group-hover:text-white'}`}>{table.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                       className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors" 
                       onClick={(e) => handleRenameStart(e, table.name)}
                     >
                       <Edit3 size={14}/>
                     </button>
                  </div>
                </div>
                <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-white/5">
                  {table.columns.map((col, idx) => {
                    const ColIcon = col.icon;
                    return (
                      <div key={idx} className="flex justify-between items-center text-[11px] group/col">
                        <div className="flex items-center gap-2">
                           <ColIcon size={12} className={`${col.color} opacity-70 group-hover/col:opacity-100 transition-opacity`} />
                           <span className="text-slate-300 font-medium">{col.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           {col.meta && <span className="bg-slate-800 text-[9px] px-1.5 py-0.5 rounded font-mono text-slate-400 tracking-wider hidden group-hover/col:block">{col.meta}</span>}
                           <span className={`font-mono font-bold ${col.color}`}>{col.type}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-3 flex justify-between items-center px-1">
                   <span>{table.rows.toLocaleString()} bản ghi</span>
                   <button 
                     className="hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100" 
                     onClick={(e) => handleDeleteTable(e, table.name)}
                   >
                     <Trash2 size={12}/>
                   </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/5 bg-slate-900/80 backdrop-blur-xl">
             <button 
               onClick={handleNewTable}
               className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition-all flex justify-center items-center gap-2 font-bold text-sm active:scale-95 group outline-none focus:ring-2 focus:ring-indigo-500/50"
             >
               <Plus size={18} className="text-indigo-400 group-hover:rotate-90 transition-transform duration-300" /> 
               Bảng mới
             </button>
          </div>
        </div>

        {/* Content Area - SQL Preview */}
        <div className="flex-1 p-8 flex flex-col relative z-10 bg-black/20">
          <div className="flex justify-between items-center mb-6 bg-slate-900/60 backdrop-blur-xl p-4 rounded-2xl border border-white/5 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 shadow-inner">
                <Code size={18} />
              </div>
              <div>
                <h3 className="text-white font-bold tracking-tight text-sm">Cấu trúc SQL được tạo</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Ngôn ngữ PostgreSQL tối ưu cho ChatDMP</p>
              </div>
            </div>
            <div className="flex gap-2">
               {isManuallyEdited && (
                 <>
                   <button 
                     onClick={syncSQLToUI}
                     className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-2 transition-all font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95"
                   >
                     <Check size={14} /> Lưu & Bật đồng bộ UI
                   </button>
                   <button 
                     key="restore-btn"
                     onClick={() => {
                       setIsManuallyEdited(false);
                       toast.success("Đã khôi phục mã SQL về mặc định!");
                     }}
                     className="px-4 py-2 bg-slate-950 border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center gap-2 transition-all font-bold text-xs shadow-inner focus:outline-none focus:ring-1 focus:ring-indigo-500/50 active:scale-95"
                   >
                     Khôi phục gốc
                   </button>
                 </>
               )}
               <button 
                 onClick={() => {
                   navigator.clipboard.writeText(manualSQL);
                   toast.success("Đã sao chép mã SQL vào bộ nhớ đệm!");
                 }}
                 className="px-4 py-2 bg-slate-950 border border-white/5 hover:bg-white/5 text-slate-300 rounded-lg flex items-center gap-2 transition-all font-bold text-xs shadow-inner focus:outline-none focus:ring-1 focus:ring-white/20 active:scale-95"
               >
                 <Copy size={14} className="text-slate-400" /> Sao chép
               </button>
            </div>
          </div>

          <div className="flex-1 relative group overflow-hidden bg-[#1e1e1e] rounded-2xl shadow-2xl border border-white/10 flex flex-col">
            <div className="h-10 bg-[#2d2d2d] border-b border-black/40 flex items-center px-4 gap-2 shrink-0">
               <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80 border border-black/20"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-black/20"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-black/20"></div>
               </div>
               <div className="mx-auto bg-black/20 px-4 py-1 rounded-md border border-white/5 text-[10px] font-medium text-slate-400 tracking-wider font-mono">ChatDMP_Schema.sql</div>
               <div className="w-10"></div> {/* Spacer for symmetry */}
            </div>
            
            <div className="flex-1 relative overflow-hidden custom-scrollbar p-0 flex flex-col rounded-b-2xl">
               {/* Background subtle glow inside code block to make it look premium */}
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none mix-blend-screen opacity-50 block group-hover:opacity-100 transition-opacity duration-700"></div>
               
               <div className="flex-1 relative z-10 w-full pt-4">
                 <Editor
                   height="100%"
                   defaultLanguage="sql"
                   theme="vs-dark"
                   value={manualSQL}
                   onChange={handleSQLChange}
                   options={{
                     minimap: { enabled: false },
                     fontSize: 14,
                     fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                     wordWrap: "on",
                     contextmenu: false,
                     lineHeight: 1.7,
                     padding: { top: 16, bottom: 16 },
                     scrollBeyondLastLine: false,
                     smoothScrolling: true,
                     cursorBlinking: "smooth",
                     cursorSmoothCaretAnimation: "on"
                   }}
                 />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
