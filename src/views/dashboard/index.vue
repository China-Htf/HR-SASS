<template>
  <div class="dashboard-container">
    <div class="dashboard-text">name: {{ name }}</div>
    <page-tools :showBefore="true">
      <template v-slot:before>
      <span>我想你们了</span>
      </template>
      <template v-slot:after>
      <el-button type="primary">上传excel表</el-button>
      </template>
    </page-tools>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import PageTools from '@/components/PageTools'

export default {
  name: 'Dashboard',
  components: {
    // PageTools
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
