<template>
  <!-- 新增部门的弹层 -->
  <el-dialog :title="showTitle" :visible="showDialog" @close="btnCancel">
    <!-- 表单组件  el-form   label-width设置label的宽度   -->
    <!-- 匿名插槽 -->
    <el-form
      :model="formData"
      :rules="rules"
      label-width="120px"
      ref="deptForm"
    >
      <el-form-item label="部门名称" prop="name">
        <el-input
          v-model="formData.name"
          style="width: 80%"
          placeholder="1-50个字符"
        />
      </el-form-item>
      <el-form-item label="部门编码" prop="code">
        <el-input
          v-model="formData.code"
          style="width: 80%"
          placeholder="1-50个字符"
        />
      </el-form-item>
      <el-form-item label="部门负责人" prop="manager">
        <el-select
          v-model="formData.manager"
          style="width: 80%"
          placeholder="请选择"
          @focus="getEmployeeSimple"
        >
          <!-- 需要循环生成选项   这里做一下简单的处理 显示的是用户名 存的也是用户名-->
          <el-option
            v-for="item in peoples"
            :key="item.id"
            :label="item.username"
            :value="item.username"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="部门介绍" prop="introduce">
        <el-input
          style="width: 80%"
          placeholder="1-300个字符"
          type="textarea"
          :rows="3"
          v-model="formData.introduce"
        />
      </el-form-item>
    </el-form>
    <!-- el-dialog有专门放置底部操作栏的 插槽  具名插槽 -->
    <el-row slot="footer" type="flex" justify="center">
      <!-- 列被分为24 -->
      <el-col :span="6">
        <el-button type="primary" size="small" @click="btnOK">确定</el-button>
        <el-button size="small" @click="btnCancel">取消</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import {
  getDepartments,
  addDepartments,
  getDepartDetail,
  updateDepartments,
} from "@/api/departments";
import { getEmployeeSimple } from "@/api/employees";
export default {
  // 需要传入一个props变量来控制 显示或者隐藏
  props: {
    showDialog: {
      type: Boolean,
      default: false,
    },
    // 当前操作的节点
    treeNode: {
      type: Object,
      default: null,
    },
  },
  data() {
    // 检查部门名称是否重复
    // 现在定义一个函数 这个函数的目的是 去找 同级部门下 是否有重复的部门名称
    // value 是当前输入的部门名称 要去和同级部门下的部门去比较 相同-不能通过 不相同-通过
    const checkNameRepeat = async (rule, value, callback) => {
      // 先要获取最新的组织架构数据
      const { depts } = await getDepartments();
      let isRepeat = false;
      if (this.formData.id) {
        // 有 id 就是编辑模式
        // 编辑的数据 在数据库里有 同级部门下 名字不能与其它同级部门名字进行重复
        // 首先找到我的同级部门 this.formData.id 就是我当前的 id 我的 pid 是 this.formData.pid
        isRepeat = depts
          .filter(
            (item) =>
              item.id !== this.formData.id && item.pid === this.treeNode.pid
          )
          .some((item) => item.name === value);
      } else {
        // depts是所有的部门数据
        // 找到同级部门下所有的子部门 有没有和 value 相同的数据
        isRepeat = depts
          .filter((item) => item.pid === this.treeNode.id)
          .some((item) => item.name === value);
      }
      isRepeat
        ? callback(new Error(`同级部门下已经有${value}的部门了`))
        : callback();
    };
    const checkCodeRepeat = async (rule, value, callback) => {
      const { depts } = await getDepartments();
      let isRepeat = false;
      if (this.formData.id) {
        // 编辑模式下
        // 要求是 不能有一样的 code
        isRepeat = depts
          .filter((item) => item.id !== this.treeNode.id)
          .some((item) => item.code === value && value);
      } else {
        // 新增模式下
        isRepeat = depts.some((item) => item.code === value && value);
      }

      isRepeat
        ? callback(new Error(`组织架构下已经存在${value}的编码了`))
        : callback();
    };
    return {
      // 定义一个表单数据
      formData: {
        name: "", // 部门名称
        code: "", // 部门编码
        manager: "", // 部门管理者
        introduce: "", // 部门介绍
      },
      // 定义校验规则
      rules: {
        name: [
          { required: true, message: "部门名称不能为空", trigger: "blur" },
          {
            min: 1,
            max: 50,
            message: "部门名称要求1-50个字符",
            trigger: "blur",
          },
          {
            trigger: "blur",
            validator: checkNameRepeat, // 自定义函数的形式校验
          },
        ],
        code: [
          { required: true, message: "部门编码不能为空", trigger: "blur" },
          {
            min: 1,
            max: 50,
            message: "部门编码要求1-50个字符",
            trigger: "blur",
          },
          {
            trigger: "blur",
            validator: checkCodeRepeat,
          },
        ],
        manager: [
          { required: true, message: "部门负责人不能为空", trigger: "blur" },
        ],
        introduce: [
          { required: true, message: "部门介绍不能为空", trigger: "blur" },
          {
            trigger: "blur",
            min: 1,
            max: 300,
            message: "部门介绍要求1-50个字符",
          },
        ],
      },
      peoples: [], // 接收获取的员工简单列表的数据
    };
  },
  computed: {
    showTitle() {
      return this.formData.id ? "编辑部门" : "新增子部门";
    },
  },
  methods: {
    // 获取员工简单列表数据
    async getEmployeeSimple() {
      this.peoples = await getEmployeeSimple();
    },
    // 点击确定时触发
    btnOK() {
      // 手动校验表单
      this.$refs.deptForm.validate(async (isOK) => {
        if (isOK) {
          if (this.formData.id) {
            // 编辑
            await updateDepartments(this.formData);
          } else {
            // 添加
            // 表单校验通过
            // 这里把 ID 设置成为 pid
            await addDepartments({ ...this.formData, pid: this.treeNode.id }); // 调用新增接口 添加父部门的id
          }
          // 告诉父组件
          this.$emit("addDepts"); //  触发一个自定义事件
          // 此时去修改 showDialog值
          // 子组件 update:固定写法 (update:props名称, 值)
          this.$emit("update:showDialog", false); //触发事件
          // 关闭 dialog 的时候会触发 el-dialog 的 close 事件 所以这里不再需要单独的重置数据了
        }
      });
    },
    btnCancel() {
      // 重置数据  因为resetFields 只能重置 表单上的数据 非表单上的 比如 编辑中id 不能重置
      this.formData = {
        name: "",
        code: "",
        manager: "",
        introduce: "",
      };
      // 关闭弹层
      this.$emit("update:showDialog", false); //触发事件
      // 清除校验数据
      this.$refs.deptForm.resetFields();
    },
    // 获取部门详情
    async getDepartDetail(id) {
      this.formData = await getDepartDetail(id);
      // 这里不能直接写 this.treeNode.id ，因为 props 传值 是异步的
    },
  },
};
</script>

<style>
</style>
