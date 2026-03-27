import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import API_BASE_URL, { api } from '../api/axios';
import { io } from 'socket.io-client';
import '../App.css';

let socket;

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const activeConversationRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const messagesEndRef = useRef(null);
  const location = useLocation();

  // Sync state to ref for safe socket closure reading
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  useEffect(() => {
    socket = io(API_BASE_URL);
    
    // Listen for incoming messages
    socket.on('receive_message', (data) => {
      // Only append to the DOM map if the user is literally looking at THIS exact conversation
      if (activeConversationRef.current && activeConversationRef.current._id === data.conversationId) {
        setMessages((prev) => [...prev, data]);
      }
      
      // Update Conversation Last Message in sidebar
      setConversations(prevConvos => prevConvos.map(c => {
        if (c._id === data.conversationId) {
          return { ...c, lastMessage: { text: data.text, sender: data.sender } };
        }
        return c;
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // If user clicked "Message Seller" from Home.jsx
    if (location.state && location.state.conversation) {
      const conv = location.state.conversation;
      // Prepend to list if not exists, and set active
      setConversations(prev => {
        if (!prev.find(c => c._id === conv._id)) return [conv, ...prev];
        return prev;
      });
      setActiveConversation(conv);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser) return;
      try {
        const res = await api.get(`/api/messages/conversations/${currentUser._id}`);
        setConversations(res.data);
        
        // Natively bind to all active rooms so the sidebar updates in exactly real-time
        if (socket) {
          res.data.forEach(conv => socket.emit('join_room', conv._id));
        }
      } catch (err) {
        console.error("Failed to load conversations");
      }
    };
    fetchConversations();
  }, [currentUser?._id]);

  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/api/messages/${activeConversation._id}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load messages");
      }
    };
    fetchMessages();
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConversation) return;

    const messageData = {
      conversationId: activeConversation._id,
      sender: currentUser._id,
      text: text.trim(),
    };

    // Optimistically update UI
    setMessages(prev => [...prev, messageData]);
    const payload = text.trim();
    setText('');
    
    // Emit socket
    socket.emit('send_message', { ...messageData, roomId: activeConversation._id });

    // Save to DB
    try {
      await api.post('/api/messages', messageData);
      
      setConversations(prev => prev.map(c => {
        if (c._id === activeConversation._id) {
          return { ...c, lastMessage: { text: payload, sender: currentUser._id } };
        }
        return c;
      }));
    } catch(err) {
      console.error(err);
    }
  };

  const getOtherParticipant = (participants) => {
    return participants.find(p => p._id !== currentUser._id);
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', height: 'calc(100vh - 120px)', paddingTop: '0' }}>
      
      {/* Sidebar: Conversations */}
      <div className="card" style={{ flex: '1 1 300px', maxWidth: '400px', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: '800' }}>Messages</h2>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <p className="text-muted" style={{ padding: '2rem', textAlign: 'center' }}>No conversations yet.</p>
          ) : (
            conversations.map(conv => {
              const otherUser = getOtherParticipant(conv.participants);
              const isActive = activeConversation?._id === conv._id;
              
              return (
                <div 
                  key={conv._id}
                  onClick={() => setActiveConversation(conv)}
                  style={{ 
                    padding: '1.25rem', borderBottom: '1px solid var(--border-color)', 
                    cursor: 'pointer', background: isActive ? 'var(--input-bg)' : 'transparent',
                    transition: 'background 0.2s', display: 'flex', gap: '1rem', alignItems: 'center'
                  }}
                >
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 'bold' }}>
                    {otherUser?.name?.charAt(0) || '?'}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-main)', fontSize: '1.05rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {otherUser?.name || 'Unknown'} 
                    </h4>
                    <span style={{fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 'bold'}}>{conv.book?.title}</span>
                    <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {conv.lastMessage?.text || 'Click to chat...'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="card" style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {activeConversation ? (
          <>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-card)' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.3rem' }}>{getOtherParticipant(activeConversation.participants)?.name}</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Regarding: <span style={{fontWeight: '600', color: 'var(--accent-primary)'}}>{activeConversation.book?.title}</span></p>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-primary)' }}>
              {messages.map((msg, index) => {
                const isMine = msg.sender === currentUser._id;
                return (
                  <div key={index} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                    <div style={{ 
                      padding: '1rem 1.25rem', borderRadius: '24px', 
                      borderBottomRightRadius: isMine ? '4px' : '24px',
                      borderBottomLeftRadius: isMine ? '24px' : '4px',
                      background: isMine ? 'var(--accent-gradient)' : 'var(--bg-card)',
                      color: isMine ? '#FFF' : 'var(--text-main)',
                      boxShadow: 'var(--shadow-sm)',
                      fontWeight: '500',
                      lineHeight: '1.5'
                    }}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} style={{ padding: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem', background: 'var(--bg-card)' }}>
              <input 
                type="text" 
                value={text} 
                onChange={e => setText(e.target.value)} 
                placeholder="Type a message..." 
                className="form-input" 
                style={{ flex: 1 }}
              />
              <button type="submit" className="primary-btn" disabled={!text.trim()} style={{ padding: '0 2rem' }}>Send</button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: 'var(--bg-primary)' }}>
            <span style={{ fontSize: '4rem' }}>💬</span>
            <h3 style={{ color: 'var(--text-main)', marginTop: '1rem' }}>Select a conversation</h3>
            <p className="text-muted">Or click "Message Seller" from a book listing.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Chat;
