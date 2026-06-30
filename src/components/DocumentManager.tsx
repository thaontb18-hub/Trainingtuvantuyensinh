import React, { useState } from 'react';
import { AdmissionDocument } from '../types';
import { Plus, Trash2, FileText, CheckCircle2, ChevronDown, ChevronUp, Edit2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DocumentManagerProps {
  documents: AdmissionDocument[];
  onAddDocument: (doc: AdmissionDocument) => void;
  onDeleteDocument: (id: string) => void;
  onRestoreDefaults: () => void;
}

export default function DocumentManager({
  documents,
  onAddDocument,
  onDeleteDocument,
  onRestoreDefaults,
}: DocumentManagerProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [expandedDocId, setExpandedDocId] = useState<string | null>('greenwich-scholarship-2025');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newDoc: AdmissionDocument = {
      id: `doc-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      isTemplate: false,
    };

    onAddDocument(newDoc);
    setTitle('');
    setContent('');
    setIsAdding(false);
    setExpandedDocId(newDoc.id);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-6" id="document-manager">
      {/* Header section */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-800 text-left transition-colors hover:from-slate-850"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Kho Tài Liệu Tuyển Sinh Nền</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {documents.length} tài liệu làm dữ liệu đối chiếu thông tin khi chấm điểm
            </p>
          </div>
        </div>
        <div className="text-slate-400">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {/* Body section */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-5"
          >
            {/* Quick guidance */}
            <div className="bg-amber-500/5 border border-amber-500/20 text-amber-200 text-sm rounded-xl p-4 mb-4 flex items-start gap-3">
              <CheckCircle2 size={18} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="leading-relaxed">
                Hệ thống đã nạp sẵn <strong>Tài liệu Học bổng & Tuyển sinh Greenwich Việt Nam 2025</strong> cực kỳ đầy đủ. Bạn có thể tự dán thêm tài liệu của bất kỳ trường nào khác để thử tài tư vấn!
              </p>
            </div>

            {/* Actions Panel */}
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <span className="text-sm font-medium text-slate-300">Danh sách tài liệu ({documents.length}):</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onRestoreDefaults}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition border border-slate-700"
                >
                  <RotateCcw size={14} />
                  Khôi phục mặc định
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(!isAdding)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Plus size={14} />
                  Thêm tài liệu mới
                </button>
              </div>
            </div>

            {/* Document adding form */}
            <AnimatePresence>
              {isAdding && (
                <motion.form
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleSubmit}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4 shadow-inner"
                >
                  <h3 className="text-sm font-semibold text-amber-400 mb-3">Tải lên/Dán tài liệu mới</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Tên tài liệu / Tiêu đề:</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ví dụ: Chính sách học phí ngành IT Đại học Greenwich 2025"
                        required
                        className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Nội dung chi tiết (Dán học phí, ưu đãi, FAQ...):</label>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Dán toàn bộ văn bản quy chế, thông tin học bổng, điều kiện tuyển sinh của trường tại đây..."
                        rows={6}
                        required
                        className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition font-mono"
                      />
                    </div>
                    <div className="flex justify-end gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-lg font-bold shadow-lg shadow-amber-500/10 transition"
                      >
                        Lưu tài liệu
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Document list */}
            <div className="space-y-3">
              {documents.map((doc) => {
                const isExpanded = expandedDocId === doc.id;
                return (
                  <div
                    key={doc.id}
                    className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                      isExpanded
                        ? 'bg-slate-950 border-amber-500/40 shadow-md shadow-amber-500/5'
                        : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Doc Title & Actions */}
                    <div className="flex items-center justify-between p-3">
                      <button
                        onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                        className="flex-1 flex items-center gap-2 text-left text-sm font-medium text-slate-200 hover:text-slate-100"
                      >
                        <FileText size={16} className={doc.isTemplate ? 'text-amber-400' : 'text-slate-400'} />
                        <span>{doc.title}</span>
                        {doc.isTemplate && (
                          <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] uppercase tracking-wider font-bold shrink-0">
                            Mẫu sẵn có
                          </span>
                        )}
                      </button>

                      <div className="flex items-center gap-1">
                        {!doc.isTemplate && (
                          <button
                            onClick={() => onDeleteDocument(doc.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded transition"
                            title="Xóa tài liệu"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-200 rounded transition"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Doc Content Details */}
                    {isExpanded && (
                      <div className="p-3 bg-slate-950 border-t border-slate-900 text-xs text-slate-300 leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-line font-mono">
                        {doc.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
