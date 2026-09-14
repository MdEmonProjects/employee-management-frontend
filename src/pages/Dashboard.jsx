import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  sendMessage,
  receiveReply,
} from '../features/chat/chatSlice';

const STOCK_REPLIES = [
  "Got it — that's noted. What else is on your mind?",
  "Here's a placeholder reply. Wire this up to your real API when ready.",
  "Makes sense. Anything you'd like me to expand on?",
];

export default function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { conversations, activeConversationId } = useSelector((state) => state.chat);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [activeConversation?.messages.length]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !activeConversationId) return;
    dispatch(sendMessage(activeConversationId, text));
    setDraft('');
    setTimeout(() => {
      const reply = STOCK_REPLIES[Math.floor(Math.random() * STOCK_REPLIES.length)];
      dispatch(receiveReply({ conversationId: activeConversationId, text: reply }));
    }, 500);
  };

  return (
    <>
        {!activeConversation || activeConversation.messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
            <h1 className="font-serif text-3xl font-medium text-gray-900">
              Good to see you, {user?.name}
            </h1>
            <p className="text-gray-500">Start a conversation below.</p>
          </div>
        ) : (
          <div ref={scrollRef} className="mx-auto w-full max-w-3xl flex-1 space-y-4 overflow-y-auto px-4 py-8 sm:px-6">
            {activeConversation.messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`
                    max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed
                    ${m.role === 'user'
                      ? 'rounded-br-md bg-clay text-white'
                      : 'rounded-bl-md border border-gray-200 bg-white text-gray-800'}
                  `}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="mx-auto flex w-full max-w-3xl items-end gap-2.5 px-4 pb-6 pt-4 sm:px-6">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Message…"
            rows={1}
            className="max-h-40 flex-1 resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[14.5px] leading-relaxed text-gray-900 outline-none focus:border-clay"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-clay text-white hover:bg-clay-dark disabled:bg-gray-200 disabled:text-gray-400"
          >
            ↑
          </button>
        </form>
    </>
  );
}
