import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatMessage from '../components/ChatMessage';
import './AiChat.css';

// Base URL for API calls relative to the frontend.
// The frontend runs on 5173 and Vite forwards /api to 3000 by default (if proxy is configured),
// Alternatively, since Vite runs with an API_BASE constant, we can use that:
const API_BASE = '/api';

export default function AiChat() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { text: "Hello! I am your AI assistant. How can I assist you with your banking needs today?", isAi: true }
    ]);
    const [inputVal, setInputVal] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputVal.trim() || isLoading) return;

        const userMessage = inputVal;
        setInputVal('');
        setMessages(prev => [...prev, { text: userMessage, isAi: false }]);
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE}/ai/chat`, { message: userMessage }, { withCredentials: true });

            if (response.data.success) {
                setMessages(prev => [...prev, { text: response.data.reply, isAi: true }]);
            } else {
                throw new Error(response.data.error || 'Server returned an error');
            }
        } catch (err) {
            console.error(err);
            const d = err.response?.data;
            const detailsStr =
                typeof d?.details === 'string'
                    ? d.details
                    : d?.details != null
                      ? JSON.stringify(d.details)
                      : '';
            const serverMsg =
                (typeof d?.error === 'string' && d.error) ||
                (d?.error && typeof d.error.message === 'string' && d.error.message) ||
                (typeof d?.message === 'string' && d.message) ||
                detailsStr;
            const trimmed = (serverMsg || '').trim().slice(0, 400);
            const text =
                trimmed ||
                'AI is temporarily unavailable. Please try again.';
            setMessages(prev => [...prev, { text, isAi: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="aichat-page">
            <div className="aichat-container">
                <div className="aichat-header">
                    <h2>MONEY BANK AI ASSISTANT</h2>
                    <p>Get instant answers about your account and banking services</p>
                    <button className="aichat-close-btn" onClick={() => navigate(-1)} aria-label="Close">
                        <X size={24} />
                    </button>
                </div>

                <div className="aichat-messages-area">
                    {messages.map((m, i) => (
                        <ChatMessage key={i} message={m.text} isAi={m.isAi} />
                    ))}
                    {isLoading && (
                        <div className={`message-wrapper ai-message`}>
                            <div className="message-content typing-indicator">
                                <Loader2 className="spinner" size={16} /> Typing...
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                <form className="aichat-input-form" onSubmit={handleSend}>
                    <input
                        type="text"
                        placeholder="Type your message here..."
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={!inputVal.trim() || isLoading}>
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
