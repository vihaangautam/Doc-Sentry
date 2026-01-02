import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ChatAdvisorProps {
    context: any;
    embedded?: boolean; // New prop
}

interface Message {
    role: 'user' | 'model';
    parts: string;
}

export interface ChatAdvisorRef {
    draftEmail: (subject: string, body: string) => void;
}

const ChatAdvisor = React.forwardRef<ChatAdvisorRef, ChatAdvisorProps>(({ context, embedded = false }, ref) => {
    const { session } = useAuth(); // Get auth session
    const [isOpen, setIsOpen] = useState(embedded); // Default open if embedded
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => ({
        draftEmail: (subject: string, body: string) => {
            // Fix: Add User message first to maintain Turn Alternation (User -> Model -> User -> Model)
            const userRequest: Message = {
                role: 'user',
                parts: `Draft a negotiation email for ${subject}`
            };

            // Structured response for easier parsing
            const draftMsg: Message = {
                role: 'model',
                parts: `Creating a draft email for you:\n\nSubject: ${subject}\n\n${body}`
            };
            setMessages(prev => [...prev, userRequest, draftMsg]);
        }
    }));

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { role: 'user', parts: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/chat/ask`, {
                document_context: context,
                history: messages,
                question: userMsg.parts
            }, {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });

            const aiMsg: Message = { role: 'model', parts: response.data.answer };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'model', parts: "Sorry, I encountered an error connecting to the AI. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    // Helper to render message content with special handling for emails
    const renderMessageContent = (msg: Message) => {
        // Detect if it's an email draft
        if (msg.role === 'model' && msg.parts.includes("Subject:") && msg.parts.includes("Dear Hiring Team")) {
            // Basic parsing (robust enough for our controlled input)
            const lines = msg.parts.split('\n');
            const subjectLine = lines.find(l => l.startsWith('Subject:'))?.replace('Subject:', '').trim() || "Negotiation";

            // Extract body: everything after the subject line
            // We find index of subject, and take everything after it + 2 lines
            const subjectIndex = lines.findIndex(l => l.startsWith('Subject:'));
            const bodyContent = lines.slice(subjectIndex + 2).join('\n').trim();

            return (
                <div className="flex flex-col gap-2 w-full">
                    <p className="text-slate-300 text-sm mb-1">Here is a draft for you:</p>
                    <div className="bg-slate-950 rounded-lg border border-slate-700 overflow-hidden relative group">
                        <div className="bg-slate-900 border-b border-slate-700 px-3 py-2 flex justify-between items-center">
                            <span className="text-xs font-bold text-emerald-400 truncate pr-4">Subject: {subjectLine}</span>
                            <button
                                onClick={() => navigator.clipboard.writeText(`Subject: ${subjectLine}\n\n${bodyContent}`)}
                                className="text-slate-400 hover:text-white transition-colors"
                                title="Copy Email"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                            </button>
                        </div>
                        <div className="p-3 bg-slate-950/50">
                            <p className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                                {bodyContent}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return msg.parts; // Default text render
    };

    if (embedded) {
        return (
            <div className="flex flex-col h-full w-full">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-70">
                            <div className="bg-slate-800 p-3 rounded-full mb-4">
                                <MessageCircle size={24} className="text-emerald-400" />
                            </div>
                            <p className="text-slate-400 text-sm mb-6">
                                I've analyzed your offer. Tap a suggestion or type below:
                            </p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {["Explain PF deduction", "Is this tax efficient?", "Hidden clauses?", "Compare with market"].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => {
                                            setInput(suggestion);
                                            // Optional: auto-send
                                            // handleSend(suggestion); 
                                        }}
                                        className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user'
                                ? 'bg-emerald-600 text-white rounded-br-none'
                                : 'bg-slate-700 text-slate-200 rounded-bl-none w-full'
                                }`}>
                                {renderMessageContent(msg)}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-700/50 rounded-lg p-2 px-4 text-xs text-slate-400 animate-pulse">
                                Auditing...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t border-slate-700/50 bg-slate-800/30">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-600"
                            placeholder="Type a question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl disabled:opacity-50 transition-colors shadow-lg shadow-emerald-600/20"
                        >
                            <TrendingUp size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Default Floating Implementation
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <div className="pointer-events-auto">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-80 md:w-96 mb-4 overflow-hidden flex flex-col h-[500px]"
                        >
                            <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 p-4 flex justify-between items-center text-white">
                                <h3 className="font-bold flex items-center gap-2">
                                    <span>🤖</span> Auditor AI
                                </h3>
                                <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">✕</button>
                            </div>
                            {/* ... Content same as embedded essentially, but duplicative logic omitted for brevity in diff, keeping simplified structure... */}
                            {/* Wait, to keep it DRY I should refactor content to a sub-component, but for this edit I will just duplicate or conditionally render wrapper. */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/90 scrollbar-thin">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.role === 'user'
                                            ? 'bg-emerald-600 text-white rounded-br-none'
                                            : 'bg-slate-700 text-slate-200 rounded-bl-none'
                                            }`}>
                                            {msg.parts}
                                        </div>
                                    </div>
                                ))}
                                {/* ... inputs ... */}
                            </div>
                            <div className="p-3 bg-slate-800 border-t border-slate-700">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                                        placeholder="Type your question..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim() || loading}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50"
                                    >
                                        ➤
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white p-4 rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-2 font-bold"
                >
                    <span className="text-xl">💬</span>
                </motion.button>
            </div>
        </div>
    );
});

export default ChatAdvisor;
