import {
  createChatFetch,
  getChatListFetch,
  deleteChatFetch,
  updateChatFetch
} from '@/service/modules/chat'
import { defineStore } from 'pinia'

const useChatStore = defineStore('chat', {
  state: () => ({
    chatList: []
  }),
  actions: {
    async getChatList() {
      const res = await getChatListFetch()
      this.chatList = res.data.list
      return res.data
    },
    async createChat() {
      await createChatFetch()
      await this.getChatList()
    },
    async deleteChat(id: number) {
      await deleteChatFetch(id)
      await this.getChatList()
    },
    async editChat(id: number, data: { name: string }) {
      await updateChatFetch(id, data)
      await this.getChatList()
    }
  }
})

export default useChatStore
