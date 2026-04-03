import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Search, MessageSquare, User, BadgeCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { chatWithAI, getMessages, getConversation, markConversationAsRead } from '../../../services/api';
import { io } from 'socket.io-client';
import './MessagesPage.css';

const timeStr = (dateDate) => {
    if (!dateDate) return '';
    const d = new Date(dateDate);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MessagesPage = () => {
    const { user } = useAuth();
    const location = useLocation();
    const currentUserId = Number(user?.id); 
    const initialContext = location.state || {}; // { receiverId, receiverName, opportunityId }

    const [socket, setSocket] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [aiHistory, setAiHistory] = useState([
        {
            id: 'ai-welcome',
            senderId: 'ai',
            content: 'Hello! I am your SkillBridge AI Assistant. How can I help you today?',
            createdAt: new Date('2024-01-01T00:00:00Z') // Older fixed date
        }
    ]);
    const [newMsg, setNewMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef(null);
    const selectedRef = useRef(null);

    useEffect(() => {
        selectedRef.current = selected;
    }, [selected]);

    useEffect(() => {
        const fetchConvos = async () => {
            setIsLoading(true);
            const result = await getMessages();
            
            // Add AI Assistant as the first pseudo-conversation
            const aiconvo_time = aiHistory.length > 1 ? aiHistory[aiHistory.length - 1].createdAt : new Date('2024-01-01T00:00:00Z');
            const aiConvo = {
                otherId: 'ai',
                otherName: 'AI Assistant',
                lastMessage: { 
                    content: aiHistory[aiHistory.length - 1].content, 
                    createdAt: aiconvo_time 
                },
                unread: 0
            };
            
            let allConvos = [aiConvo, ...(result.data || [])];

            // If we came here from a "Connect" click, ensure that person is in the list
            if (initialContext.receiverId) {
                const exists = allConvos.find(c => Number(c.otherId) === Number(initialContext.receiverId));
                if (!exists) {
                    const newConvo = {
                        otherId: Number(initialContext.receiverId),
                        otherName: initialContext.receiverName || 'New Contact',
                        opportunityId: initialContext.opportunityId || null,
                        lastMessage: { content: 'Start a conversation!', createdAt: new Date() },
                        unread: 0
                    };
                    allConvos.push(newConvo);
                }
            }

            // Final sort by timestamp
            allConvos.sort((a, b) => {
                const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt) : new Date(0);
                const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt) : new Date(0);
                return dateB.getTime() - dateA.getTime();
            });

            setConversations(allConvos);
            
            // Auto-select starting conversation
            if (initialContext.receiverId) {
                const toSelect = allConvos.find(c => Number(c.otherId) === Number(initialContext.receiverId));
                if (toSelect) selectConversation(toSelect);
            }

            setIsLoading(false);
        };
        fetchConvos();
    }, [initialContext.receiverId]);

    // Socket.IO connection
    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.emit('join', currentUserId);

        newSocket.on('receiveMessage', (message) => {
            const parsedMsg = {
                ...message,
                createdAt: new Date(message.createdAt)
            };

            if (selectedRef.current && (
                Number(selectedRef.current.otherId) === Number(parsedMsg.senderId) || 
                Number(selectedRef.current.otherId) === Number(parsedMsg.receiverId)
            )) {
                setMessages(prev => [...prev, parsedMsg]);
            }
            
            // Update sidebar conversations
            setConversations(prev => {
                const exists = prev.find(c => Number(c.otherId) === Number(parsedMsg.senderId));
                
                // Play message sound if it's not the currently open chat
                if (!selected || Number(selected.otherId) !== Number(parsedMsg.senderId)) {
                    try {
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                        audio.play().catch(e => console.log('Audio blocked:', e));
                    } catch (err) { console.error(err); }
                }

                if (exists) {
                    // Update existing
                    const updated = prev.map(c => {
                        if (Number(c.otherId) === Number(parsedMsg.senderId)) {
                            return { 
                                ...c, 
                                lastMessage: parsedMsg,
                        unread: (selectedRef.current && Number(selectedRef.current.otherId) === Number(parsedMsg.senderId)) ? 0 : (c.unread || 0) + 1
                    };
                }
                return c;
            });
            return updated.sort((a, b) => {
                const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt) : new Date(0);
                const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt) : new Date(0);
                return dateB.getTime() - dateA.getTime();
            });
        } else {
            // Add new conversation to list
            const newConvo = {
                otherId: Number(parsedMsg.senderId),
                otherName: parsedMsg.senderName || `User #${parsedMsg.senderId}`,
                opportunityId: parsedMsg.opportunityId || null,
                lastMessage: parsedMsg,
                unread: (selectedRef.current && Number(selectedRef.current.otherId) === Number(parsedMsg.senderId)) ? 0 : 1
            };
            return [newConvo, ...prev];
        }
    });
});

        newSocket.on('messageSent', (message) => {
            // Message sent confirmation, already added in handleSend
        });

        return () => {
            newSocket.disconnect();
        };
    }, [currentUserId]);

    // initialReceiverId effect removed in favor of integrated logic in fetchConvos

    const selectConversation = async (convo) => {
        setSelected(convo);
        
        // Reset unread count for this convo locally
        setConversations(prev => prev.map(c => 
            String(c.otherId) === String(convo.otherId) ? { ...c, unread: 0 } : c
        ));

        if (convo.otherId === 'ai') {
            setMessages(aiHistory);
            return;
        }

        // Mark as Read
        if (convo.unread > 0) {
            await markConversationAsRead(convo.otherId);
        }

        // Load real messages for this conversation
        const result = await getConversation(convo.otherId);
        if (result.success && result.data) {
            setMessages(result.data.map(m => ({
                ...m,
                createdAt: new Date(m.createdAt) // Parse ISO dates
            })));
        } else {
            setMessages([]);
        }
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
            setAiHistory(prev => [...prev, userMessage]);
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
                setMessages(prev => {
                    const next = [...prev, aiMessage];
                    setAiHistory(next);
                    return next;
                });
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
                setMessages(prev => {
                    const next = [...prev, errorMessage];
                    setAiHistory(next);
                    return next;
                });
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
                // Bring to top safely
                updated.sort((a, b) => {
                    const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt) : new Date(0);
                    const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt) : new Date(0);
                    return dateB.getTime() - dateA.getTime();
                });
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
                        filtered.map(c => {
                            const isSystem = c.otherName === 'SkillBridge Team';
                            return (
                                <div
                                    key={`${c.otherId}_${c.opportunityId || 'general'}`}
                                    className={`msg-convo-item ${selected?.otherId === c.otherId ? 'active' : ''}`}
                                    onClick={() => selectConversation(c)}
                                >
                                    <div className="msg-avatar">
                                        {c.otherName?.[0]?.toUpperCase() || <User size={16} />}
                                    </div>
                                    <div className="msg-convo-info">
                                        <div className="msg-convo-name-row">
                                            <div className="msg-convo-name">
                                                {c.otherName}
                                            </div>
                                            {isSystem && (
                                                <BadgeCheck size={14} className="msg-verified-badge" />
                                            )}
                                        </div>
                                        <div className="msg-convo-preview">
                                            {c.lastMessage?.content?.slice(0, 50)}{c.lastMessage?.content?.length > 50 ? '…' : ''}
                                        </div>
                                    </div>
                                    <div className="msg-convo-meta">
                                        <div className="msg-convo-time">
                                            {timeStr(c.lastMessage?.createdAt)}
                                        </div>
                                        {c.unread > 0 && selected?.otherId !== c.otherId && (
                                            <div className="msg-unread-badge">{c.unread}</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
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
