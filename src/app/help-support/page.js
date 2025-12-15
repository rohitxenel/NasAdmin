'use client';
import { useEffect, useRef, useState } from 'react';
import { GetChatBoxs, getChatBoxsById, AddMessage } from '@/services/admincontrol';
import { initSocket, getSocket } from '@/services/socket';

export default function SupportPage() {
  const [chatBoxes, setChatBoxes] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ✅ Auto-scroll only if admin is near bottom
  const shouldAutoScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  // ✅ Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ✅ Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ Fetch chat boxes initially
  useEffect(() => {
    const fetchChatBoxes = async () => {
      try {
        const res = await GetChatBoxs();
        const apiData = res?.data?.data || [];

        if (Array.isArray(apiData)) {
          const formatted = apiData.map((item) => ({
            id: item._id,
            user: {
              id: item.userId?._id,
              name: item.userId?.name || 'Unknown User',
              email: item.userId?.email || 'No email',
              profileImage:
                item.userId?.profilePhoto && item.userId.profilePhoto !== ''
                  ? item.userId.profilePhoto
                  : `https://i.pravatar.cc/150?u=${item.userId?._id || 'default'}`,
            },
            // status: item.isActive ? 'Open' : 'Closed',
            lastUpdated: new Date(item.updatedAt).toLocaleString(),
            lastMessage: item.lastMessage || 'No message yet',
            lastUpdated: new Date(item.updatedAt).toLocaleString(),
            lastMessage: item.lastMessage || 'No message yet',
            unreadCount: item.unreadCount || { user: 0, admin: 0 },

          }));

          setChatBoxes(formatted);
          if (formatted.length > 0) setSelectedChat(formatted[0].id);
        }
      } catch (err) {
        console.error('❌ Error fetching chat boxes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChatBoxes();
  }, []);

  // ✅ WebSocket setup
  useEffect(() => {
    const socket = initSocket('ChatWithAdmin');
    socket.on('receive_event', (data) => {
      console.log('📩 Real-time message:', data);
      const msg = data?.text ?? data;

      const message = {
        _id: msg._id || `socket-${Date.now()}`,
        chatBoxId: msg.chatBoxId,
        content: msg.content,
        senderType: msg.senderType,
        messageType: msg.messageType || 'text',
        createdAt: msg.createdAt || data.timestamp || new Date().toISOString(),
      };

      setMessages((prev) => {
        const exists = prev.some(
          (m) =>
            (m.isTemp &&
              m.senderType === 'admin' &&
              m.content === message.content &&
              m.chatBoxId === message.chatBoxId) ||
            m._id === message._id
        );

        if (exists) return prev;

        // ✅ If message belongs to currently open chat → show immediately (no unread)
        if (message.chatBoxId === selectedChat) {
          return [...prev, message];
        }

        return prev;
      });

      // ✅ Update chat list (only bump unread if not current chat)
      setChatBoxes((prev) =>
        prev.map((c) => {
          if (c.id === message.chatBoxId) {
            const isCurrent = c.id === selectedChat;
            return {
              ...c,
              lastMessage: message.content,
              lastUpdated: new Date().toLocaleString(),
              unreadCount: {
                ...c.unreadCount,
                admin: isCurrent
                  ? 0 // ✅ if this chat is open, do not increase unread
                  : (c.unreadCount?.admin || 0) + 1, // ✅ otherwise, increment
              },
            };
          }
          return c;
        })
      );
    });





    return () => {
      socket.off('receive_event');
    };
  }, [selectedChat]);

  // ✅ Fetch messages (with pagination)
  const fetchMessages = async (chatId, pageNum = 1, isLoadingMore = false) => {
    if (!chatId) return;
    setLoadingMessages(true);

    try {
      const res = await getChatBoxsById(chatId, pageNum, limit);
      const apiRoot = res?.data?.data;
      const apiData = apiRoot || [];
      const totalPages = res?.data?.totalPages || 1;

      console.log('totalPages', totalPages);

      const sorted = apiData.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setMessages((prev) => (isLoadingMore ? [...sorted, ...prev] : sorted));
      setHasMore(pageNum < totalPages);
    } catch (err) {
      console.error('❌ setSelectedChat fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // ✅ Load messages on chat change
  useEffect(() => {
    if (!selectedChat) return;
    setMessages([]);
    setPage(1);
    fetchMessages(selectedChat, 1, false);
  }, [selectedChat]);

  // ✅ Infinite scroll upward
  const handleScroll = async (e) => {
    const el = e.target;
    if (el.scrollTop <= 0 && hasMore && !loadingMessages) {
      const prevHeight = el.scrollHeight;
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchMessages(selectedChat, nextPage, true);
      setTimeout(() => {
        const newHeight = el.scrollHeight;
        el.scrollTop = newHeight - prevHeight;
      }, 50);
    }
  };

  // ✅ Send message (Admin)
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    const chatData = chatBoxes.find((c) => c.id === selectedChat);
    if (!chatData) return;

    const payload = {
      userId: chatData.user.id,
      senderType: 'admin',
      chatBoxId: selectedChat,
      content: newMessage.trim(),
      messageType: 'text',
    };

    // 🔹 Add temporary message for instant UI update
    const tempMsg = {
      _id: `temp-${Date.now()}`,
      chatBoxId: selectedChat,
      senderType: 'admin',
      messageType: 'text',
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
      isTemp: true, // 🧩 mark as local-only
    };

    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage('');
    scrollToBottom();

    try {
      await AddMessage(payload); // backend will broadcast via socket
    } catch (err) {
      console.error('❌ Send message error:', err);
    }
  };


  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading chats...
      </div>
    );

  const selectedChatData = chatBoxes.find((chat) => chat.id === selectedChat);

  return (
    <div className="h-screen overflow-hidden bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 flex h-full overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto custom-scrollbar">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">
                Conversations
              </h2>
              <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-sm font-semibold">
                {chatBoxes.length}
              </span>
            </div>
          </div>


          {chatBoxes.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">No chats found</p>
          ) : (
            chatBoxes.map((chat) => {
              const unread = chat.unreadCount?.admin || 0; // ✅ admin unread count
              return (
                <div
                  key={chat.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${selectedChat === chat.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                  onClick={() => {
                    setSelectedChat(chat.id);

                    // ✅ Instantly clear unread count for admin when opening this chat
                    setChatBoxes((prev) =>
                      prev.map((c) =>
                        c.id === chat.id
                          ? {
                            ...c,
                            unreadCount: {
                              ...c.unreadCount,
                              admin: 0, // since admin is reading messages now
                            },
                          }
                          : c
                      )
                    );

                    // ✅ Optionally reload messages (which also resets unread count in backend)
                    fetchMessages(chat.id, 1, false);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={chat.user.profileImage}
                      alt={chat.user.name}
                      className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate flex items-center gap-2">
                        {chat.user.name}
                        {/* ✅ Unread Badge */}
                        {unread > 0 && (
                          <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                            {unread > 99 ? '99+' : unread}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{chat.user.email}</p>
                      <p className="text-sm text-gray-600 truncate mt-1">{chat.lastMessage}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>


        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedChatData ? (
            <>
              {/* Header */}
              <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedChatData.user.profileImage}
                    alt={selectedChatData.user.name}
                    className="w-10 h-10 rounded-full border border-gray-300"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {selectedChatData.user.name}
                    </h3>
                    <p className="text-sm text-gray-500">{selectedChatData.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar"
              >
                {loadingMessages && hasMore && (
                  <p className="text-center text-gray-400 text-sm">
                    Loading older messages...
                  </p>
                )}

                {messages.map((msg) => {
                  const isAdmin = msg.senderType === 'admin';
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex items-end space-x-2 ${isAdmin ? 'flex-row-reverse space-x-reverse' : ''
                          }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center">
                          {isAdmin ? (
                            <span className="text-xs font-semibold text-gray-700">Admin</span>
                          ) : (
                            <img
                              src={
                                selectedChatData?.user?.profileImage ||
                                'https://i.pravatar.cc/150?u=default'
                              }
                              alt={selectedChatData?.user?.name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          )}
                        </div>
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${isAdmin
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                            }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${isAdmin ? 'text-blue-100' : 'text-gray-500'
                              }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a chat to view messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
