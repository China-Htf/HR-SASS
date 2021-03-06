<template>
  <div class="dashboard-container">
    <div class="app-container">
      <page-tools :show-before="true">
        <span slot="before">共{{ page.total }}条数据</span>
        <template slot="after">
          <el-button
            size="small"
            type="warning"
            @click="$router.push('/import')"
            >excel导入</el-button
          >
          <el-button size="small" type="danger" @click="exportData"
            >excel导出</el-button
          >
          <el-button size="small" type="primary" @click="showDialog = true"
            >新增员工</el-button
          >
        </template>
      </page-tools>
      <!-- 放置表格和分页 -->
      <el-card>
        <el-table border :data="list" v-loading="loading">
          <el-table-column label="序号" sortable="" type="index" />
          <el-table-column label="姓名" sortable="" prop="username" />
          <el-table-column label="头像" align="center">
            <template slot-scope="{ row }">
              <img
                slot="reference"
                v-imagerror="require('@/assets/common/bigUserHeader.png')"
                :src="row.staffPhoto"
                style="
                  border-radius: 50%;
                  width: 100px;
                  height: 100px;
                  padding: 10px;
                "
                alt=""
                @click="showQrCode(row.staffPhoto)"
              />
            </template>
          </el-table-column>
          <el-table-column label="手机号" sortable="" prop="mobile" />
          <el-table-column label="工号" sortable="" prop="workNumber" />
          <el-table-column
            label="聘用形式"
            sortable=""
            prop="formOfEmployment"
            :formatter="formatEmployment"
          />
          <el-table-column label="部门" sortable="" prop="departmentName" />
          <!-- 作用域插槽来做 + 过滤器 -->
          <el-table-column label="入职时间" sortable="" align="center">
            <!-- 作用域插槽 -->
            <template slot-scope="{ row }">
              <!-- 将时间进行格式化 -->
              {{ row.timeOfEntry | formatDate }}
            </template>
          </el-table-column>
          <el-table-column label="账户状态" sortable="" prop="enableState">
            <template slot-scope="{ row }">
              <el-switch :value="row.enableState === 1"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" sortable="" fixed="right" width="280">
            <template v-slot="{ row }">
              <el-button
                type="text"
                size="small"
                @click="$router.push(`/employees/detail/${row.id}`)"
                >查看</el-button
              >
              <el-button type="text" size="small">转正</el-button>
              <el-button type="text" size="small">调岗</el-button>
              <el-button type="text" size="small">离职</el-button>
              <el-button type="text" size="small" @click="editRole(row.id)"
                >角色</el-button
              >
              <el-button
                type="text"
                size="small"
                @click="deleteEmployee(row.id)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <el-row
          type="flex"
          justify="center"
          align="middle"
          style="height: 60px"
        >
          <el-pagination
            layout="prev, pager, next"
            :page-size="page.size"
            :current-page="page.page"
            :total="this.page.total"
            @current-change="changePage"
          />
        </el-row>
      </el-card>
      <!-- 放置新增组件弹层 -->
      <!-- sync修饰符 是 子组件 去改变 父组件 数据的一个语法糖 -->
      <add-employe :showDialog.sync="showDialog"></add-employe>
      <el-dialog title="二维码" :visible.sync="showCodeDialog">
        <el-row type="flex" justify="center">
          <canvas ref="myCanvas"></canvas>
        </el-row>
      </el-dialog>
      <assign-role
        ref="assignRole"
        :showRoleDialog.sync="showRoleDialog"
        :userId="userId"
      ></assign-role>
    </div>
  </div>
</template>

<script>
import { getEmployeeList, delEmployee } from "@/api/employees";
import EmployeeEnum from "@/api/constant/employees"; //  引入员工的枚举对象
import AddEmploye from "./components/add-employee";
// 在js中没办法用 | 处理时间，所以我们导入处理时间的方法
import { formatDate } from "@/filters";
import QrCode from "qrcode";
import AssignRole from "./components/assign-role";
export default {
  components: {
    AddEmploye,
    AssignRole,
  },
  data() {
    return {
      loading: false,
      list: [], //  接收返回的数据
      page: {
        page: 1,
        size: 10,
        total: 0,
      },
      showDialog: false,
      showCodeDialog: false, //显示二维码弹层
      showRoleDialog: false, //  控制弹窗的显示与隐藏
      userId: null,
    };
  },
  created() {
    this.getEmployeeList();
  },
  methods: {
    async getEmployeeList() {
      this.loading = true;
      const { total, rows } = await getEmployeeList(this.page);
      this.list = rows;
      this.page.total = total;
      this.loading = false;
    },
    // 格式化聘用形式
    formatEmployment(row, column, cellValue, index) {
      // 要去找 1所对应的值
      const obj = EmployeeEnum.hireType.find((item) => item.id === cellValue);
      return obj ? obj.value : "未知";
    },
    changePage(newPage) {
      this.page.page = newPage;
      this.getEmployeeList();
    },
    // 删除员工
    async deleteEmployee(id) {
      try {
        await this.$confirm("您确定要删除该员工吗？");
        await delEmployee(id);
        this.getEmployeeList();
      } catch (error) {
        console.log(error);
      }
    },
    // excel 导出
    exportData() {
      const headers = {
        手机号: "mobile",
        姓名: "username",
        入职日期: "timeOfEntry",
        聘用形式: "formOfEmployment",
        转正日期: "correctionTime",
        工号: "workNumber",
        部门: "departmentName",
      };
      // 导出 excel
      import("@/vendor/Export2Excel").then(async (excel) => {
        const { rows } = await getEmployeeList({
          page: 1,
          size: this.page.total,
        });
        const data = this.formatJson(headers, rows); // 返回的data就是 要导出的结构
        const multiHeader = [["姓名", "主要信息", "", "", "", "", "部门"]];
        const merges = ["A1:A2", "B1:F1", "G1:G2"];

        excel.export_json_to_excel({
          header: Object.keys(headers),
          data,
          filename: "员工资料表",
          multiHeader, // 复杂表头
          merges, // 合并选项
        });
        /*
        例如
        header: ['性名','工资'], //表头 必填
        data, [['张三',3000],['李四',5000]]//具体数据 必填
        filename: "excel-list", //非必填
        autoWidth: true, //非必填
        bookType: "xlsx", //非必填
        */

        // 所以我们要转化数据。并且数据结构还要和表头的顺序对应上
        // excel.export_json_to_excel({
        //   header: tHeader, //表头 必填
        //   data, //具体数据 必填
        //   filename: "excel-list", //非必填
        //   autoWidth: true, //非必填
        //   bookType: "xlsx", //非必填
        // });
      });
    },
    // 该方法负责将数组转化成二维数组
    formatJson(headers, rows) {
      return rows.map((item) => {
        // item是一个对象  { mobile: 132111,username: '张三'  }
        // ["手机号", "姓名", "入职日期" 。。]
        return Object.keys(headers).map((key) => {
          // 需要判断 字段
          if (
            headers[key] === "timeOfEntry" ||
            headers[key] === "correctionTime"
          ) {
            // 格式化日期
            return formatDate(item[headers[key]]);
          } else if (headers[key] === "formOfEmployment") {
            const obj = EmployeeEnum.hireType.find(
              (obj) => obj.id === item[headers[key]]
            );
            return obj ? obj.value : "未知";
          }
          return item[headers[key]];
        });
        // ["132", '张三’， ‘’，‘’，‘’d]
      });
      // return rows.map(item => Object.keys(headers).map(key => item[headers[key]]))
      // 需要处理时间格式问题
    },
    showQrCode(url) {
      // url存在的情况下 才弹出层
      if (url) {
        this.showCodeDialog = true; // 数据更新了 但是我的弹层会立刻出现吗 ？页面的渲染是异步的！！！！
        // 有一个方法可以在上一次数据更新完毕，页面渲染完毕之后
        this.$nextTick(() => {
          // 此时可以确认已经有ref对象了
          QrCode.toCanvas(this.$refs.myCanvas, url); // 将地址转化成二维码
          // 如果转化的二维码后面信息 是一个地址的话 就会跳转到该地址 如果不是地址就会显示内容
        });
      } else {
        this.$message.warning("该用户还未上传头像");
      }
    },
    async editRole(id) {
      this.userId = id; // props赋值 props赋值渲染时异步的
      // 调用子组件方法
      await this.$refs.assignRole.getUserDetailById(id);
      this.showRoleDialog = true;
    },
  },
};
</script>

<style>
</style>
