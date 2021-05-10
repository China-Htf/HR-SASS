import {getToken, setToken, removeToken, setTimeStamp} from '@/utils/auth'
import { login, getUserInfo, getUserDetailById } from '@/api/user'

// 状态
const state = {
  token: getToken(), // 设置 token 为共享状态 初始化 vuex 的时候 就先从缓存中读取
  userInfo: {} // 定义一个空的对象 不是null 因为后边我要开发userInfo的属性给别人用  userInfo.name
}
const mutations = {
  setToken(state, token) {
    state.token = token, // 设置 token 只是修改 state 的数据
    setToken(token)     // vuex 和 缓存数据的同步
  },
  removeToken(state) {
    state.token = null, // 删除 vuex 的 token
    removeToken()       // 先清除 vuex 再清除缓存 vuex 和缓存数据
  },
  setUserInfo(state, result) {
    // 更新一个对象
    state.userInfo = result // 这样是响应式
    // state.userInfo = { ...result } 这样也是响应式 属于浅拷贝
    // state.userInfo['username'] = result 这样不是响应式
  },
  removeUserInfo(state) {
    state.userInfo = {}
  }
}
const actions = {
  async login(context, data) {
    // 经过响应拦截器的处理之后 这里的result实际上就是 token
    const result = await login(data) // 实际上就是一个promise  result就是执行的结果
    // axios默认给数据加了一层data
    // 表示登录接口调用成功 也就是意味着你的用户名和密码是正确的
    // 现在有用户token
    // actions 修改state 必须通过mutations
    context.commit('setToken', result)  //  设置 token
    // 拿到 token 说明登陆成功
    setTimeStamp()  //  设置当前时间戳
  },
  // 获取用户资料action
  async getUserInfo (context) {
    const result = await getUserInfo()  // 获取返回值
    // 获取用户的详情 用户的详情数据
    const baseInfo = await getUserDetailById(result.userId) // 为了获取头像
    context.commit('setUserInfo', {...result, ...baseInfo}) // 将整个的个人信息设置到用户的vuex数据中
    return result // 这里为什么要返回 为后面埋下伏笔
  },
  // 登出操作
  logout(context) {
    // 删除 token
    context.commit('removeToken') // 不仅仅删除了vuex中的 还删除了缓存中的
    // 删除用户资料
    context.commit('removeUserInfo') // 删除用户信息
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

