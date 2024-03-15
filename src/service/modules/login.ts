import { service } from '..'
import type { IAccount } from '@/types'

export function signinFetch(userInfo: IAccount) {
  return service.request({
    url: '/auth/signin',
    method: 'post',
    data: {
      username: userInfo.username,
      password: userInfo.password
    }
  })
}
