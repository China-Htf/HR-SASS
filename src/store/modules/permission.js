// constantRoutes 引入静态路由模块  asyncRoutes 动态路由模块
import { constantRoutes, asyncRoutes } from "@/router";
const state = {
  // 一开始 肯定拥有静态路由的权限
  routes: constantRoutes // 路由表 表示 当前用户所拥有的所有路由数组
};
const mutations = {
  // 定义修改 routes 的 mutations
  // newRoutes可以认为是 用户登录 通过权限所得到的动态路由的部分
  setRoutes(state, newRoutes) {
    // 下面这么写不对 不是语法不对 是业务不对
    // state.routes = [...state.routes, ...newRoutes]
    // 有一种情况  张三 登录 获取了动态路由 追加到路由上  李四登录 4个动态路由
    state.routes = [...constantRoutes, ...newRoutes]; //  每次都是在静态路由的基础上去加新的路由
  }
};
const actions = {
  // 筛选权限路由
  // 第二个参数为当前用户所拥有的菜单权限
  filterRoutes(context, menus) {
    const routes = [];
    // 筛选出 动态路由中和 menus 能够对应上的路由
    menus.forEach(key => {
      // key 就是标识
      // asyncRoutes 找对象中name属性等于 key 的,如果找不到,说明没有该权限
      routes.push(...asyncRoutes.filter(item => item.name === key)); // 得到的数组 有可能有元素 也有可能为空
    });
    // 得到的routes是所有模块中满足权限要求的路由数组
    // routes 是当前用户所拥有的动态权限
    // actions想修改 state 必须通过 mutations 第一个为mutations的方法名
    context.commit("setRoutes", routes); //  将动态路由提交给mutations
    return routes; // 这里为什么还要return  state数据 是用来 显示左侧菜单用的  return  是给路由addRoutes用的
  }
};
export default {
  namespaced: true,
  state,
  mutations,
  actions
};
