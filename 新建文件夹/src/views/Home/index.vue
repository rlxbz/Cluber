<!-- src/views/Home/index.vue -->
<template>
  <div class="home-content">
    <!-- 新增轮播图 -->
    <el-carousel height="300px" class="home-carousel mb-20">
      <el-carousel-item v-for="item in 3" :key="item">
        <div class="carousel-item">
          <img :src="`/carousel-${item}.jpg`" alt="轮播图" class="carousel-img" />
        </div>
      </el-carousel-item>
    </el-carousel>

    <div class="home-content-grid">
      <!-- 公告列表 -->
      <div class="notice">
        <HomeNotice />
        <HomePush />
        <HomeActivity />
      </div>
    </div>
  </div>
</template>

<script setup>
// 新增组件
import HomeNotice from "./components/HomeNotice.vue";
import HomePush from "./components/HomePush.vue"; // 引入推送组件
import HomeActivity from "./components/HomeActivity.vue";
</script>

<style scoped>
/* 保留原有样式 */

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.home-content {
  min-height: 300px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

/* 新增样式 */
.home-carousel {
  width: 100%;
}

.carousel-item {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.home-content-grid {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.notice {
  flex: 1;
}

/* 响应式适配（保留原有逻辑的适配） */
@media (max-width: 768px) {
  .home-content-grid {
    flex-direction: column;
  }

  .home-carousel {
    height: 200px;
  }

  .entry-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
