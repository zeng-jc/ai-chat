import useUserStore from '@/stores/modules/user'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/main'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/index.vue'),
      meta: {
        title: '登录'
      }
    },
    {
      path: '/main',
      name: 'main',
      component: () => import('../views/main/index.vue'),
      meta: {
        title: '首页'
      }
    },
    {
      path: '/:pathMatch(.*)',
      component: () => import('../views/not-found/not-found.vue')
    }
  ]
})

/**
 * @description 路由拦截 beforeEach
 * */
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // 1.设置标题
  document.title = to.meta.title ? (to.meta.title as string) : ''

  // 2.判断是访问登陆页，有 Token 就在当前页面，没有 Token 重置路由到登陆页
  if (to.path.toLocaleLowerCase() === '/login') {
    if (userStore.token) return next(from.fullPath)
    return next()
  }

  // 3.判断是否有 Token，没有重定向到 login 页面
  if (!userStore.token) return next({ path: '/login', replace: true })

  // 4.正常访问页面
  next()
})

export default router
