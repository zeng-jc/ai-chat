<script setup lang="ts">
import { saveConversationFetch, conversationListFetch } from '@/service/modules/conversation'
import { Message, Modal, type ScrollbarInstance } from '@arco-design/web-vue'
import useUserStore from '@/stores/modules/user'
import useChatStore from '@/stores/modules/chat'
import { useRouter } from 'vue-router'
import { ref, onMounted, reactive, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { h } from 'vue'
import _debounce from '@/utils/debounce'

const userStore = useUserStore()
const chatStore = useChatStore()
chatStore.getChatList()

let curEditChatId: number
let xhr: XMLHttpRequest
const router = useRouter()
const aTextareaRef = ref()
const userMessageInputVal = ref<string>('') // 输入框内容
const conversationList = ref<any[]>([]) // 对话列表
const visible = ref<boolean>(false) // 编辑对话框显示隐藏状态
const collapsed = ref<boolean>(false)
const searchInputVal = ref<string>('')
const editorFormRef = ref()
// 编辑对话框中的表单
const form = reactive({
  name: ''
})
// 滚动条
const scrollbarRef = ref<ScrollbarInstance>()
// 发送状态（true可发送）
const sendStatus = ref<boolean>(true)
const { chatList } = storeToRefs(chatStore)
// 当前选中的聊天
const curActiveChat = reactive<{ id?: number; index: number; name: string }>({
  index: 0,
  name: ''
})
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

// 设置curActiveChat
const setCurActiveChat = ({ index, id, name }: { index: number; id: number; name: string }) => {
  curActiveChat.index = index
  curActiveChat.id = id
  curActiveChat.name = name
}

// 新建聊天
const createChatHandle = async () => {
  const { id, name } = await chatStore.createChat()
  setCurActiveChat({ index: 0, id, name })
  chatStore.getChatList()
}

// 删除聊天
const deleteChatHandle = ({ id, name }: { id: number; name: string }, index: number) => {
  Modal.warning({
    width: 'auto',
    title: () => h('span', { style: 'font-weight: 600;' }, '提示'),
    content: () => h('span', { style: 'font-weight: 600;' }, `确定要永久删除 "${name}" 吗？`),
    hideCancel: false,
    cancelButtonProps: { size: 'small' },
    okButtonProps: { size: 'small' },
    onCancel: () => {},
    onOk: async () => {
      if (index === curActiveChat.index) {
        setCurActiveChat({ index: 0, id: chatList.value[1].id, name: chatList.value[1].name })
      } else if (index < curActiveChat.index) {
        curActiveChat.index -= 1
      }
      await chatStore.deleteChat(id)
      Message.success('删除成功')
    }
  })
}

// 编辑聊天
const editChatHandle = ({ id, name }: { id: number; name: string }) => {
  visible.value = true
  curEditChatId = id
  form.name = name
  editorFormRef.value.clearValidate()
}
// 编辑确认
const handleOk = () => {
  editorFormRef.value.validate().then(async (error: any) => {
    if (!error) {
      await chatStore.editChat(curEditChatId, form)
      visible.value = false
      Message.success('编辑成功')
    }
  })
}

// 发送信息
const sendHandle = async (event: Event) => {
  if (!sendStatus.value) return
  xhr = new XMLHttpRequest()
  xhr.open('POST', import.meta.env.VITE_BASE_URL + '/conversation/send')
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.setRequestHeader('Authorization', 'Bearer ' + userStore.token)
  let lastResponseLength = 0
  xhr.onprogress = function () {
    const newResponse = xhr.responseText.substring(lastResponseLength)
    // 更新已读取的响应长度，以便下次从新的位置开始读取
    lastResponseLength = xhr.responseText.length
    // 处理最新接收到的数据片段
    const curData = newResponse.split(' ')[2]
    const res = curData && JSON.parse(curData)
    scrollbarRef.value?.scrollTop(Number.MAX_SAFE_INTEGER)
    if (res) conversationList.value[conversationList.value.length - 1].aiMessage += res?.data
  }
  xhr.onloadend = function () {
    curActiveChat.id &&
      saveConversationFetch({
        messageId: messageId,
        chatId: curActiveChat.id
      })
    sendStatus.value = true
  }

  const messageId = Date.now() + Math.floor(Math.random() * 100000) + ''
  //data是要发送给后台的数据
  let data = JSON.stringify({
    chatId: curActiveChat.id,
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

const toggleChatHandle = async ({
  index,
  chatId,
  name
}: {
  index: number
  chatId: number
  name: string
}) => {
  if (curActiveChat.index === index) return
  // 关闭请求
  xhr && xhr.abort()
  setCurActiveChat({ index, id: chatId, name })
  const res = await conversationListFetch(chatId)
  conversationList.value = res.data.list
  setTimeout(() => {
    scrollbarRef.value?.scrollTop(Number.MAX_SAFE_INTEGER)
  }, 10)
}

const onCollapse = () => {
  collapsed.value = !collapsed.value
}

const onBreakpoint = () => {
  collapsed.value = !collapsed.value
}

const searchChatHandle = _debounce(() => {
  chatStore.getChatList({ keywords: searchInputVal.value })
  curActiveChat.index = 0
  delete curActiveChat.id
}, 500)

onMounted(() => {
  aTextareaRef.value.textareaRef.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      sendHandle(event)
    }
  })
})

watch(chatList, async () => {
  curActiveChat.id = curActiveChat.id ?? chatList.value[0].id
  curActiveChat.name = chatList.value[0]?.name
  const res = await conversationListFetch(curActiveChat.id)
  conversationList.value = res.data.list
  setTimeout(() => {
    scrollbarRef.value?.scrollTop(Number.MAX_SAFE_INTEGER)
  }, 10)
})
</script>

<template>
  <div class="main">
    <a-layout class="layout-container">
      <div class="mobile-sidebar-mask" v-if="!collapsed" @click="collapsed = !collapsed"></div>
      <a-layout-sider
        class="layout-sider"
        style="padding: 0 5px 0 20px; position: relative; z-index: 102"
        :width="312"
        hide-trigger
        collapsible
        :collapsed="collapsed"
        :collapsed-width="0"
        breakpoint="lg"
        @breakpoint="onBreakpoint"
      >
        <!-- 侧边栏控制按钮 -->
        <a-button
          style="position: absolute; top: 16px; right: -16px"
          type="dashed"
          shape="circle"
          @click="onCollapse"
        >
          <IconCaretRight v-if="collapsed" />
          <IconCaretLeft v-else />
        </a-button>
        <div style="display: flex; margin: 15px 14px 15px 0">
          <a-input-search
            allow-clear
            placeholder="搜索聊天"
            @input="searchChatHandle"
            @clear="searchChatHandle"
            v-model="searchInputVal"
          />
          <a-button type="primary" style="margin-left: 8px" @click="createChatHandle">
            <!-- <template #icon>
              <icon-plus-circle />
            </template> -->
            <template #default> 新建聊天 </template>
          </a-button>
        </div>
        <a-scrollbar style="height: calc(99vh - 62px); overflow: auto">
          <ul class="chat-container">
            <li
              v-for="(item, index) in chatList"
              @click.stop="toggleChatHandle({ index, chatId: item.id, name: item.name })"
              :class="{
                'chat-item': true,
                'active-chat': index === curActiveChat.index
              }"
              :key="item.id"
            >
              <div>
                <div>{{ item.name }}</div>
                <div style="margin-top: 5px; font-size: 12px; color: var(--color-neutral-8)">
                  {{ item.createTime }}
                </div>
              </div>
              <div>
                <span class="edit-chat-btn" @click.stop="editChatHandle(item)"><icon-edit /></span>
                <span class="delete-chat-btn" @click.stop="deleteChatHandle(item, index)">
                  <icon-delete />
                </span>
              </div>
            </li>
          </ul>
        </a-scrollbar>
      </a-layout-sider>
      <a-layout>
        <a-layout-header class="layout-header">
          <div class="chat-name">{{ curActiveChat.name }}</div>
          <a-popconfirm content="你确定要退出登录吗?" type="warning" @ok="logout" position="left">
            <a-button type="outline">退出登录</a-button>
          </a-popconfirm>
        </a-layout-header>
        <a-layout-content
          style="display: flex; align-items: center; justify-content: center"
          v-show="chatList.length === 0"
        >
          <div>
            <a-empty description="AI聊天" /><a-button type="primary" @click="createChatHandle">
              + 新建AI聊天
            </a-button>
          </div>
        </a-layout-content>
        <a-layout-content class="layout-content" v-show="chatList.length !== 0">
          <a-scrollbar
            style="height: calc(100vh - 32px - 229px); overflow: auto"
            ref="scrollbarRef"
          >
            <ul>
              <li class="content-item" v-for="(item, index) in conversationList" :key="index">
                <div class="user-content">
                  <a-avatar
                    :style="{ backgroundColor: '#14a9f8', minWidth: '40px', minHeight: '40px' }"
                  >
                    user
                  </a-avatar>
                  <p class="user-text">{{ item.userMessage }}</p>
                </div>
                <div class="ai-content">
                  <a-avatar
                    :style="{
                      backgroundColor: 'rgb(var(--primary-5))',
                      minWidth: '40px',
                      minHeight: '40px'
                    }"
                  >
                    AI
                  </a-avatar>
                  <p class="ai-text">{{ item.aiMessage }}</p>
                </div>
              </li>
            </ul>
          </a-scrollbar>
        </a-layout-content>
        <a-layout-footer class="layout-footer" v-show="chatList.length !== 0">
          <div class="send-container">
            <a-button
              type="primary"
              @click="sendHandle"
              :disabled="!sendStatus"
              style="margin: 15px 0"
            >
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
        /></a-layout-footer>
      </a-layout>
    </a-layout>
    <!-- 对话框 -->
    <a-modal
      :width="340"
      :visible="visible"
      title="编辑聊天"
      @ok="handleOk"
      @cancel="visible = false"
      :render-to-body="true"
    >
      <a-form :model="form" ref="editorFormRef" layout="vertical">
        <a-form-item
          field="name"
          label="聊天名字"
          :required="true"
          :rules="{
            required: true,
            message: '聊天名字必填'
          }"
        >
          <a-input v-model="form.name" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style lang="less" scoped>
@import url(./index.less);
</style>
