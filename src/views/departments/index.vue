<template>
  <div class="dashboard-container">
    <div class="app-container">
      <!-- 组织架构内容 头部 -->
      <el-card class="tree-card">
        <!-- 放置结构内容 -->
        <tree-tools
          :tree-node="company"
          :isRoot="false"
          @addDept="addDepts"
        ></tree-tools>
        <!-- 放置树形结构 -->
        <el-tree :data="departs" :props="defaultProps" default-expand-all>
          <!-- 传入内容 插槽内容 会循环多次 有多少节点 就循环多少次 -->
          <!-- 作用域插槽 slot-scope="obj" 接收传递给插槽的数据   data 每个节点的数据对象-->
          <tree-tools
            slot-scope="{ data }"
            @addDept="addDepts"
            :tree-node="data"
            @delDepts="getDepartments"
            @editDepts="editDepts"
          ></tree-tools>
        </el-tree>
      </el-card>
    </div>
    <add-dept
      @addDepts="getDepartments"
      :show-dialog.sync="showDialog"
      :tree-node="node"
      ref="addDept"
    />
  </div>
</template>

<script>
import TreeTools from "./components/tree-tools.vue";
import AddDept from "./components/add-dept"; // 引入新增部门组件
import { getDepartments } from "@/api/departments";
import { tranListToTreeData } from "@/utils";
export default {
  components: { TreeTools, AddDept },
  data() {
    return {
      departs: [],
      defaultProps: {
        label: "name", // 表示 从这个属性显示内容
      },
      company: {},
      showDialog: false, //  默认不显示添加弹层
      node: null,
    };
  },
  created() {
    this.getDepartments(); //  调用自身的方法
  },
  methods: {
    async getDepartments() {
      const result = await getDepartments();
      this.company = { name: result.companyName, manager: "负责人", id: "" };
      this.departs = tranListToTreeData(result.depts, "");
      console.log(result);
    },
    addDepts(node) {
      this.showDialog = true; // 显示弹层
      // 因为node是当前的点击的部门， 此时这个部门应该记录下来,
      this.node = node;
    },
    editDepts(node) {
      this.showDialog = true;
      this.node = node;
      // 我们需要在这个位置 调用子组件的方法
      // 父组件 调用子组件的方法
      this.$refs.addDept.getDepartDetail(node.id); // 直接调用子组件中的方法 传入一个id
      console.log(this.$refs.addDept);
    },
  },
};
</script>

<style scope>
.tree-card {
  padding: 30px 140px;
  font-size: 14px;
}
</style>
