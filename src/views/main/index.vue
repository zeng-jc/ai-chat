<script setup lang="ts">
import { saveConversationFetch, conversationListFetch } from '@/service/modules/conversation'
import { Message, Modal } from '@arco-design/web-vue'
import useUserStore from '@/stores/modules/user'
import useChatStore from '@/stores/modules/chat'
import { useRouter } from 'vue-router'
import { ref, onMounted, reactive, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { h } from 'vue'
const userStore = useUserStore()
const chatStore = useChatStore()
chatStore.getChatList()

let curEditChatId = null
let xhr = null
const router = useRouter()
const aTextareaRef = ref()
const userMessageInputVal = ref<string>('')
const conversationList = ref<any[]>([])
const visible = ref<boolean>(null)
const curActiveChat = ref(0) //当前选中的聊天
const form = reactive({
  name: ''
})
const scrollbarRef = ref('')
// 发送状态（true可发送）
const sendStatus = ref<boolean>(true)
const { chatList } = storeToRefs<{ [prop: string]: any }[]>(chatStore)

// 退出登录
const logout = () => {
  // 1.执行退出登录接口
  // await logoutApi();
  // 2.清除 Token
  userStore.setToken('')
  // 3.重定向到登陆页
  router.replace('/login')
  Message.success('退出登录成功！')
}

// 新建聊天
const createChatHandle = async () => {
  await chatStore.createChat()
}

// 删除聊天
const deleteChatHandle = ({ id, name }) => {
  Modal.warning({
    title: () => h('span', { style: 'font-weight: 600;' }, '提示'),
    content: () => h('span', { style: 'font-weight: 600;' }, `确定要永久删除 "${name}" 吗？`),
    hideCancel: false,
    cancelButtonProps: { size: 'small' },
    okButtonProps: { size: 'small' },
    onCancel: () => {},
    onOk: async () => {
      await chatStore.deleteChat(id)
      Message.success('删除成功')
    }
  })
}

// 编辑聊天
const editChatHandle = ({ id, name }) => {
  visible.value = true
  curEditChatId = id
  form.name = name
}
// 编辑确认
const handleBeforeOk = async () => {
  await chatStore.editChat(curEditChatId, form)
  visible.value = false
  Message.success('编辑成功')
}
const scrollToHandle = (options, y) => {
  console.log('options, y', options, y)
}
// 发送信息
const sendHandle = async (event: KeyboardEvent) => {
  if (!sendStatus.value) return
  if (chatList.value.length === 0) await createChatHandle()
  xhr = new XMLHttpRequest()
  xhr.open('POST', 'http://127.0.0.1:5173/api/conversation/send')
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.setRequestHeader('Authorization', 'Bearer ' + userStore.token)
  let lastResponseLength = 0
  xhr.onprogress = function (event) {
    const newResponse = xhr.responseText.substring(lastResponseLength)
    // 更新已读取的响应长度，以便下次从新的位置开始读取
    lastResponseLength = xhr.responseText.length
    // 处理最新接收到的数据片段
    const curData = newResponse.split(' ')[2]
    const res = curData && JSON.parse(curData)
    console.log(res)
    scrollbarRef.value.scrollTop(Number.MAX_SAFE_INTEGER)
    if (res) conversationList.value[conversationList.value.length - 1].aiMessage += res?.data
  }
  xhr.onloadend = function () {
    saveConversationFetch({
      messageId: messageId,
      chatId: chatList.value[curActiveChat.value].id
    })
    sendStatus.value = true
  }

  const messageId = Date.now() + Math.floor(Math.random() * 100000) + ''
  //data是要发送给后台的数据
  let data = JSON.stringify({
    chatId: 1,
    userMessage: userMessageInputVal.value,
    messageId
  })
  xhr.send(data)
  // 禁用按钮
  sendStatus.value = false
  conversationList.value.push({ userMessage: userMessageInputVal.value, aiMessage: '' })
  userMessageInputVal.value = ''
  event.preventDefault()
}

const toggleChatHandle = async ({ index, chatId }) => {
  // 关闭请求
  xhr && xhr.abort()
  curActiveChat.value = index
  const res = await conversationListFetch(chatId)
  conversationList.value = res.data.list
  setTimeout(() => {
    scrollbarRef.value.scrollTop(Number.MAX_SAFE_INTEGER)
  }, 10)
}

onMounted(async () => {
  aTextareaRef.value.textareaRef.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      sendHandle(event)
    }
  })
})

watch(chatList, async () => {
  const res = await conversationListFetch(chatList.value[0]?.id)
  conversationList.value = res.data.list
  setTimeout(() => {
    scrollbarRef.value.scrollTop(Number.MAX_SAFE_INTEGER)
  }, 10)
})
</script>

<template>
  <div class="main">
    <a-layout class="layout-container">
      <a-layout-sider style="padding: 10px; width: 332px">
        <div style="display: flex">
          <a-input-search :style="{ width: '320px' }" placeholder="搜索对话记录" />
          <a-button type="primary" style="margin-left: 8px" @click="createChatHandle">
            <template #icon>
              <icon-plus-circle />
            </template>
            <template #default> 新建聊天 </template>
          </a-button>
        </div>
        <ul class="chat-container">
          <li
            @click="toggleChatHandle({ index, chatId: item.id })"
            v-for="(item, index) in chatList"
            :class="{
              'chat-item': true,
              'active-chat': index === curActiveChat
            }"
            :key="item.id"
          >
            <span>{{ item.name }}</span>
            <div>
              <span class="edit-chat-btn" @click.stop="editChatHandle(item)"><icon-edit /></span>
              <span class="delete-chat-btn" @click.stop="deleteChatHandle(item)">
                <icon-delete />
              </span>
            </div>
          </li>
        </ul>
      </a-layout-sider>
      <a-layout>
        <a-layout-header class="layout-header">
          <a-popconfirm content="你确定要退出登录吗?" type="warning" @ok="logout" position="left">
            <a-button type="outline">退出登录</a-button>
          </a-popconfirm>
        </a-layout-header>
        <a-layout-content class="layout-content">
          <a-scrollbar style="height: 70vh; overflow: auto" ref="scrollbarRef">
            <ul>
              <li class="content-item" v-for="(item, index) in conversationList" :key="index">
                <div class="user-content">
                  <a-avatar :style="{ backgroundColor: '#14a9f8' }">user</a-avatar>
                  <p class="user-text">{{ item.userMessage }}</p>
                </div>
                <div class="ai-content">
                  <a-avatar :style="{ backgroundColor: '#14a9f8' }">AI</a-avatar>
                  <p class="ai-text">{{ item.aiMessage }}</p>
                </div>
              </li>
            </ul>
          </a-scrollbar>
        </a-layout-content>
        <a-layout-footer class="layout-footer">
          <div class="send-container">
            <a-button type="primary" @click="sendHandle" :disabled="!sendStatus">
              <template #icon>
                <icon-send />
              </template>
              <template #default> 发送 </template>
            </a-button>
          </div>
          <a-textarea
            v-model:model-value="userMessageInputVal"
            ref="aTextareaRef"
            placeholder="请输入内容"
            :max-length="300"
            show-word-limit
            :auto-size="{
              minRows: 7,
              maxRows: 7
            }"
            allow-clear
            style="margin-top: 20px"
        /></a-layout-footer>
      </a-layout>
    </a-layout>
    <!-- 对话框 -->
    <a-modal v-model:visible="visible" title="编辑聊天" @before-ok="handleBeforeOk">
      <a-form :model="form">
        <a-form-item field="name" label="聊天名字">
          <a-input v-model="form.name" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style lang="less" scoped>
.layout-container {
  height: 99vh;
  width: 99vw;
  margin: auto;
}
.layout-header {
  display: flex;
  flex-direction: row-reverse;
}
.layout-header,
.layout-content,
.layout-footer {
  padding: 0 25px;
}
.send-container {
  text-align: right;
}
.chat-container {
  .chat-item {
    border-radius: 8px;
    background-color: var(--color-fill-1);
    margin-top: 10px;
    border: 1px solid var(--color-border-1);
    font-size: 14px;
    padding: 12px;
    display: flex;
    justify-content: space-between;
    .edit-chat-btn {
      margin-right: 10px;
      &:hover {
        color: rgb(var(--primary-7));
      }
    }
    .delete-chat-btn:hover {
      color: rgb(var(--danger-6));
    }
  }
  .active-chat {
    color: rgb(var(--arcoblue-6));
    border-color: rgb(var(--arcoblue-6));
    background-color: rgb(var(--arcoblue-1));
  }
}
.content-item {
  padding: 7px;
  .user-content,
  .ai-content {
    display: flex;
    padding: 5px 0;
  }
  .user-text {
    white-space: pre-wrap;
    overflow-wrap: break-word;
    word-break: break-word;
    padding: 10px;
    border-radius: 2px;
    margin-left: 7px;
    line-height: 25px;
    width: fit-content;
    max-width: 100%;
  }
  .ai-text {
    white-space: pre-wrap;
    overflow-wrap: break-word;
    word-break: break-word;
    padding: 10px;
    border-radius: 2px;
    margin-left: 7px;
    line-height: 25px;
    width: 100%;
    background-color: var(--color-neutral-2);
  }
}
</style>
, watchimport type { options } from 'node_modules/axios/index.cjs' import type { options } from
'node_modules/axios/index.cjs'
