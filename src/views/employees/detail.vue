<template>
  <div class="dashboard-container">
    <div class="app-container">
      <el-card>
        <el-tabs>
          <el-tab-pane label="登录账户设置">
            <!-- 放置表单 -->
            <el-form
              :model="userInfo"
              :rules="rules"
              ref="userForm"
              label-width="120px"
              style="margin-left: 120px; margin-top: 30px"
            >
              <el-form-item label="姓名:" prop="username">
                <el-input v-model="userInfo.username" style="width: 300px" />
              </el-form-item>
              <el-form-item label="密码:" prop="password2">
                <el-input
                  v-model="userInfo.password2"
                  style="width: 300px"
                  type="password"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveUser">更新</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="个人详情">
            <el-row type="flex" justify="end">
              <el-tooltip content="打印个人基本信息">
                <router-link :to="`/employees/print/${userId}?type=personal`">
                  <i class="el-icon-printer" />
                </router-link>
              </el-tooltip>
            </el-row>
            <!-- 放置内容 -->
            <!-- <user-info></user-info> -->
            <!-- vue中 内置了一个组件 component 可以是任何组件 -->
            <!-- <el-button type="primary" @click="UserComponent='el-button'">切换组件</el-button>
            <el-button type="primary" @click="UserComponent='UserInfo'">切换组件1</el-button> -->
            <component :is="UserComponent"></component>
            <!-- 动态组件 可以切换组件 is必须是变量-->
          </el-tab-pane>
          <el-tab-pane label="岗位信息">
            <el-row type="flex" justify="end">
              <el-tooltip content="打印岗位信息">
                <router-link :to="`/employees/print/${userId}?type=job`">
                  <i class="el-icon-printer" />
                </router-link>
              </el-tooltip>
            </el-row>
            <!-- 放置岗位详情 -->
            <component :is="JobInfo"></component>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script>
import { getUserDetailById } from "@/api/user";
import { saveUserDetailById } from "@/api/employees";
import UserInfo from "./components/user-info";
import JobInfo from "./components/job-info";
export default {
  components: {
    UserInfo,
  },
  data() {
    return {
      UserComponent: "UserInfo",
      JobInfo,
      userId: this.$route.params.id, //  直接将路由中的参数赋值给 data 中的属性
      userInfo: {
        username: "",
        password2: "", //  因为读取出来的密码是密文 所以取名为 password2
      },
      rules: {
        username: [
          { required: true, message: "姓名不能为空", trigger: "blur" },
        ],
        password2: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          { min: 6, max: 9, message: "密码长度6-9位", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getUserDetailById();
  },
  methods: {
    async getUserDetailById() {
      this.userInfo = await getUserDetailById(this.userId);
    },
    saveUser() {
      // 调用方法时 进行校验
      this.$refs.userForm.validate().then(async () => {
        await saveUserDetailById({
          ...this.userInfo,
          password: this.userInfo.password2,
        });
        this.$message.success("修改密码成功");
      });
    },
  },
};
</script>

<style>
</style>
