<template>
  <div>
    <el-dialog title="分配角色" :visible="showRoleDialog" @close="btnCancel">
      <el-checkbox-group v-model="roleIds">
        <!-- :label 存储的值 -->
        <el-checkbox v-for="item in list" :key="item.id" :label="item.id">
          {{ item.name }}
        </el-checkbox>
      </el-checkbox-group>
      <el-row type="flex" justify="center">
        <el-col :span="6">
          <el-button size="mini" type="primary" @click="btnOk">确认</el-button>
          <el-button size="mini" @click="btnCancel">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { getRoleList } from "@/api/setting";
import { getUserDetailById } from "@/api/user";
import { assignRoles } from "@/api/employees";
export default {
  props: {
    showRoleDialog: {
      type: Boolean,
      default: false,
    },
    // 用户的 id 用来查看当前用户的角色信息
    userId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      list: [], // 负责存储当前所有角色 id
      roleIds: [], //  负责处理存储 当前用户所拥有的角色 id
    };
  },
  created() {
    this.getRoleList();
  },
  methods: {
    async getRoleList() {
      const { rows } = await getRoleList({ page: 1, pagesize: 20 });
      this.list = rows;
    },
    async getUserDetailById(id) {
      const { roleIds } = await getUserDetailById(id);
      this.roleIds = roleIds;
    },
    async btnOk() {
      await assignRoles({ id: this.userId, roleIds: this.roleIds });
      this.$emit("update:showRoleDialog", false);
      // this.$parent.showRoleDialog = false
    },
    btnCancel() {
      // 重置数组 将它变成一个空
      this.roleIds = []
      this.$emit("update:showRoleDialog", false);
    },
  },
};
</script>

<style>
</style>
