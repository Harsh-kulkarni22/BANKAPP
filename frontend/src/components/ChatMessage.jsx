import './ChatMessage.css';

export default function ChatMessage({ message, isAi }) {
    // A simple timestamp based on current time (for demonstration)
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`message-wrapper ${isAi ? 'ai-message' : 'user-message'}`}>
            <div className="message-content">
                <p className="message-text">{message}</p>
                <span className="timestamp">{timestamp}</span>
            </div>
        </div>
    );
}
