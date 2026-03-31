import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Search } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { getMessages, getConversation, sendMessage } from '../../../services/api';
import { io } from "socket.io-client";
import './MessagesPage.css';

const timeStr = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MessagesPage = () => {
    const { user } = useAuth();
    const location = useLocation();

    // ✅ FIX 1: was user?.userId — correct field is user?.id
    const currentUserId = user?.id;

    const [conversations, setConversations]   = useState([]);
    const [selected, setSelected]             = useState(null);
    const [messages, setMessages]             = useState([]);
    const [newMsg, setNewMsg]                 = useState('');
    const [searchTerm, setSearchTerm]         = useState('');
    const [isLoadingMsgs, setIsLoadingMsgs]   = useState(false);

    const bottomRef  = useRef(null);
    const socketRef  = useRef(null);

    // ─── SOCKET INIT ────────────────────────────────────────────
    useEffect(() => {
        socketRef.current = io("http://localhost:5000");
        return () => socketRef.current.disconnect();
    }, []);

    // ─── LOAD CONVERSATIONS ──────────────────────────────────────
    useEffect(() => {
        const fetchConversations = async () => {
            const res = await getMessages();
            if (!res.success) return;

            const formatted = res.data.map(c => ({
                conversation_id: c.conversation_id,
                otherId:         c.other_user_id,
                otherName:       c.fullName || c.username || `User ${c.other_user_id}`,
                opportunityId:   c.opportunity_id,
                lastMessage: {
                    content:   c.last_message,
                    createdAt: c.last_message_time
                }
            }));

            setConversations(formatted);

            // ✅ FIX 2: Read navigation state to auto-open a conversation
            // Triggered when NGO clicks "Message" in Applications,
            // or volunteer clicks "Message NGO" in OpportunityDetails,
            // or user clicks "Connect" in MatchSuggestionsPopup
            const { receiverId, opportunityId } = location.state || {};

            if (receiverId) {
                const rid  = parseInt(receiverId);
                const oid  = opportunityId ? parseInt(opportunityId) : null;

                // Check if conversation already exists in the list
                const existing = formatted.find(
                    c => c.otherId === rid && (oid ? c.opportunityId === oid : true)
                );

                if (existing) {
                    // Already have a conversation — open it directly
                    openConversation(existing);
                } else {
                    // ✅ FIX 3: Brand new conversation — create a placeholder entry
                    // so the left panel shows it and the chat area opens immediately
                    const placeholder = {
                        conversation_id: null,   // no DB row yet — created on first send
                        otherId:         rid,
                        otherName:       location.state?.receiverName || `User ${rid}`,
                        opportunityId:   oid,
                        lastMessage:     { content: '', createdAt: null }
                    };
                    setConversations(prev => [placeholder, ...prev]);
                    setSelected(placeholder);
                    setMessages([]);
                }
            }
        };

        fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── OPEN CONVERSATION ───────────────────────────────────────
    const openConversation = async (convo) => {
        setSelected(convo);
        setIsLoadingMsgs(true);

        const res = await getConversation(convo.otherId, convo.opportunityId);
        if (res.success) {
            const formattedMsgs = res.data.map(m => ({
                id:         m.id,
                senderId:   m.sender_id,
                receiverId: m.receiver_id,
                content:    m.content,
                createdAt:  m.created_at
            }));
            setMessages(formattedMsgs);
        } else {
            setMessages([]);
        }

        setIsLoadingMsgs(false);

        // Join socket room only if conversation already exists in DB
        if (convo.conversation_id && socketRef.current) {
            socketRef.current.emit("joinConversation", convo.conversation_id);
        }
    };

    // ─── RECEIVE REAL-TIME MESSAGE ───────────────────────────────
    useEffect(() => {
        if (!socketRef.current) return;

        socketRef.current.on("receiveMessage", (message) => {
            // Ignore own messages (already added optimistically)
         if (parseInt(message.sender_id) === parseInt(currentUserId)) return;


            setMessages(prev => [...prev, {
                id:         message.id,
                senderId:   message.sender_id,
                receiverId: message.receiver_id,
                content:    message.content,
                createdAt:  message.created_at
            }]);
        });

        return () => socketRef.current.off("receiveMessage");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserId]);

    // ─── SEND MESSAGE ────────────────────────────────────────────
    const handleSend = async () => {
        if (!newMsg.trim() || !selected) return;

        const res = await sendMessage(
            selected.otherId,
            selected.opportunityId,
            newMsg.trim()
        );

        if (res.success) {
            const msg = res.data;

            const formatted = {
                id:         msg.id,
                senderId:   msg.sender_id,
                receiverId: msg.receiver_id,
                content:    msg.content,
                createdAt:  msg.created_at
            };
setMessages(prev => {
    if (prev.some(m => m.id === msg.id)) return prev;
    return [...prev, formatted];
});

            // If this was a brand-new conversation (no conversation_id yet),
            // update selected + join the new socket room
            if (!selected.conversation_id && msg.conversation_id) {
                const updatedConvo = { ...selected, conversation_id: msg.conversation_id };
                setSelected(updatedConvo);

                // Update the placeholder in conversation list too
                setConversations(prev => prev.map(c =>
                    c.otherId === selected.otherId && !c.conversation_id
                        ? { ...c, conversation_id: msg.conversation_id, lastMessage: { content: msg.content, createdAt: msg.created_at } }
                        : c
                ));

                socketRef.current.emit("joinConversation", msg.conversation_id);
            } else {
                // Update last message preview in list
                setConversations(prev => prev.map(c =>
                    c.conversation_id === selected.conversation_id
                        ? { ...c, lastMessage: { content: msg.content, createdAt: msg.created_at } }
                        : c
                ));
            }

            setNewMsg('');
        }
    };

    // ─── AUTO SCROLL ─────────────────────────────────────────────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const filtered = conversations.filter(c =>
        c.otherName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ─── RENDER ──────────────────────────────────────────────────
    return (
        <div className="messages-page">

            {/* ── LEFT SIDEBAR ── */}
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
                            <span>Start a chat from an opportunity or match</span>
                        </div>
                    ) : (
                        filtered.map(c => (
                            <div
                                key={c.conversation_id ?? `new-${c.otherId}`}
                                className={`msg-convo-item ${selected?.otherId === c.otherId ? 'active' : ''}`}
                                onClick={() => openConversation(c)}
                            >
                                <div className="msg-avatar">
                                    {c.otherName?.[0]?.toUpperCase() || <User size={16} />}
                                </div>
                                <div className="msg-convo-info">
                                    <div className="msg-convo-name">{c.otherName}</div>
                                    <div className="msg-convo-preview">
                                        {c.lastMessage?.content || 'Start the conversation'}
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

            {/* ── CHAT AREA ── */}
            <div className="msg-chat-area">
                {!selected ? (
                    <div className="msg-no-chat">
                        <MessageSquare size={48} style={{ opacity: 0.2 }} />
                        <h3>Select a conversation</h3>
                        <p>Or start one from an opportunity or match</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="msg-chat-header">
                            <div className="msg-chat-avatar">
                                {selected.otherName?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <div className="msg-chat-name">{selected.otherName}</div>
                                {selected.opportunityId && (
                                    <div className="msg-chat-sub">
                                        Re: Opportunity #{selected.opportunityId}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="msg-messages">
                            {isLoadingMsgs ? (
                                <div className="msg-no-msgs">Loading messages...</div>
                            ) : messages.length === 0 ? (
                                <div className="msg-no-msgs">
                                    No messages yet. Say hello! 👋
                                </div>
                            ) : (
                                messages.map((m) => {
                                    // ✅ FIX 1 applied here too
                                    const isMine = m.senderId === currentUserId;
                                    return (
                                        <div
                                            key={m.id}
                                            className={`msg-bubble-wrap ${isMine ? 'mine' : 'theirs'}`}
                                        >
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
                                value={newMsg}
                                onChange={e => setNewMsg(e.target.value)}
                                placeholder="Type a message..."
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                            />
                            <button
                                onClick={handleSend}
                                className="msg-send-btn"
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