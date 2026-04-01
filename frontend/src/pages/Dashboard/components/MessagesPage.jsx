import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageSquare, User, Search } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { chatWithAI } from '../../../services/api';
import { io } from 'socket.io-client';
import './MessagesPage.css';

const timeStr = (dateDate) => {
    if (!dateDate) return '';
    return dateDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// --- MOCK DATA FOR DEMO PURPOSES ---
const MOCK_MESSAGES = [];

const MOCK_CONVERSATIONS = [
    {
        otherId: 'ai',
        otherName: 'AI Assistant',
        lastMessage: { content: 'Hello! How can I help you today?', createdAt: new Date() },
        unread: 0
    }
];
// -----------------------------------

const MessagesPage = ({ initialReceiverId, initialOpportunityId }) => {
    const { user } = useAuth();
    
    // Default to mock ID 2 if user not logged in for demo
    const currentUserId = user?.id || 2; 

    const [socket, setSocket] = useState(null);
    const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const bottomRef = useRef(null);

    // Socket.IO connection
    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.emit('join', currentUserId);

        newSocket.on('receiveMessage', (message) => {
            setMessages(prev => [...prev, message]);
            // Update conversations
            setConversations(prev => {
                const updated = prev.map(c => {
                    if (c.otherId === message.senderId) {
                        return { ...c, lastMessage: message };
                    }
                    return c;
                });
                return updated.sort((a, b) => b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime());
            });
        });

        newSocket.on('messageSent', (message) => {
            // Message sent confirmation, already added in handleSend
        });

        return () => {
            newSocket.disconnect();
        };
    }, [currentUserId]);

    useEffect(() => {
        // If initialReceiverId is provided, auto-open that conversation
        if (initialReceiverId) {
            const match = conversations.find(c => c.otherId === parseInt(initialReceiverId));
            if (match) {
                selectConversation(match);
            } else {
                setSelected({
                    otherId: parseInt(initialReceiverId),
                    opportunityId: initialOpportunityId || null,
                    otherName: `User #${initialReceiverId}`
                });
                setMessages([]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectConversation = (convo) => {
        setSelected(convo);
        
        // Load mock messages for this conversation
        const filtered = MOCK_MESSAGES.filter(m =>
            (m.senderId === currentUserId && m.receiverId === convo.otherId) ||
            (m.receiverId === currentUserId && m.senderId === convo.otherId)
        );
        setMessages(filtered);
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!newMsg.trim() || !selected) return;
        
        const userMessage = {
            id: Date.now(),
            senderId: currentUserId,
            receiverId: selected.otherId,
            senderName: user?.fullName || 'You',
            receiverName: selected.otherName,
            content: newMsg.trim(),
            createdAt: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setNewMsg('');

        if (selected.otherId === 'ai') {
            // Call AI API
            const result = await chatWithAI(newMsg.trim());
            if (result.success) {
                const aiMessage = {
                    id: Date.now() + 1,
                    senderId: 'ai',
                    receiverId: currentUserId,
                    senderName: 'AI Assistant',
                    receiverName: user?.fullName || 'You',
                    content: result.reply,
                    createdAt: new Date()
                };
                setMessages(prev => [...prev, aiMessage]);
            } else {
                const errorMessage = {
                    id: Date.now() + 1,
                    senderId: 'ai',
                    receiverId: currentUserId,
                    senderName: 'AI Assistant',
                    receiverName: user?.fullName || 'You',
                    content: 'Sorry, I couldn\'t process your request right now.',
                    createdAt: new Date()
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        } else {
            // For regular messages, send via socket
            if (socket) {
                socket.emit('sendMessage', {
                    senderId: currentUserId,
                    receiverId: selected.otherId,
                    content: newMsg.trim(),
                    opportunityId: selected.opportunityId
                });
            }
            // Update conversations
            setConversations(prev => {
                const updated = prev.map(c => {
                    if (c.otherId === selected.otherId) {
                        return { ...c, lastMessage: userMessage };
                    }
                    return c;
                });
                // Bring to top
                updated.sort((a, b) => b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime());
                return updated;
            });
        }
    };

    const filtered = conversations.filter(c =>
        c.otherName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="messages-page">
            {/* Sidebar */}
            <div className="msg-sidebar">
                <div className="msg-sidebar-header">
                    <h2>Messages</h2>
                    <div className="msg-search">
                        <Search size={15} />
                        <input
                            placeholder="Search conversations..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="msg-convo-list">
                    {filtered.length === 0 ? (
                        <div className="msg-empty">
                            <MessageSquare size={32} />
                            <p>No conversations yet</p>
                            <span>When someone messages you, it'll appear here</span>
                        </div>
                    ) : (
                        filtered.map(c => (
                            <div
                                key={`${c.otherId}_${c.opportunityId}`}
                                className={`msg-convo-item ${selected?.otherId === c.otherId ? 'active' : ''}`}
                                onClick={() => selectConversation(c)}
                            >
                                <div className="msg-avatar">
                                    {c.otherName?.[0]?.toUpperCase() || <User size={16} />}
                                </div>
                                <div className="msg-convo-info">
                                    <div className="msg-convo-name">{c.otherName}</div>
                                    <div className="msg-convo-preview">
                                        {c.lastMessage?.content?.slice(0, 50)}{c.lastMessage?.content?.length > 50 ? '…' : ''}
                                    </div>
                                </div>
                                <div className="msg-convo-time">
                                    {timeStr(c.lastMessage?.createdAt)}
                                </div>
                                {c.unread > 0 && selected?.otherId !== c.otherId && (
                                    <div className="msg-unread-badge"></div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="msg-chat-area">
                {!selected ? (
                    <div className="msg-no-chat">
                        <MessageSquare size={48} style={{ opacity: 0.2 }} />
                        <h3>Select a conversation</h3>
                        <p>Choose a conversation from the left to start messaging</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="msg-chat-header">
                            <div className="msg-chat-avatar">
                                {selected.otherName?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <div className="msg-chat-name">{selected.otherName}</div>
                                {selected.opportunityId && (
                                    <div className="msg-chat-sub">Re: Opportunity #{selected.opportunityId}</div>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="msg-messages">
                            {messages.length === 0 ? (
                                <div className="msg-no-msgs">No messages yet. Say hello! 👋</div>
                            ) : (
                                messages.map((m, i) => {
                                    const isMine = m.senderId === currentUserId;
                                    return (
                                        <div key={m.id || i} className={`msg-bubble-wrap ${isMine ? 'mine' : 'theirs'}`}>
                                            <div className={`msg-bubble ${isMine ? 'mine' : 'theirs'}`}>
                                                {m.content}
                                            </div>
                                            <span className="msg-time">{timeStr(m.createdAt)}</span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="msg-input-row">
                            <input
                                className="msg-input"
                                placeholder="Type a message..."
                                value={newMsg}
                                onChange={e => setNewMsg(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            />
                            <button
                                className="msg-send-btn"
                                onClick={handleSend}
                                disabled={!newMsg.trim()}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MessagesPage;
