<template>
  <div v-if="clubs.length" class="club-grid">
    <ClubCard
      v-for="club in clubs"
      :key="club.id"
      :club="club"
      @click="handleItemClick"
    />
  </div>

  <div v-else class="club-list-empty">
    <el-empty :description="emptyText" />
  </div>
</template>

<script setup>
import ClubCard from "./ClubCard.vue";

defineProps({
  clubs: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: "暂无社团数据",
  },
});

const emit = defineEmits(["item-click"]);

const handleItemClick = (clubId) => {
  emit("item-click", clubId);
};
</script>

<style scoped>
.club-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.club-list-empty {
  padding: 40px 0;
}

@media (max-width: 768px) {
  .club-grid {
    grid-template-columns: 1fr;
  }
}
</style>
