import { defineStore } from 'pinia'
import piniaPersistConfig from '@/stores/helper/persist'
export interface UserState {
  token: string
  userInfo: { username: string }
}
const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: '',
    userInfo: { username: '' }
  }),
  getters: {},
  actions: {
    setToken(token: string) {
      this.token = token
    },
    setUserInfo(userInfo: UserState['userInfo']) {
      this.userInfo = userInfo
    }
  },
  persist: piniaPersistConfig('user')
})

export default useUserStore
