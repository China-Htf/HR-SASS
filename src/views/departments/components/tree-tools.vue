<template>
  <el-row type="flex" justify="space-between" align="middle" style="height: 40px;width: 100%">
    <el-col>
      <!-- 名称应该变成 对应的节点中的name -->
      <span>{{ treeNode.name }}</span>
    </el-col>
    <el-col :span="4">
      <el-row type="flex" justify="end">
        <!-- 两个内容 -->
        <el-col>{{ treeNode.manager }}</el-col>
        <el-col>
          <!-- 下拉菜单 element -->
          <el-dropdown @command="operateDepts">
            <span>
              操作<i class="el-icon-arrow-down" />
            </span>
            <!-- 下拉菜单 -->
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="add">添加子部门</el-dropdown-item>
              <el-dropdown-item v-if="isRoot" command="edit">编辑部门</el-dropdown-item>
              <el-dropdown-item v-if="isRoot" command="del">删除部门</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import { delDepartments } from "@/api/departments";
export default {
  props: {
    // 定义一个传入的属性
    treeNode: {
      required: true, // 必须传入
      type: Object, // 类型为 对象
    },
    isRoot: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    // 点击 添加 编辑 删除时触发
    operateDepts(type) {
      if(type === 'add') {
        // 添加子部门
        // 添加子部门 在当前点击的部门下 添加子部门 => this.treeNode就是当前点击的部门
        this.$emit('addDept', this.treeNode) //  触发自定义事件 告诉父组件 显示弹层
      } else if(type === 'edit') {
        // 编辑子部门
        this.$emit('editDepts', this.treeNode)
      } else {
        // 删除子部门
        this.$confirm('确定要删除该部门吗?')
        .then(() => {
          // 如果点击了就会进入 then
          return delDepartments(this.treeNode.id); // 返回 promise 对象
        })
        .then(() => {
          //  如果删除成功了  就会进入这里
          // 后端数据变了，前端还没有变
          this.$emit('delDepts') // 触发自定义事件
          this.$message.success('删除部门成功')
        })
      }
    }
  }
};
</script>

<style>
</style>
