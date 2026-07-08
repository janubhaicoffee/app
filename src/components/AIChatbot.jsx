'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import './AIChatbot.css';

export default function AIChatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi! I'm the Janu Bhai Coffee Assistant. Ask me anything about our Chikmagalur coffee, wholesale orders, or shipping!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Add a placeholder for assistant's response
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.substring(6));
              const text = data.choices[0]?.delta?.content || '';

              setMessages((prev) => {
                const newMessages = [...prev];
                const lastIdx = newMessages.length - 1;
                newMessages[lastIdx] = {
                  ...newMessages[lastIdx],
                  content: newMessages[lastIdx].content + text,
                };
                return newMessages;
              });
            } catch (e) {
              console.error('Error parsing stream chunk', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIdx = newMessages.length - 1;
        newMessages[lastIdx] = {
          role: 'assistant',
          content:
            'Sorry, I am having trouble connecting to the network right now. Please email us at hello@janubhai.com.',
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="ai-chatbot-container">
      <div className="chat-header">
        <Bot size={24} />
        <div>
          <h3>Janu Bhai Support</h3>
          <p>Powered by NVIDIA AI</p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-bubble ${msg.role}`}>
            <div className="avatar">
              {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className="text">{msg.content}</div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1].content === '' && (
          <div className="message-bubble assistant loading">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          maxLength={500}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim() || input.length > 500}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
