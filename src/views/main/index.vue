<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import useUserStore from '@/stores/modules/user'
import { useRouter } from 'vue-router'
import { ref, onMounted, reactive } from 'vue'
const userStore = useUserStore()
const router = useRouter()
const aTextareaRef = ref()
const textareaValue = ref<string>('')
const questions = reactive<string[]>([])

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

onMounted(() => {
  aTextareaRef.value.textareaRef.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      questions.push(textareaValue.value.replaceAll('\n', '<br>'))
      textareaValue.value = ''
      event.preventDefault()
    }
  })
})
</script>

<template>
  <div class="main">
    <a-layout style="height: 99vh; width: 99vw; margin: auto">
      <a-layout-sider>Sider</a-layout-sider>
      <a-layout>
        <a-layout-header class="layout-header">
          <a-popconfirm content="你确定要退出登录吗?" type="warning" @ok="logout" position="left">
            <a-button type="outline">退出登录</a-button>
          </a-popconfirm>
        </a-layout-header>
        <a-layout-content>
          <ul>
            <li v-for="(item, index) in questions" :key="index">
              <div v-html="item"></div>
            </li>
          </ul>
        </a-layout-content>
        <a-layout-footer>
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
.layout-header {
  display: flex;
  flex-direction: row-reverse;
}
</style>
