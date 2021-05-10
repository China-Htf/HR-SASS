// 权限拦截在路由跳转 导航守卫
import router from '@/router'
import store from '@/store'   // 引入 store 实例
import NProgress from 'nprogress' // 引入一份进度条插件
import 'nprogress/nprogress.css' // 引入进度条样式

// 前置守卫
// 不需要导出 只需要代码执行即可
// next 是前置守卫必须执行的钩子 next 必须执行 否则页面就死了
// next() 放过
// next(false) 终止跳转
// next(地址) 跳转到某地址
const whiteList = ['/login', '/404']
router.beforeEach(async (to, from, next) => {
  NProgress.start() // 开启进度条
  if(store.getters.token) {
    // 如果有 token
    if(to.path === '/login') {
      // 如果访问的是登录页
      next('/') // 跳转到主页
    } else {
      if(!store.getters.userId) {
        await store.dispatch(`user/getUserInfo`)
      }
      next()
    }
  }else {
    // 没有 token 的情况下
    if(whiteList.indexOf(to.path) > -1) {
      // 表示要去的地址在白名单
      next()
    } else {
      next('/login')
    }
  }
  NProgress.done() // 手动强制关闭一次  为了解决 手动切换地址时  进度条的不关闭的问题
})
router.afterEach(() => {
  NProgress.done() // 关闭进度条
})
