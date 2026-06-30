import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Settings, 
  Send, 
  Award, 
  Brain, 
  FileText, 
  RotateCcw, 
  Play, 
  Flag, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  ThumbsUp, 
  MessageSquare, 
  HelpCircle,
  Clock,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AdmissionDocument, 
  ChatMessage, 
  SimulationConfig, 
  EvaluationReport, 
  PersonaRole 
} from './types';
import { DEFAULT_DOCUMENTS } from './defaultDocuments';
import DocumentManager from './components/DocumentManager';

export default function App() {
  // Application State
  const [documents, setDocuments] = useState<AdmissionDocument[]>(() => {
    const saved = localStorage.getItem('admission_documents');
    return saved ? JSON.parse(saved) : DEFAULT_DOCUMENTS;
  });

  const [config, setConfig] = useState<SimulationConfig>({
    role: 'parent',
    personality: 'khó tính',
    difficulty: 'hard',
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('admission_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  // Handle Document Actions
  const handleAddDocument = (newDoc: AdmissionDocument) => {
    setDocuments((prev) => [...prev, newDoc]);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleRestoreDefaults = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục danh sách tài liệu tuyển sinh mặc định?')) {
      setDocuments(DEFAULT_DOCUMENTS);
    }
  };

  // Start Simulation Session
  const handleStartSimulation = async () => {
    if (documents.length === 0) {
      alert('Vui lòng thêm ít nhất một tài liệu tuyển sinh làm cơ sở dữ liệu nền!');
      return;
    }

    setIsSimulating(true);
    setHistory([]);
    setEvaluation(null);
    setErrorMsg(null);
    setIsLoadingChat(true);

    try {
      const response = await fetch('/api/simulation/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          documents,
          history: [], // empty history to trigger initial question
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể khởi tạo phiên trò chuyện với Gemini.');
      }

      const data = await response.json();
      const firstMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setHistory([firstMessage]);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'Lỗi kết nối máy chủ');
      setIsSimulating(false);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoadingChat || !isSimulating) return;

    const userText = inputText.trim();
    setInputText('');

    // Append user message immediately
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...history, userMsg];
    setHistory(updatedHistory);
    setIsLoadingChat(true);

    try {
      const response = await fetch('/api/simulation/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          documents,
          history: updatedHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Gemini gặp lỗi trong quá trình xử lý câu hỏi tiếp theo.');
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setHistory((prev) => [...prev, botMsg]);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'Có lỗi xảy ra khi truyền tin');
    } finally {
      setIsLoadingChat(false);
    }
  };

  // End Session & Generate Comprehensive Evaluation Report
  const handleEndAndEvaluate = async () => {
    if (history.length < 2) {
      alert('Vui lòng thực hiện ít nhất một lượt đối thoại trả lời trước khi kết thúc!');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn kết thúc phiên tư vấn này và yêu cầu Gemini chấm điểm đánh giá chi tiết?')) {
      return;
    }

    setIsSimulating(false);
    setIsLoadingEvaluation(true);
    setEvaluation(null);

    try {
      const response = await fetch('/api/simulation/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          documents,
          history,
        }),
      });

      if (!response.ok) {
        throw new Error('Gặp lỗi khi gửi dữ liệu đánh giá lên Gemini AI.');
      }

      const evalData = await response.json();
      setEvaluation(evalData);
    } catch (error: any) {
      console.error(error);
      alert('Không thể nhận kết quả đánh giá: ' + error.message);
    } finally {
      setIsLoadingEvaluation(false);
    }
  };

  // Personalities options
  const personalities = [
    { value: 'khó tính', label: 'Khó tính & Kỹ lưỡng', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { value: 'cáu gắt', label: 'Dễ cáu gắt & Cộc lốc', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { value: 'rụt rè', label: 'Rụt rè & E ngại', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { value: 'thực dụng', label: 'Thực dụng & Kinh tế', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { value: 'kiêu căng', label: 'Kiêu căng & Thử thách', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden" id="app-container">
      {/* App Header */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10 shrink-0" id="app-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/10">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-slate-800">
              AI Admission Coach <span className="text-indigo-600 font-extrabold">Pro</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Luyện kỹ năng Tư vấn Tuyển sinh Đại học bằng AI</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isSimulating ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Phiên giả lập đang hoạt động
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full border border-slate-200">
              <span className="w-2 h-2 bg-slate-400 rounded-full"></span> Sẵn sàng bắt đầu
            </div>
          )}

          {isSimulating && (
            <button
              onClick={handleEndAndEvaluate}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              Kết thúc & Đánh giá
            </button>
          )}
        </div>
      </header>

      {/* Main Content Body */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR: Config & Doc Storage */}
        <aside className="w-[340px] bg-white border-r border-slate-200 flex flex-col p-5 overflow-y-auto shrink-0 gap-6" id="sidebar-panel">
          
          {/* Section: Config */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Settings size={14} className="text-slate-400" />
              Cấu hình mô phỏng
            </h3>

            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">1. Vai trò khách hàng</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={() => setConfig({ ...config, role: 'parent' })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      config.role === 'parent'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer'
                    } ${isSimulating ? 'opacity-65 cursor-not-allowed' : ''}`}
                  >
                    <User size={12} />
                    Phụ huynh học sinh
                  </button>
                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={() => setConfig({ ...config, role: 'student' })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      config.role === 'student'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer'
                    } ${isSimulating ? 'opacity-65 cursor-not-allowed' : ''}`}
                  >
                    <User size={12} />
                    Học sinh tìm hiểu
                  </button>
                </div>
              </div>

              {/* Personality selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">2. Tính cách nhân vật</label>
                <div className="grid grid-cols-1 gap-2">
                  {personalities.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      disabled={isSimulating}
                      onClick={() => setConfig({ ...config, personality: item.value })}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-medium text-left border transition-all flex items-center justify-between ${
                        config.personality === item.value
                          ? `${item.color} font-bold ring-2 ring-indigo-500/20 shadow-sm border-indigo-400`
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer'
                      } ${isSimulating ? 'opacity-65 cursor-not-allowed' : ''}`}
                    >
                      <span>{item.label}</span>
                      {config.personality === item.value && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Level */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-600">3. Mức độ thử thách</label>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    config.difficulty === 'hard' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {config.difficulty === 'hard' ? 'Khó (Nâng cao)' : 'Dễ (Bám tài liệu)'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={() => setConfig({ ...config, difficulty: 'easy' })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center border transition-all ${
                      config.difficulty === 'easy'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer'
                    } ${isSimulating ? 'opacity-65 cursor-not-allowed' : ''}`}
                  >
                    Chỉ hỏi trong tài liệu
                  </button>
                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={() => setConfig({ ...config, difficulty: 'hard' })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center border transition-all ${
                      config.difficulty === 'hard'
                        ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer'
                    } ${isSimulating ? 'opacity-65 cursor-not-allowed' : ''}`}
                  >
                    Xen kẽ câu hỏi khó
                  </button>
                </div>
                
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  {config.difficulty === 'hard' 
                    ? 'AI sẽ đóng vai cực kỳ nhập tâm, thỉnh thoảng hỏi xoáy những câu hóc búa không có sẵn trong tài liệu như cơ sở vật chất, việc làm, cam kết đầu ra...'
                    : 'AI chỉ đặt những câu hỏi liên quan trực tiếp đến số liệu, quy chế, mức học phí có trong tài liệu đã nạp.'}
                </p>
              </div>

              {/* Start Trigger Button */}
              {!isSimulating ? (
                <button
                  type="button"
                  onClick={handleStartSimulation}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play size={13} fill="currentColor" />
                  Bắt đầu mô phỏng ngay
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn làm mới và bắt đầu một phiên giả lập hoàn toàn khác?')) {
                      handleStartSimulation();
                    }
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-950 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  Làm mới & Đổi cấu hình
                </button>
              )}
            </div>
          </div>

          {/* Section: Documents Manager */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BookOpen size={14} className="text-slate-400" />
              Quản lý tài liệu nền
            </h3>
            <DocumentManager 
              documents={documents}
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDocument}
              onRestoreDefaults={handleRestoreDefaults}
            />
          </div>

        </aside>

        {/* MAIN AREA: Simulated Chat Box */}
        <main className="flex-1 flex flex-col bg-slate-50 relative" id="chat-panel">
          {isSimulating ? (
            <>
              {/* Chat Title bar */}
              <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-700 font-extrabold text-sm">
                    {config.role === 'parent' ? 'PH' : 'HS'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Đối tượng: {config.role === 'parent' ? 'Phụ huynh học sinh' : 'Học sinh lớp 12'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Trạng thái tâm lý: <span className="font-semibold text-rose-600 underline">{config.personality}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium bg-slate-100 px-2 py-1 rounded">
                    <Clock size={12} />
                    {history.length} tin nhắn đã trao đổi
                  </span>
                </div>
              </div>

              {/* Chat thread */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {history.map((msg, idx) => {
                  const isBot = msg.sender === 'bot';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      {/* Avatar */}
                      {isBot && (
                        <div className="w-8 h-8 rounded-full bg-rose-500 text-white font-extrabold text-xs flex items-center justify-center shadow-sm shrink-0">
                          {config.role === 'parent' ? 'PH' : 'HS'}
                        </div>
                      )}

                      {/* Msg bubble */}
                      <div className={`max-w-[75%] rounded-2xl p-4 shadow-sm relative transition-all duration-200 ${
                        isBot 
                          ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                          : 'bg-indigo-600 text-white rounded-tr-none'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`text-[9px] block ${isBot ? 'text-slate-400' : 'text-indigo-200'}`}>
                            {isBot ? `Khách hàng (${config.personality})` : 'Bạn (Tư vấn viên)'} • {msg.timestamp}
                          </span>
                        </div>
                      </div>

                      {!isBot && (
                        <div className="w-8 h-8 rounded-full bg-indigo-900 text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                          TV
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {isLoadingChat && (
                  <div className="flex items-start gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-rose-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 animate-pulse">
                      {config.role === 'parent' ? 'PH' : 'HS'}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-xs text-slate-400 ml-1">Khách hàng đang soạn tin...</span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3 max-w-4xl mx-auto">
                  <div className="flex-1 flex items-center bg-slate-100 rounded-xl px-4 py-1 border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Nhập câu tư vấn của bạn để trả lời và thuyết phục khách hàng..."
                      className="flex-1 bg-transparent border-none focus:outline-none text-sm py-2.5 text-slate-800"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoadingChat}
                    className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-sm flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Send size={16} />
                  </button>
                </form>
                <div className="flex justify-between items-center max-w-4xl mx-auto mt-2 text-[10px] text-slate-400 px-1">
                  <span>Mẹo: Hãy tham chiếu đúng số liệu học bổng, ưu đãi hoặc học phí trong tài liệu nền để nhận điểm tối đa.</span>
                  <button 
                    type="button" 
                    onClick={handleEndAndEvaluate} 
                    className="text-indigo-600 hover:underline font-bold transition cursor-pointer"
                  >
                    Kết thúc & Chấm điểm phiên
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* EMPTY STATE OR SHOWING EVALUATION */
            <div className="flex-1 flex flex-col overflow-y-auto p-6 items-center justify-center">
              <AnimatePresence mode="wait">
                {isLoadingEvaluation ? (
                  <motion.div
                    key="evaluating"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center max-w-md p-8 bg-white border border-slate-200 rounded-2xl shadow-lg"
                  >
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Brain className="w-8 h-8 text-indigo-600 animate-bounce" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Đang chấm điểm hội thoại...</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Gemini đang bóc tách nội dung cuộc trò chuyện, đối chiếu chính xác từng con số với tài liệu gốc để lập báo cáo đánh giá năng lực của bạn. Xin vui lòng chờ giây lát!
                    </p>
                  </motion.div>
                ) : evaluation ? (
                  /* EVALUATION REPORT PRESENTATION */
                  <motion.div
                    key="evaluation-report"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-5xl mx-auto space-y-6 pb-12"
                  >
                    {/* Header Report Card */}
                    <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                      <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl"></div>
                      <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-rose-500/5 rounded-full blur-xl"></div>
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-2">
                          <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-full uppercase tracking-wider">
                            Báo cáo phân tích từ Gemini AI
                          </span>
                          <h2 className="text-2xl font-bold tracking-tight">KẾT QUẢ ĐÁNH GIÁ NĂNG LỰC TƯ VẤN</h2>
                          <p className="text-slate-300 text-xs max-w-xl">
                            Phiên mô phỏng: Khách hàng là <strong className="text-indigo-400">{config.role === 'parent' ? 'Phụ huynh' : 'Học sinh'} ({config.personality})</strong>. 
                            Độ khó: <span className="text-rose-400 font-semibold">{config.difficulty === 'hard' ? 'Khó (có câu hỏi khó)' : 'Dễ'}</span>.
                          </p>
                        </div>

                        {/* Overall Score Circle */}
                        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 shrink-0">
                          <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-400/30">
                            <span className="text-2xl font-black font-mono text-indigo-300">{evaluation.overallScore}</span>
                            <span className="text-[10px] text-slate-400 absolute bottom-1.5 font-bold">Điểm</span>
                          </div>
                          <div>
                            <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Xếp hạng năng lực</div>
                            <div className="text-lg font-extrabold text-indigo-200">
                              {evaluation.overallScore >= 90 ? 'Xuất sắc (Chuyên gia)' : 
                               evaluation.overallScore >= 80 ? 'Khá giỏi (Tự tin)' :
                               evaluation.overallScore >= 65 ? 'Trung bình khá' : 'Cần rèn luyện thêm'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Score Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Metric 1 */}
                      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Độ chính xác thông tin</span>
                          <span className="text-lg font-black text-indigo-600 font-mono">{evaluation.metrics.accuracy}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${evaluation.metrics.accuracy}%` }} />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Đo lường mức độ khớp dữ liệu số, điều kiện học bổng, ưu đãi, quy chế học tập so với tài liệu gốc.
                        </p>
                      </div>

                      {/* Metric 2 */}
                      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Độ thuyết phục</span>
                          <span className="text-lg font-black text-amber-600 font-mono">{evaluation.metrics.persuasiveness}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${evaluation.metrics.persuasiveness}%` }} />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Đánh giá cấu trúc câu trả lời, sự khéo léo trong bán hàng, làm nổi bật giá trị cốt lõi của trường học.
                        </p>
                      </div>

                      {/* Metric 3 */}
                      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thái độ tư vấn</span>
                          <span className="text-lg font-black text-emerald-600 font-mono">{evaluation.metrics.attitude}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${evaluation.metrics.attitude}%` }} />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Đo lường sự kiên nhẫn, nhã nhặn, chuyên nghiệp và bình tĩnh trước những thách thức, thái độ của khách hàng.
                        </p>
                      </div>
                    </div>

                    {/* General Feedback Card */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Award className="text-indigo-600" size={18} />
                        Nhận xét chung từ chuyên gia AI
                      </h3>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                        {evaluation.generalFeedback}
                      </div>
                    </div>

                    {/* Detailed Analysis Breakdown by Turn */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 px-1">
                        <MessageSquare className="text-indigo-600" size={18} />
                        Phân tích chi tiết từng lượt đối thoại ({evaluation.analysis.length})
                      </h3>

                      <div className="space-y-4">
                        {evaluation.analysis.map((turn, index) => (
                          <div key={index} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            {/* Turn Header */}
                            <div className="bg-slate-550 p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-extrabold rounded-lg">
                                Lượt trả lời #{turn.turnIndex}
                              </span>
                              <div className="flex items-center gap-4 text-xs font-medium">
                                <span className="text-slate-500">Chính xác: <strong className="text-indigo-600 font-bold">{turn.accuracyScore}/100</strong></span>
                                <span className="text-slate-500">Thuyết phục: <strong className="text-amber-600 font-bold">{turn.persuasivenessScore}/100</strong></span>
                                <span className="text-slate-500 font-medium">Thái độ: <strong className="text-emerald-600 font-bold">{turn.attitudeScore}/100</strong></span>
                              </div>
                            </div>

                            {/* Dialogue content */}
                            <div className="p-4 space-y-3.5">
                              <div>
                                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block mb-1">Khách hàng hỏi:</span>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10 italic">
                                  "{turn.question}"
                                </p>
                              </div>

                              <div>
                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">Bạn đã trả lời:</span>
                                <p className="text-xs text-slate-700 leading-relaxed bg-indigo-500/5 p-2.5 rounded-lg border border-indigo-500/10">
                                  {turn.answer}
                                </p>
                              </div>

                              {/* Error and Omission alert */}
                              {turn.errorsOrOmissions && turn.errorsOrOmissions.toLowerCase() !== 'không có' && turn.errorsOrOmissions.toLowerCase() !== 'không' && (
                                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-2.5">
                                  <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={14} />
                                  <div>
                                    <h4 className="text-xs font-bold text-rose-800">Sai sót hoặc thiếu thông tin:</h4>
                                    <p className="text-xs text-rose-700 mt-0.5 leading-relaxed font-medium">{turn.errorsOrOmissions}</p>
                                  </div>
                                </div>
                              )}

                              {/* Better model answer */}
                              <div className="p-3 bg-indigo-50 border border-indigo-100/50 rounded-lg flex items-start gap-2.5">
                                <CheckCircle className="text-indigo-600 shrink-0 mt-0.5" size={14} />
                                <div>
                                  <h4 className="text-xs font-bold text-indigo-900">Gợi ý câu trả lời mẫu tối ưu:</h4>
                                  <p className="text-xs text-indigo-800 mt-1 leading-relaxed italic font-medium whitespace-pre-line">
                                    "{turn.modelAnswer}"
                                  </p>
                                </div>
                              </div>

                              {/* Handling psychology tip */}
                              <div className="p-3 bg-amber-50 border border-amber-100/50 rounded-lg flex items-start gap-2.5">
                                <Brain className="text-amber-600 shrink-0 mt-0.5" size={14} />
                                <div>
                                  <h4 className="text-xs font-bold text-amber-900">Mẹo xử lý tâm lý & thái độ người hỏi:</h4>
                                  <p className="text-xs text-amber-800 mt-1 leading-relaxed font-medium">{turn.handlingTip}</p>
                                </div>
                              </div>

                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons after evaluation */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                      <button
                        type="button"
                        onClick={handleStartSimulation}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <RotateCcw size={16} />
                        Luyện tập phiên mới
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEvaluation(null);
                          setHistory([]);
                        }}
                        className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Về trang cấu hình ban đầu
                      </button>
                    </div>

                  </motion.div>
                ) : (
                  /* EXTREMELY POLISHED INITIAL EMPTY STATE */
                  <motion.div
                    key="initial-screen"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl w-full text-center space-y-8 py-8"
                  >
                    <div className="space-y-3">
                      <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shadow-sm mb-2">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">
                        Nâng Tầm Kỹ Năng <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">Tư Vấn Tuyển Sinh</span>
                      </h2>
                      <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
                        Hãy chọn vai trò, tính cách của khách hàng ở thanh bên trái, nạp tài liệu tuyển sinh của trường bạn và bắt đầu cuộc đối thoại mô phỏng. Trí tuệ nhân tạo Gemini sẽ đóng vai cực kỳ sinh động để thách thức khả năng ứng biến của bạn!
                      </p>
                    </div>

                    {/* Features Bento */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm mb-1">
                          <User size={16} />
                        </div>
                        <h4 className="text-xs font-bold text-slate-800">Chọn Đúng Vai Trò</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Chọn giữa Phụ huynh lo lắng cho tương lai con cái hoặc Học sinh rụt rè, bỡ ngỡ bước vào cánh cổng đại học.
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 font-bold text-sm mb-1">
                          <Brain size={16} />
                        </div>
                        <h4 className="text-xs font-bold text-slate-800">Thách Thức Tính Cách</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Mô phỏng 5 dạng tính cách thực tế: Khó tính, hay cáu gắt, nhút nhát, thực dụng chỉ hỏi tiền, hoặc thích thể hiện.
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-sm mb-1">
                          <Award size={16} />
                        </div>
                        <h4 className="text-xs font-bold text-slate-800">AI Chấm Điểm Toàn Diện</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Chấm điểm theo 3 tiêu chí quốc tế, chỉ rõ chỗ tư vấn sai lệch so với tài liệu nền và viết sẵn mẫu đối thoại tối ưu.
                        </p>
                      </div>
                    </div>

                    {/* Quick Start Card */}
                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/40 border border-indigo-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between text-left gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-indigo-950">Bạn đã sẵn sàng rèn luyện kỹ năng?</h4>
                        <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                          Tài liệu tuyển sinh mẫu của <strong>Greenwich Việt Nam 2025</strong> đã được nạp sẵn cực kỳ chuẩn xác và đầy đủ số liệu.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleStartSimulation}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition whitespace-nowrap cursor-pointer shrink-0"
                      >
                        Bắt đầu mô phỏng ngay
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR: Instant Quick Critique Status */}
        <aside className="w-[300px] bg-white border-l border-slate-200 p-5 shrink-0 flex flex-col justify-between" id="right-panel">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} className="text-slate-400" />
              Thông tin hỗ trợ tư vấn
            </h3>

            {isSimulating ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                    <AlertTriangle size={14} />
                    Lời khuyên huấn luyện viên:
                  </div>
                  <p className="text-[11px] text-amber-850 leading-relaxed">
                    Khách hàng đang ở chế độ tính cách <strong className="underline">{config.personality}</strong>. 
                    {config.personality === 'cáu gắt' && ' Hãy trả lời cực kỳ ngắn gọn, đi thẳng vào trọng tâm, tuyệt đối không giải thích dài dòng lý thuyết suông.'}
                    {config.personality === 'khó tính' && ' Hãy dẫn ra số liệu học bổng phần trăm hoặc số tiền VND cực kỳ chính xác để thuyết phục.'}
                    {config.personality === 'rụt rè' && ' Hãy trả lời nhẹ nhàng, khuyến khích khách hàng, gợi mở các ưu đãi dễ đạt được nhất.'}
                    {config.personality === 'thực dụng' && ' Hãy nhấn mạnh học bổng trừ trực tiếp thế nào và giá trị thực tế của văn bằng do Anh Quốc cấp.'}
                    {config.personality === 'kiêu căng' && ' Hãy tôn trọng vị thế của họ, dẫn dắt lịch sự bằng các từ ngữ chuyên nghiệp nhất.'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <CheckCircle size={14} />
                    Các mẹo ghi điểm cao:
                  </div>
                  <ul className="text-[10px] space-y-1.5 text-slate-500 list-disc pl-4 leading-relaxed">
                    <li>Nhắc đến bằng cử nhân chính quy do Đại học Greenwich Vương Quốc Anh trực tiếp cấp.</li>
                    <li>Sử dụng đúng thông tin các chương trình Học bổng GRE Talent (30-100% phỏng vấn) hoặc Golden Passport (20%), Golden Compass (35 triệu).</li>
                    <li>Lưu ý quy định cộng dồn học bổng (không cộng dồn, chỉ hưởng mức lớn nhất).</li>
                    <li>Không tự đoán mò nếu thông tin không có trong tài liệu; hãy khéo léo hẹn phản hồi lại sau.</li>
                  </ul>
                </div>

                <button
                  onClick={handleEndAndEvaluate}
                  className="w-full mt-2 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Flag size={14} />
                  Kết thúc & Xem báo cáo
                </button>
              </div>
            ) : evaluation ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
                    <ThumbsUp size={14} />
                    Điểm sáng trong phiên:
                  </div>
                  <p className="text-[11px] text-emerald-850 leading-relaxed font-medium">
                    Bạn đã thể hiện thái độ hết sức chuẩn mực. Hãy xem phân tích ở cột chính giữa để tối ưu hóa thêm độ chính xác của các con số.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Ghi nhớ quy chế tuyển sinh:</h4>
                  <ul className="text-[10px] text-slate-500 space-y-1.5 list-decimal pl-4 leading-relaxed">
                    <li>Lệ phí giữ học bổng bằng học phí tiếng Anh kỳ đầu tiên trừ đi ưu đãi.</li>
                    <li>Học bổng là đích danh, không chuyển nhượng, không quy đổi tiền mặt.</li>
                    <li>Học phí tiếng Anh là 11,3 triệu VNĐ/cấp độ (tối đa 5 cấp độ).</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                <HelpCircle size={32} className="text-slate-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-600 mb-1">Chưa có dữ liệu phiên</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Bấm Bắt đầu mô phỏng để huấn luyện viên AI đồng hành và đưa ra lời khuyên tức thời cho bạn.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <span className="text-[9px] text-slate-400 font-semibold block">Phát triển bởi FPT Education</span>
            <span className="text-[9px] text-slate-400 mt-0.5 block">© 2026 AI Admission Coach v2.4</span>
          </div>
        </aside>

      </div>
    </div>
  );
}
