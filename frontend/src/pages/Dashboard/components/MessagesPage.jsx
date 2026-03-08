import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageSquare, User, Search, ArrowLeft } from 'lucide-react';
import { getMessages, sendMessage, getConversation } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import './MessagesPage.css';

const timeStr = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MessagesPage = ({ initialReceiverId, initialOpportunityId }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selected, setSelected] = useState(null); // { otherId, opportunityId, otherName }
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const bottomRef = useRef(null);

    // Build conversation list from flat messages list
    const buildConversations = useCallback((msgs) => {
        const map = {};
        msgs.forEach(m => {
            const otherId = m.senderId === user?.id ? m.receiverId : m.senderId;
            const otherName = m.senderId === user?.id ? (m.receiverName || `User ${m.receiverId}`) : m.senderName;
            const key = `${otherId}_${m.opportunityId || 'general'}`;
            if (!map[key] || new Date(m.createdAt) > new Date(map[key].lastMessage.createdAt)) {
                map[key] = {
                    otherId,
                    otherName,
                    opportunityId: m.opportunityId,
                    lastMessage: m,
                    unread: 0,
                };
            }
        });
        return Object.values(map).sort((a, b) =>
            new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
        );
    }, [user]);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const result = await getMessages();
            if (result.success) {
                const convos = buildConversations(result.data || []);
                setConversations(convos);

                // If initialReceiverId is provided, auto-open that conversation
                if (initialReceiverId) {
                    const match = convos.find(c => c.otherId === parseInt(initialReceiverId));
                    if (match) {
                        selectConversation(match);
                    } else {
                        // New conversation not in list yet
                        setSelected({
                            otherId: parseInt(initialReceiverId),
                            opportunityId: initialOpportunityId || null,
                            otherName: `User #${initialReceiverId}`
                        });
                    }
                }
            }
            setIsLoading(false);
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectConversation = async (convo) => {
        setSelected(convo);
        if (convo.opportunityId) {
            const result = await getConversation(convo.otherId, convo.opportunityId);
            if (result.success) setMessages(result.data || []);
        } else {
            // Filter from full messages list
            const result = await getMessages();
            if (result.success) {
                const filtered = (result.data || []).filter(m =>
                    (m.senderId === user?.id && m.receiverId === convo.otherId) ||
                    (m.receiverId === user?.id && m.senderId === convo.otherId)
                );
                setMessages(filtered.reverse());
            }
        }
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!newMsg.trim() || !selected || isSending) return;
        setIsSending(true);
        const result = await sendMessage(selected.otherId, selected.opportunityId, newMsg.trim());
        if (result.success) {
            setMessages(prev => [...prev, result.data]);
            setNewMsg('');
            // Refresh conversations sidebar
            const msgs = await getMessages();
            if (msgs.success) setConversations(buildConversations(msgs.data || []));
        }
        setIsSending(false);
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
                    {isLoading ? (
                        <div className="msg-empty">Loading...</div>
                    ) : filtered.length === 0 ? (
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
                                    const isMine = m.senderId === user?.id;
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
                                disabled={isSending || !newMsg.trim()}
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
