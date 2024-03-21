import { saveConversationFetch, conversationListFetch } from '@/service/modules/conversation'
import { defineStore } from 'pinia'

const useChatStore = defineStore('conversation', {
  state: () => ({
    chatList: []
  }),
  actions: {
    async getConversationList(chatId: number) {
      const res = await conversationListFetch(chatId)
      this.chatList = res.data.list
      return res.data
    },
    async saveConversation(data: { messageId: string; chatId: number }) {
      await saveConversationFetch(data)
      await this.getConversationList(data.chatId)
    }
  }
})

export default useChatStore
