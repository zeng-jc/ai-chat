import {
  createChatFetch,
  getChatListFetch,
  deleteChatFetch,
  updateChatFetch
} from '@/service/modules/chat'
import { defineStore } from 'pinia'

interface ChatState {
  chatList: { id: number; userId: number; name: string; createTime: string }[]
}

const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    chatList: []
  }),
  actions: {
    async getChatList(query?: { keywords: string }) {
      const res = await getChatListFetch(query)
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
