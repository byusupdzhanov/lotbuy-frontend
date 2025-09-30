import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const ChatModal = ({ recipient, lotId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Mock messages data
  useEffect(() => {
    const mockMessages = [
      {
        id: 1,
        senderId: recipient.id || 101,
        senderName: recipient.name,
        content: "Hi! I saw your lot for the DSLR camera setup. I have exactly what you\'re looking for.",
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        type: 'text'
      },
      {
        id: 2,
        senderId: 1, // Current user
        senderName: "You",
        content: "Great! Can you tell me more about the condition of the equipment?",
        timestamp: new Date(Date.now() - 3500000),
        type: 'text'
      },
      {
        id: 3,
        senderId: recipient.id || 101,
        senderName: recipient.name,
        content: "Everything is in excellent condition. The camera body has less than 10,000 shutter count, and all lenses are professionally maintained. I can send you detailed photos if you\'d like.",
        timestamp: new Date(Date.now() - 3400000),
        type: 'text'
      },
      {
        id: 4,
        senderId: 1,
        senderName: "You",
        content: "That would be perfect! Also, are you flexible on the delivery timeline?",
        timestamp: new Date(Date.now() - 3300000),
        type: 'text'
      },
      {
        id: 5,
        senderId: recipient.id || 101,
        senderName: recipient.name,
        content: "Absolutely! I can have everything ready for pickup or shipping within 24 hours. Here are some photos of the equipment:",
        timestamp: new Date(Date.now() - 3200000),
        type: 'text'
      },
      {
        id: 6,
        senderId: recipient.id || 101,
        senderName: recipient.name,
        content: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop",
        timestamp: new Date(Date.now() - 3100000),
        type: 'image'
      }
    ];

    setMessages(mockMessages);
  }, [recipient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      senderId: 1, // Current user
      senderName: "You",
      content: newMessage.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate typing indicator and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      // Simulate auto-response
      const responses = [
        "Thanks for your message! Let me check on that for you.",
        "I'll get back to you with more details shortly.",
        "That sounds good to me. When would be a good time to discuss further?",
        "Perfect! I'll prepare everything accordingly."
      ];
      
      const autoResponse = {
        id: messages.length + 2,
        senderId: recipient.id || 101,
        senderName: recipient.name,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, autoResponse]);
    }, 2000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const dateKey = formatDate(message.timestamp);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  const modalContent = (
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-subtle">
      <div className="w-full max-w-2xl h-[600px] bg-surface rounded-xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-secondary-50">
          <div className="flex items-center space-x-3">
            <Image
              src={recipient.avatar}
              alt={recipient.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-text-primary">{recipient.name}</h3>
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success-500' : 'bg-secondary-400'}`} />
                <span className="text-text-secondary">
                  {isOnline ? 'Online' : 'Last seen 2h ago'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => console.log('Voice call')}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-lg transition-all duration-200"
              title="Voice call"
            >
              <Icon name="Phone" size={18} />
            </button>
            <button
              onClick={() => console.log('Video call')}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-lg transition-all duration-200"
              title="Video call"
            >
              <Icon name="Video" size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-lg transition-all duration-200"
            >
              <Icon name="X" size={18} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.entries(messageGroups).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-secondary-100 text-secondary-600 px-3 py-1 rounded-full text-xs font-medium">
                  {date}
                </div>
              </div>

              {/* Messages for this date */}
              {dateMessages.map((message) => {
                const isCurrentUser = message.senderId === 1;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                      {message.type === 'text' ? (
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isCurrentUser
                              ? 'bg-primary text-white rounded-br-md' :'bg-secondary-100 text-text-primary rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                      ) : message.type === 'image' ? (
                        <div className="rounded-2xl overflow-hidden">
                          <Image
                            src={message.content}
                            alt="Shared image"
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      ) : null}
                      
                      <div className={`flex items-center mt-1 space-x-1 ${
                        isCurrentUser ? 'justify-end' : 'justify-start'
                      }`}>
                        <span className="text-xs text-text-secondary">
                          {formatTime(message.timestamp)}
                        </span>
                        {isCurrentUser && (
                          <Icon name="Check" size={12} className="text-text-secondary" />
                        )}
                      </div>
                    </div>

                    {!isCurrentUser && (
                      <Image
                        src={recipient.avatar}
                        alt={recipient.name}
                        className="w-8 h-8 rounded-full object-cover order-1 mr-2 mt-auto"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start mb-3">
              <div className="flex items-center space-x-2">
                <Image
                  src={recipient.avatar}
                  alt={recipient.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="bg-secondary-100 px-4 py-2 rounded-2xl rounded-bl-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-border p-4">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <button
                  type="button"
                  onClick={() => console.log('Attach file')}
                  className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-lg transition-all duration-200"
                  title="Attach file"
                >
                  <Icon name="Paperclip" size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => console.log('Send image')}
                  className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-lg transition-all duration-200"
                  title="Send image"
                >
                  <Icon name="Image" size={18} />
                </button>
              </div>
              
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Type your message..."
                  className="w-full px-4 py-2 border border-border rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  rows={2}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="p-3 bg-primary text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Icon name="Send" size={18} />
            </button>
          </form>
          
          <p className="text-xs text-text-secondary mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ChatModal;