import { useNavigate } from 'react-router-dom';
import { MessageSquareText } from 'lucide-react';
import './AiFloatingButton.css';

export default function AiFloatingButton() {
    const navigate = useNavigate();

    return (
        <button className="ai-floating-btn" onClick={() => navigate('/ai-chat')}>
            <MessageSquareText size={20} />
            <span className="ai-btn-text">AI ASSISTANT</span>
        </button>
    );
}
