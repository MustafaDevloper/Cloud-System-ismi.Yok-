import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { io, Socket } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import ReactPlayer from 'react-player';
import { 
  RefreshCw, Send, BookOpen, 
  Globe, Eraser, Trash, Users,
  Share2, Video, Music, Play, Pause, X, Link as LinkIcon, Plus, DoorOpen
} from 'lucide-react';

const WEBSOCKET_URL = window.location.origin;

type EditorTab = 'html' | 'css' | 'js' | 'whiteboard';

// --- CANVAS WHITEBOARD COMPONENT ---
const CanvasWhiteboard = ({ socket }: { socket: Socket | null }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#f27d26');
  const [brushSize, setBrushSize] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      }
    };
    setTimeout(resizeCanvas, 100);
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onDraw = (d: any) => drawLine(d.x0, d.y0, d.x1, d.y1, d.color, d.size, false);
    const onClear = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height); }
    };
    socket.on('whiteboard:draw', onDraw);
    socket.on('whiteboard:clear', onClear);
    const handleHistory = (e: any) => { e.detail.forEach((d: any) => drawLine(d.x0, d.y0, d.x1, d.y1, d.color, d.size, false)); };
    window.addEventListener('whiteboard:history', handleHistory);
    return () => {
      socket.off('whiteboard:draw', onDraw);
      socket.off('whiteboard:clear', onClear);
      window.removeEventListener('whiteboard:history', handleHistory);
    };
  }, [socket]);

  const drawLine = (x0: number, y0: number, x1: number, y1: number, strokeStyle: string, lineWidth: number, emit: boolean) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
    ctx.strokeStyle = strokeStyle; ctx.lineWidth = lineWidth; ctx.lineCap = 'round';
    ctx.stroke(); ctx.closePath();
    if (emit && socket) socket.emit('whiteboard:draw', { x0, y0, x1, y1, color: strokeStyle, size: lineWidth });
  };

  const getPos = (e: any) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const currentPos = useRef({ x: 0, y: 0 });
  const startDrawing = (e: any) => { setIsDrawing(true); currentPos.current = getPos(e); };
  const draw = (e: any) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    drawLine(currentPos.current.x, currentPos.current.y, pos.x, pos.y, color, brushSize, true);
    currentPos.current = pos;
  };

  return (
    <div className="relative w-full h-full">
       <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#25262b]/90 backdrop-blur-xl p-2 rounded-2xl border border-white/10 flex items-center gap-3 shadow-2xl z-10">
          <div className="flex gap-2">
            {['#f27d26', '#42a5f5', '#66bb6a', '#ef5350', '#000000', '#ffffff'].map(c => (
              <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-white scale-110' : 'border-black/20'} transition-all`} style={{ background: c }} />
            ))}
          </div>
          <input type="range" min="1" max="25" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-20 accent-brand" />
          <button onClick={() => setColor('#ffffff')} className="p-1.5 rounded-lg hover:bg-white/10 text-white"><Eraser className="w-4 h-4" /></button>
          <button onClick={() => socket?.emit('whiteboard:clear')} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10"><Trash className="w-4 h-4" /></button>
       </div>
       <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)} className="w-full h-full bg-white rounded-b-2xl cursor-crosshair touch-none" />
    </div>
  );
};

// --- MAIN WORKSPACE ---
export default function Workspace() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [activeTab, setActiveTab] = useState<EditorTab>('html');
  const [notes, setNotes] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [previewContent, setPreviewContent] = useState('');
  const [chatInput, setChatInput] = useState('');
  
  // Music State
  const [musicUrl, setMusicUrl] = useState('');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicInput, setMusicInput] = useState('');

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const terminalRef = useRef<HTMLDivElement>(null);
  const [termInstance, setTermInstance] = useState<Terminal | null>(null);
  const currentUser = localStorage.getItem('cloud_user') || 'Gezgin';

  // Room Join Logic
  const joinOrCreateRoom = (id?: string) => {
    const finalId = id || Math.random().toString(36).substring(2, 9).toUpperCase();
    setRoomId(finalId);
  };

  useEffect(() => {
    if (!roomId) return;
    const s = io(WEBSOCKET_URL);
    setSocket(s);

    s.on('connect', () => s.emit('room:join', { roomId, username: currentUser }));
    
    s.on('room:init', (data) => {
      setHtmlCode(data.code.html); setCssCode(data.code.css); setJsCode(data.code.js);
      setNotes(data.notes); setMessages(data.chat); setOnlineUsers(data.users);
      setMusicUrl(data.music.url); setIsMusicPlaying(data.music.playing);
      if (data.whiteboard?.length > 0) setTimeout(() => window.dispatchEvent(new CustomEvent('whiteboard:history', { detail: data.whiteboard })), 800);
    });

    s.on('room:users', setOnlineUsers);
    s.on('code:change', (d) => { if (d.type === 'html') setHtmlCode(d.value); if (d.type === 'css') setCssCode(d.value); if (d.type === 'js') setJsCode(d.value); });
    s.on('notes:change', setNotes);
    s.on('chat:message', (m) => setMessages(prev => [...prev, m]));
    s.on('music:sync', (d) => { setMusicUrl(d.url); setIsMusicPlaying(d.playing); });

    return () => { s.disconnect(); };
  }, [roomId]);

  const restartTerminal = () => {
    if (socket) {
      if (termInstance) termInstance.clear();
      socket.emit('terminal:start', 'powershell');
    }
  };

  // Terminal
  useEffect(() => {
    if (terminalRef.current && socket && !termInstance) {
      const term = new Terminal({ theme: { background: '#1A1B1E', foreground: '#E9ECEF' }, fontSize: 13 });
      const fit = new FitAddon(); term.loadAddon(fit); term.open(terminalRef.current);
      setTimeout(() => fit.fit(), 200);
      term.onData(d => socket.emit('terminal:input', d));
      socket.on('terminal:data', d => term.write(d));
      setTermInstance(term);
      socket.emit('terminal:start', 'powershell');
    }
  }, [socket, termInstance]);

  // Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `CloudSync-Recording-${Date.now()}.webm`; a.click();
      };
      recorder.start();
      setIsRecording(true);
    } catch (e) { alert("Kayıt başlatılamadı!"); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // Compiler
  useEffect(() => {
    const h = setTimeout(() => {
      setPreviewContent(`<!DOCTYPE html><html><head><style>${cssCode}</style></head><body>${htmlCode}<script>${jsCode}</script></body></html>`);
    }, 500);
    return () => clearTimeout(h);
  }, [htmlCode, cssCode, jsCode]);

  // Music Actions
  const changeMusic = (url: string) => {
    setMusicUrl(url); setIsMusicPlaying(true);
    socket?.emit('music:sync', { url, playing: true });
  };

  if (!roomId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] shadow-inner" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0e0e11]/60 p-12 md:p-16 rounded-[4rem] border border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] text-center max-w-2xl w-full backdrop-blur-3xl relative z-10"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent" />
          
          <div className="w-24 h-24 bg-gradient-to-br from-brand/20 to-brand/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-brand/20 shadow-2xl relative">
            <div className="absolute inset-0 bg-brand/10 blur-xl rounded-full" />
            <Share2 className="w-12 h-12 text-brand relative z-10" />
          </div>

          <h2 className="text-5xl font-black mb-4 text-white tracking-tighter uppercase font-heading">Command <span className="text-brand">Center</span></h2>
          <p className="text-gray-400 mb-12 text-lg font-medium max-w-md mx-auto leading-relaxed">Initialize a private collaborative enclave or join an existing uplink via session identity.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(242, 125, 38, 0.9)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => joinOrCreateRoom()} 
              className="group relative flex flex-col items-center justify-center gap-6 p-10 bg-brand rounded-[2.5rem] transition-all shadow-2xl shadow-brand/10 border border-brand/20"
            >
              <div className="bg-black/20 p-5 rounded-2xl group-hover:bg-black/30 transition-colors">
                <Plus className="w-10 h-10 text-black" strokeWidth={3} />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-black text-2xl uppercase tracking-widest">New Session</span>
                <span className="text-black/50 text-[10px] font-bold uppercase tracking-widest mt-1">Spin up workspace</span>
              </div>
            </motion.button>

            <div className="flex flex-col gap-6 p-10 bg-white/[0.03] rounded-[2.5rem] border border-white/10 hover:border-white/20 transition-colors">
              <div className="bg-white/5 p-5 rounded-2xl self-center">
                <DoorOpen className="w-10 h-10 text-gray-400" />
              </div>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="ID UPLINK..." 
                  maxLength={7}
                  onKeyDown={(e) => e.key === 'Enter' && joinOrCreateRoom((e.target as any).value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-center uppercase tracking-[0.4em] font-mono text-xl text-brand focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all"
                />
                <button 
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="ID UPLINK..."]') as HTMLInputElement;
                    if(input.value) joinOrCreateRoom(input.value);
                  }}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all border border-white/5"
                >
                  Join Terminal
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-14 pt-10 border-t border-white/5">
             <div className="flex items-center justify-center gap-3 text-gray-500 text-[11px] font-bold uppercase tracking-widest opacity-40">
                <Users className="w-4 h-4" />
                <span>Encrypted P2P Real-time Collaboration Active</span>
             </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] gap-4 animate-in fade-in zoom-in duration-500">
      {/* HEADER BAR - Premium Engineering Look */}
      <div className="h-20 bg-[#0e0e11] border border-white/5 rounded-3xl flex items-center px-8 justify-between shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand/20 to-transparent" />
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-brand/10 text-brand px-6 py-2.5 rounded-2xl font-black border border-brand/20 shadow-inner">
            <div className="w-2 h-2 bg-brand rounded-full animate-pulse" />
            <span className="tracking-[0.2em] uppercase text-xs">UPLINK: {roomId}</span>
          </div>
          
          <div className="h-8 w-[1px] bg-white/5 mx-2" />
          
          <div className="flex -space-x-3">
            {onlineUsers.map((u, i) => (
              <motion.div 
                key={i} 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="w-10 h-10 rounded-full bg-surface-light border-2 border-[#0e0e11] flex items-center justify-center text-[10px] font-black text-brand shadow-xl relative group cursor-help" 
                title={u}
              >
                {u[0].toUpperCase()}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                  {u}
                </div>
              </motion.div>
            ))}
            <div className="w-10 h-10 rounded-full bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center text-[10px] text-gray-500">
              <Plus className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Console Music Engine */}
        <div className="flex-1 max-w-xl mx-12 flex items-center gap-4 bg-black/40 border border-white/5 rounded-2xl px-5 py-2.5 group focus-within:border-brand/40 transition-colors">
          <div className="p-2 bg-brand/10 rounded-lg">
            <Music className="w-4 h-4 text-brand" />
          </div>
          <input 
            value={musicInput} onChange={e => setMusicInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (changeMusic(musicInput), setMusicInput(''))}
            placeholder="Frequency URL or 'lofi'..."
            className="flex-1 bg-transparent border-none outline-none text-xs text-gray-300 font-medium placeholder:text-gray-700"
          />
          <div className="flex items-center gap-4">
             <button onClick={() => changeMusic('https://www.youtube.com/watch?v=jfKfPfyJRdk')} className="text-[10px] font-black text-blue-500/60 hover:text-blue-400 uppercase tracking-widest transition-colors">Lofi.fm</button>
             <div className="h-4 w-[1px] bg-white/5" />
             <div className="flex items-center gap-3">
               {isMusicPlaying ? (
                 <Pause className="w-5 h-5 cursor-pointer text-brand hover:scale-110 transition-transform" onClick={() => { setIsMusicPlaying(false); socket?.emit('music:sync', { url: musicUrl, playing: false }); }} />
                ) : (
                 <Play className="w-5 h-5 cursor-pointer text-gray-500 hover:text-brand hover:scale-110 transition-transform" onClick={() => { setIsMusicPlaying(true); socket?.emit('music:sync', { url: musicUrl, playing: true }); }} />
                )}
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'}`}
          >
            <Video className="w-4 h-4" />
            {isRecording ? 'Rec Active' : 'Record'}
          </button>
          <button onClick={() => window.location.reload()} className="p-3 bg-white/5 rounded-2xl text-gray-500 hover:text-white hover:bg-red-500/20 transition-all border border-white/5"><X className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left Aspect: Intelligence & Comms */}
        <div className="w-[320px] flex flex-col gap-6">
          <div className="flex-1 bg-[#0e0e11] border border-white/5 rounded-[2.5rem] flex flex-col min-h-0 shadow-xl overflow-hidden">
            <div className="h-12 border-b border-white/5 flex items-center px-6 gap-3 text-brand font-black uppercase tracking-widest text-[10px] bg-white/[0.02]">
              <BookOpen className="w-4 h-4" /> <span>Field Notes</span>
            </div>
            <textarea 
              value={notes} 
              onChange={e => { setNotes(e.target.value); socket?.emit('notes:change', e.target.value); }} 
              placeholder="System intelligence notes..."
              className="flex-1 bg-transparent p-6 outline-none text-sm resize-none text-gray-400 font-medium placeholder:text-gray-800 leading-relaxed custom-scrollbar" 
            />
          </div>
          
          <div className="h-80 bg-[#0e0e11] border border-white/5 rounded-[2.5rem] flex flex-col shadow-xl overflow-hidden">
            <div className="h-12 border-b border-white/5 flex items-center px-6 text-brand font-black uppercase tracking-widest text-[10px] bg-white/[0.02]">
              Secure Mesh Chat
            </div>
            <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  key={i} className={`${m.system ? 'text-center' : (m.user === currentUser ? 'text-right' : 'text-left')}`}
                >
                  {!m.system && <div className="text-[9px] font-black text-gray-600 mb-1 uppercase tracking-tighter">{m.user}</div>}
                  <div className={`inline-block px-4 py-2.5 rounded-2xl text-xs ${m.system ? 'text-gray-500 italic text-[10px]' : (m.user === currentUser ? 'bg-brand text-black font-bold shadow-lg shadow-brand/10' : 'bg-white/5 text-gray-300 border border-white/5')}`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </div>
            <form onSubmit={e => { e.preventDefault(); if (chatInput.trim()) { socket?.emit('chat:message', { user: currentUser, text: chatInput }); setChatInput(''); } }} className="p-4 border-t border-white/5 flex gap-3 bg-white/[0.01]">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Send signal..." className="flex-1 bg-black/40 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand/40 border border-white/5 transition-colors" />
              <button className="bg-brand text-black p-2.5 rounded-xl hover:scale-105 transition-transform"><Send className="w-4 h-4" /></button>
            </form>
          </div>
        </div>

        {/* Mid Aspect: Development Framework */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <div className="flex-[3] bg-[#0e0e11] border border-white/5 rounded-[3rem] flex flex-col min-h-0 overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-16 -mt-16 blur-[60px] pointer-events-none" />
            
            <div className="h-14 border-b border-white/5 flex items-center px-4 bg-black/40">
              <div className="flex gap-2">
                {['html', 'css', 'js', 'whiteboard'].map(t => (
                  <button 
                    key={t} onClick={() => setActiveTab(t as any)} 
                    className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${activeTab === t ? 'bg-brand text-black shadow-lg shadow-brand/20' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 relative">
              {activeTab === 'whiteboard' ? <CanvasWhiteboard socket={socket} /> : 
                <Editor 
                  height="100%" 
                  language={activeTab === 'js' ? 'javascript' : activeTab} 
                  theme="vs-dark" 
                  value={activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode} 
                  onChange={v => {
                    const val = v || '';
                    if (activeTab === 'html') setHtmlCode(val); else if (activeTab === 'css') setCssCode(val); else setJsCode(val);
                    socket?.emit('code:change', { type: activeTab, value: val });
                  }} 
                  options={{ 
                    minimap: { enabled: false }, 
                    fontSize: 14,
                    lineNumbers: 'on',
                    padding: { top: 20 },
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
                  }} 
                />
              }
            </div>
          </div>
          
          <div className="flex-1 bg-[#0e0e11] border border-white/5 rounded-[2.5rem] flex flex-col min-h-0 shadow-xl overflow-hidden">
            <div className="h-10 border-b border-white/5 flex items-center px-6 justify-between bg-black/20 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
              <span className="flex items-center gap-2"><RefreshCw className="w-3 h-3 text-brand" /> Terminal Output</span>
              <button onClick={restartTerminal} className="hover:text-brand transition-colors">Relink Shell</button>
            </div>
            <div ref={terminalRef} className="flex-1 p-4 bg-[#0e0e11]" />
          </div>
        </div>

        {/* Right Aspect: Execution & Output */}
        <div className="w-[360px] flex flex-col gap-6">
           <div className="flex-1 bg-[#fcfcfc] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col border border-white/10 group">
              <div className="h-12 bg-[#f4f4f5] border-b border-gray-200 flex items-center px-6 justify-between">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div><div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div><div className="w-3 h-3 rounded-full bg-[#28c940]"></div></div>
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><Globe className="w-3.5 h-3.5" /> Live Render Engine</div>
              </div>
              <iframe srcDoc={previewContent} className="flex-1 bg-white" sandbox="allow-scripts" />
           </div>
           
           <div className="hidden">
             {musicUrl ? <ReactPlayer {...({ url: musicUrl, playing: isMusicPlaying, loop: true, volume: 0.5, width: "0", height: "0" } as any)} /> : null}
           </div>

           {/* Deployment Info */}
           <div className="bg-[#0e0e11] border border-white/5 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand to-transparent opacity-30" />
              <div className="flex items-center gap-3 text-brand font-black text-[10px] uppercase tracking-widest mb-4"><LinkIcon className="w-4 h-4" /> Network Access</div>
              <div className="text-[11px] text-gray-400 font-medium leading-relaxed mb-6">
                 Grant team access by providing this secure mesh uplink identity:
              </div>
              <div 
                onClick={() => { navigator.clipboard.writeText(roomId || ''); alert('Copied to clipboard'); }}
                className="group/id relative bg-black/60 p-5 rounded-2xl font-mono text-center tracking-[0.4em] text-white font-black cursor-pointer hover:bg-brand/10 transition-colors border border-white/5"
              >
                 {roomId}
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/id:opacity-100 transition-opacity bg-brand/90 rounded-2xl text-black font-black text-[10px] uppercase tracking-widest">Copy ID</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
