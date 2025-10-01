import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const ChatModal = ({ open, offer, loading, messages = [], sending, onSend, onClose }) => {
  const [draft, setDraft] = useState('');
  const [attachment, setAttachment] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setDraft('');
      setAttachment(null);
    }
  }, [open, offer?.id]);

  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [open, messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!onSend) return;
    const payload = {
      body: draft.trim() ? draft.trim() : null,
      file: attachment?.file ?? null,
    };
    if (!payload.body && !payload.file) {
      return;
    }
    const success = await onSend(payload);
    if (success) {
      setDraft('');
      setAttachment(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setAttachment(null);
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setAttachment({ file, previewUrl, name: file.name });
  };

  const recipientName = useMemo(() => offer?.sellerName || 'Seller', [offer?.sellerName]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-surface rounded-xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary-200">
              <Image
                src={offer?.sellerAvatarUrl || undefined}
                alt={recipientName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Conversation with {recipientName}</h3>
              <p className="text-xs text-text-secondary">Offer submitted {new Date(offer?.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-lg transition-colors duration-200"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-background">
          {loading ? (
            <div className="h-full flex items-center justify-center text-text-secondary">
              <Icon name="Loader2" size={24} className="animate-spin mr-2" />
              Loading conversation...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-text-secondary text-sm py-10">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div className="flex items-center space-x-2 text-xs text-text-secondary">
                  <span className="font-medium text-text-primary">
                    {message.senderUserId === offer?.sellerId ? recipientName : 'You'}
                  </span>
                  <span>•</span>
                  <span>{new Date(message.createdAt).toLocaleString()}</span>
                </div>
                {message.body && (
                  <p className="text-sm text-text-primary bg-surface border border-border rounded-lg p-3">
                    {message.body}
                  </p>
                )}
                {message.attachmentUrl && (
                  <Image
                    src={message.attachmentUrl}
                    alt="Attachment"
                    className="max-w-xs rounded-lg border border-border"
                  />
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-border px-5 py-4 space-y-3 bg-surface">
          {attachment && (
            <div className="flex items-center justify-between bg-secondary-100 rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <Icon name="Paperclip" size={16} />
                <span className="truncate max-w-[200px]">{attachment.name}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (attachment.previewUrl) {
                    URL.revokeObjectURL(attachment.previewUrl);
                  }
                  setAttachment(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="text-xs text-text-secondary hover:text-text-primary"
              >
                Remove
              </button>
            </div>
          )}

          <div className="flex items-end space-x-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={2}
              placeholder="Write a message"
              className="flex-1 input-field"
            />
            <div className="flex flex-col space-y-2">
              <label className="flex items-center justify-center w-10 h-10 rounded-lg border border-border text-text-secondary hover:text-primary hover:border-primary cursor-pointer">
                <Icon name="Paperclip" size={18} />
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
              <button
                type="submit"
                disabled={sending}
                className="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
              >
                {sending ? (
                  <>
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    <span>Sending</span>
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={16} />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ChatModal;
