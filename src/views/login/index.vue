<script setup lang="ts">
import verifycodeSignin from './verifycode-signin.vue'
import passwordSignin from './password-signin.vue'
import { reactive, ref } from 'vue'

const curTabActive = ref<number>(0)
const tabs = reactive(['密码登录', '验证码登录'])
const tabClick = (index: number) => {
  curTabActive.value = index
}
</script>

<template>
  <div class="signin-view">
    <div class="signin-section">
      <div class="left-section">
        <div class="login-mode">
          <span
            v-for="(item, index) in tabs"
            :key="index"
            @click="tabClick(index)"
            :class="{ active: curTabActive === index }"
          >
            {{ item }}
          </span>
        </div>
        <password-signin v-if="curTabActive === 0" />
        <verifycode-signin v-if="curTabActive === 1" />
      </div>
      <div class="right-section">
        <div class="circle"></div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.signin-view {
  background-color: var(--theme-bgk1);
  display: flex;
  justify-content: center;
}
.signin-section {
  margin: 18vh 10px 0;
  background-color: #fff;
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  flex: 1;
  max-width: 700px;
  box-shadow: 0 0 10px -5px #86909c;
  .left-section,
  .right-section {
    flex: 1;
  }
  .left-section {
    padding: 18px 20px;
    .login-mode {
      font-size: 14px;
      color: #c9cdd4;
      margin-bottom: 10px;
      text-align: right;
      span {
        margin-left: 10px;
        cursor: pointer;
      }
    }
  }
  .right-section {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f7f9;
    .circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background-color: rgb(var(--primary-6));
      position: relative;
      &::after {
        content: '';
        width: 180px;
        height: 85px;
        background-color: transparent;
        backdrop-filter: blur(8px);
        position: absolute;
        top: 50%;
        right: 50%;
        transform: translateX(50%);
      }
    }
  }
}
.active {
  font-size: 14px;
  color: rgb(var(--primary-6));
  border-bottom: 2px solid rgb(var(--primary-6));
}

@media screen and (max-width: 576px) {
  .right-section {
    display: none !important;
  }
}
</style>
