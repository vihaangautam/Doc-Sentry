import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatAdvisorProps {
    context: any; // The extracted financial data
}

interface Message {
    role: 'user' | 'model';
    parts: string;
}

const ChatAdvisor: React.FC<ChatAdvisorProps> = ({ context }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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
            const response = await axios.post('http://localhost:8000/api/chat/ask', {
                document_context: context,
                history: messages, // Send full history
                question: userMsg.parts
            });

            const aiMsg: Message = { role: 'model', parts: response.data.answer };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'model', parts: "Sorry, I encountered an error connecting to the AI." }]);
        } finally {
            setLoading(false);
        }
    };

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

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/90 scrollbar-thin">
                                {messages.length === 0 && (
                                    <p className="text-center text-gray-500 text-sm mt-10">
                                        Ask me anything about this document.<br />
                                        e.g., "Is this safe?", "Are the fees high?"
                                    </p>
                                )}
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
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-slate-700 rounded-lg p-3 text-sm text-slate-400">
                                            Thinking...
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
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
};

export default ChatAdvisor;
