<template>
  <footer class="app-footer">
    <div class="footer-container container">
      <p>© 2023 Cluber 社团管理系统 - 版权所有</p>
    </div>
  </footer>
</template>

<script setup>
// 页脚组件逻辑
</script>

<style scoped>
.app-footer {
  height: 60px;
  background-color: var(--bg-color);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-container {
  text-align: center;
  color: var(--text-light-color);
  font-size: 14px;
}
</style>