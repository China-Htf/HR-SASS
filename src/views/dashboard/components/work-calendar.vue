<template>
  <!-- 工作日历 -->
  <div>
    <!-- 年和月 -->
    <el-row type="flex" justify="end">
      <!-- 年 用组件给定一个日期 日期获取年 年取前五年+后五年 -->
      <el-select
        @change="dateChange"
        v-model="currentYear"
        size="small"
        style="width: 120px"
      >
        <el-option
          v-for="item in yearList"
          :key="item"
          :label="item"
          :value="item"
        ></el-option>
      </el-select>
      <el-select
        @change="dateChange"
        v-model="currentMonth"
        size="small"
        style="width: 120px; margin-left: 10px"
      >
        <el-option v-for="item in 12" :key="item" :label="item" :value="item">{{
          item
        }}</el-option>
      </el-select>
    </el-row>
    <!-- 放置一个日历组件 -->
    <el-calendar v-model="currentDate">
      <!-- date 是当前单元格的日期 data 是对象 对象里又要显示的 day -->
      <template v-slot:dateCell="{ date, data }" class="content">
        <div class="date-content">
          <span class="text"> {{ data.day | getDay }}</span>
          <span v-if="isWeek(date)" class="rest">休</span>
        </div>
      </template>
    </el-calendar>
  </div>
</template>

<script>
export default {
  props: {
    startDate: {
      type: Date,
      // 回调函数式的返回值
      default: () => new Date(),
    },
  },
  filters: {
    getDay(value) {
      const day = value.split("-")[2];
      return day.startsWith("0") ? day.substr(1) : day;
    },
  },
  data() {
    return {
      yearList: [], //  要遍历的年的数组
      currentYear: null, // 当前年份
      currentMonth: null, // 当前月份
      currentDate: null,
    };
  },
  created() {
    // 获取当前年份
    this.currentYear = this.startDate.getFullYear(); //  得到当前年份
    this.currentMonth = this.startDate.getMonth() + 1; //  当前月份
    // 快速生成数组的方法
    this.yearList = Array.from(Array(11), (v, i) => this.currentYear + i - 5);
    // 钩子函数执行完成之后
    this.dateChange(); //  主动调用一下方法
  },
  methods: {
    // 年月份改变之后
    dateChange() {
      this.currentDate = new Date(`${this.currentYear}-${this.currentMonth}-1`); // 以当前月的1号为起始
    },
    // 是否是休息日
    isWeek(value) {
      return value.getDay() === 6 || value.getDay() === 0;
    },
  },
};
</script>
<style  scoped>
/deep/ .el-calendar-day {
  height: auto;
}
/deep/ .el-calendar-table__row td,
/deep/ .el-calendar-table tr td:first-child,
/deep/ .el-calendar-table__row td.prev {
  border: none;
}
.date-content {
  height: 40px;
  text-align: center;
  line-height: 40px;
  font-size: 14px;
}
.date-content .rest {
  color: #fff;
  border-radius: 50%;
  background: rgb(250, 124, 77);
  width: 20px;
  height: 20px;
  line-height: 20px;
  display: inline-block;
  font-size: 12px;
  margin-left: 10px;
}
.date-content .text {
  width: 20px;
  height: 20px;
  line-height: 20px;
  display: inline-block;
}
/deep/ .el-calendar-table td.is-selected .text {
  background: #409eff;
  color: #fff;
  border-radius: 50%;
}
/deep/ .el-calendar__header {
  display: none;
}
</style>
