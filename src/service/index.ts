import Service from './request'
import { BASE_URL, TIMEOUT } from './request/config'

export const service = new Service({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  // 属于这个实例的拦截器
  interceptors: {
    requestOnFulfilled(config) {
      config.headers.Authorization = localStorage.getItem('token')
      return config
    },
    requestOnRejected(err) {
      return err
    },
    responseOnFulfilled(config) {
      return config
    },
    responseOnRejected(config) {
      return config
    }
  }
})
