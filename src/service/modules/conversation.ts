import { service } from '..'

export function sendMessageFetch() {
  return service.request({
    method: 'post',
    url: '/conversation/send',
    responseType: 'stream'
  })
}

export function saveConversationFetch(data: { messageId: string; chatId: number }) {
  return service.request({
    method: 'post',
    url: '/conversation/save',
    data
  })
}

export function conversationListFetch(chatId: number) {
  return service.request({
    method: 'get',
    url: `conversation/list/${chatId}`
  })
}
