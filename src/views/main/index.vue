<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import useUserStore from '@/stores/modules/user'
import useChatStore from '@/stores/modules/chat'
import { useRouter } from 'vue-router'
import { ref, onMounted, reactive } from 'vue'

const router = useRouter()
const userStore = useUserStore()
const chatStore = useChatStore()
const aTextareaRef = ref()
const textareaValue = ref<string>('')
const questions = reactive<string[]>([])
const conversationRecord = reactive<{ [prop: string]: any }[]>([])
const curChatKey = ref<number>(null)
chatStore.getChatList()

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
const createChat = () => {
  const conversationInfo = {
    key: Date.now(),
    name: '1'
  }
  conversationRecord.push(conversationInfo)
}

// 对话框点击处理
const dialogClickHandle = (key: number) => {
  curChatKey.value = key
}

const sendHandle = (event: KeyboardEvent) => {
  if (conversationRecord.length <= 0) {
    const conversationInfo = {
      key: Date.now(),
      name: '1'
    }
    conversationRecord.push(conversationInfo)
  }
  // const eventSource = EventSource('/conversation/send')
  // eventSource.onmessage = function (event) {
  //   console.log('message', event.data)
  // }
  questions.push(textareaValue.value)
  textareaValue.value = ''
  event.preventDefault()
}

onMounted(() => {
  aTextareaRef.value.textareaRef.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      sendHandle(event)
    }
  })
})
</script>

<template>
  <div class="main">
    <a-layout class="layout-container">
      <a-layout-sider style="padding: 10px; width: 332px">
        <div style="display: flex">
          <a-input-search :style="{ width: '320px' }" placeholder="搜索对话记录" />
          <a-button type="primary" style="margin-left: 8px" @click="createChat">
            <template #icon>
              <icon-plus-circle />
            </template>
            <template #default> 新建聊天 </template>
          </a-button>
        </div>
        <ul class="dialog-container">
          <li
            :class="{
              'dialog-item': true,
              'active-dialog': curChatKey === item.key
            }"
            @click="dialogClickHandle(item.key as number)"
            v-for="item in conversationRecord"
            :key="item.key"
          >
            {{ item.name }}
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
          <ul>
            <li class="content-item" v-for="(item, index) in questions" :key="index">
              <div class="user-content">
                <a-avatar :style="{ backgroundColor: '#14a9f8' }">user</a-avatar>
                <p class="user-text">{{ item }}</p>
              </div>
              <div class="ai-content">
                <a-avatar :style="{ backgroundColor: '#14a9f8' }">AI</a-avatar>
                <p class="ai-text">{{ item }}</p>
              </div>
            </li>
          </ul>
        </a-layout-content>
        <a-layout-footer class="layout-footer">
          <div class="send-container">
            <a-button type="primary" @click="sendHandle">
              <template #icon>
                <icon-send />
              </template>
              <template #default> 发送 </template>
            </a-button>
          </div>
          <a-textarea
            v-model:model-value="textareaValue"
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
.dialog-container {
  .dialog-item {
    border-radius: 8px;
    background-color: var(--color-fill-1);
    margin-top: 10px;
    border: 1px solid var(--color-border-1);
    font-size: 14px;
    padding: 12px;
  }
  .active-dialog {
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
import type { useChatStore } from '@/stores/modules/chat'
