// 权限拦截在路由跳转 导航守卫
import router from "@/router";
import store from "@/store"; // 引入 store 实例
import NProgress from "nprogress"; // 引入一份进度条插件
import "nprogress/nprogress.css"; // 引入进度条样式

// 前置守卫
// 不需要导出 只需要代码执行即可
// next 是前置守卫必须执行的钩子 next 必须执行 否则页面就死了
// next() 放过
// next(false) 终止跳转
// next(地址) 跳转到某地址
const whiteList = ["/login", "/404"];
router.beforeEach(async (to, from, next) => {
  NProgress.start(); // 开启进度条
  if (store.getters.token) {
    // 如果有 token
    if (to.path === "/login") {
      // 如果访问的是登录页
      next("/"); // 跳转到主页
    } else {
      // 只有在放过的时候 才去获取用户资料
      // 如果当前 vuex 中有用户的资料 id 表示已经有资料了 不需要获取了 如果没有id才需要获取
      if (!store.getters.userId) {
        //如果没有id才表示当前用户资料没有获取过
        // async 函数所 return 的内容 用 await 就可以接收到
        const { roles } = await store.dispatch(`user/getUserInfo`);
        console.log("调用用户接口得到的路由", roles.menus);
        // 如果说后续 需要根据用户资料获取数据的话 这里必须改成 同步
        // 筛选可用路由
        // actions 中函数默认是 Promise 对象 调用这个对象 想要获取返回值的话 必须加 await 或者 then
        // actions 是做异步操作的
        const routes = await store.dispatch(
          "permission/filterRoutes",
          roles.menus
        ); //  筛选得到当前用户可用的动态路由
        console.log("筛选后的动态路由表", routes);
        // routes就是筛选得到的动态路由
        // 动态路由 添加到 路由表中 默认的路由表 只有静态路由 没有动态路由
        // addRoutes  必须 用 next(地址) 不能用next()
        router.addRoutes([
          ...routes,
          { path: "*", redirect: "/404", hidden: true }
        ]); // 添加动态路由到路由表  铺路
        // 添加完动态路由之后
        next(to.path); // 相当于跳到对应的地址  相当于多做一次跳转 为什么要多做一次跳转
        // 进门了，但是进门之后我要去的地方的路还没有铺好，直接走，掉坑里，多做一次跳转，再从门外往里进一次，跳转之前 把路铺好，再次进来的时候，路就铺好了
      } else {
        next();
      }
    }
  } else {
    // 没有 token 的情况下
    if (whiteList.indexOf(to.path) > -1) {
      // 表示要去的地址在白名单
      next();
    } else {
      next("/login");
    }
  }
  NProgress.done(); // 手动强制关闭一次  为了解决 手动切换地址时  进度条的不关闭的问题
});
router.afterEach(() => {
  NProgress.done(); // 关闭进度条
});
