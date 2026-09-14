import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  conversations: [
    {
      id: 'c1',
      title: 'Welcome',
      messages: [
        {
          id: nanoid(),
          role: 'assistant',
          text: "Hi! This is a demo dashboard shell. Type a message below to see it land in a thread.",
        },
      ],
    },
  ],
  activeConversationId: 'c1',
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    newConversation: (state) => {
      const id = nanoid();
      state.conversations.unshift({ id, title: 'New chat', messages: [] });
      state.activeConversationId = id;
    },
    selectConversation: (state, action) => {
      state.activeConversationId = action.payload;
    },
    deleteConversation: (state, action) => {
      state.conversations = state.conversations.filter((c) => c.id !== action.payload);
      if (state.activeConversationId === action.payload) {
        state.activeConversationId = state.conversations[0]?.id ?? null;
      }
    },
    sendMessage: {
      reducer: (state, action) => {
        const { conversationId, message } = action.payload;
        const convo = state.conversations.find((c) => c.id === conversationId);
        if (!convo) return;
        convo.messages.push(message);
        if (convo.title === 'New chat' && message.role === 'user') {
          convo.title = message.text.slice(0, 40);
        }
      },
      prepare: (conversationId, text) => ({
        payload: {
          conversationId,
          message: { id: nanoid(), role: 'user', text },
        },
      }),
    },
    receiveReply: (state, action) => {
      const { conversationId, text } = action.payload;
      const convo = state.conversations.find((c) => c.id === conversationId);
      if (!convo) return;
      convo.messages.push({ id: nanoid(), role: 'assistant', text });
    },
  },
});

export const {
  newConversation,
  selectConversation,
  deleteConversation,
  sendMessage,
  receiveReply,
} = chatSlice.actions;
export default chatSlice.reducer;
