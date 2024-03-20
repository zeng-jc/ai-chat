import { createChatFetch, getChatListFetch } from '@/service/modules/chat'
import { defineStore } from 'pinia'

const useChatStore = defineStore('chat', {
  state: () => ({
    chatList: []
  }),
  actions: {
    async getChatList() {
      const res = await getChatListFetch()
      this.chatList = res.data
    },
    createChat() {
      createChatFetch()
    }
  }
})

export default useChatStore
