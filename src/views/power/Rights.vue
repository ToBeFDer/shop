<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
<!--    卡片视图-->
    <el-card>
      <template>
        <el-table
          :data="rightsList"
          stripe
          height="600"
          border>
          <el-table-column type="index" label="序号" align="center"></el-table-column>
          <el-table-column label="权限名称" prop="authName" align="center"></el-table-column>
          <el-table-column label="路径" prop="path" align="center"></el-table-column>
          <el-table-column label="权限等级" prop="level" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.level === '0'">一级</el-tag>
              <el-tag v-else-if="scope.row.level === '1'" type="success">二级</el-tag>
              <el-tag type="warning" v-else>三级</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'rights',
  data() {
    return {
      // 权限列表
      rightsList: []
    }
  },
  created() {
    // 获取权限列表
    this.getRightsList()
  },
  methods: {
    // 获取权限列表的方法
    async getRightsList() {
      // 这里不区分树形结构层级结构，只给出一个笼统的列表
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightsList = res.data
    }
  }
}
</script>

<style scoped>
</style>
