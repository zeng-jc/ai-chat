import { service } from '..'

// 新建聊天
export function createChatFetch() {
  return service.request({
    url: '/chat/create',
    method: 'post'
  })
}

// 更新聊天
export function updateChatFetch(chatId: number, data: { name: string }) {
  return service.request({
    url: `/chat/${chatId}`,
    method: 'patch',
    data
  })
}

// 删除聊天
export function deleteChatFetch(chatId: number) {
  return service.request({
    url: `/chat/${chatId}`,
    method: 'delete'
  })
}

// 查询聊天列表
export function getChatListFetch() {
  return service.request({
    url: '/chat/list',
    method: 'get'
  })
}
