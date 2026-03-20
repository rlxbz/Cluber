<template>
  <div v-if="activities.length" class="activity-list" :class="`activity-list--${layout}`">
    <ActivityItem
      v-for="activity in activities"
      :key="activity.id"
      :activity="activity"
      :variant="variant"
      :show-sign-up-status="showSignUpStatus"
      @click="handleItemClick"
    />
  </div>

  <div v-else class="activity-list-empty">
    <el-empty :description="emptyText" />
  </div>
</template>

<script setup>
import ActivityItem from "./ActivityItem.vue";

const props = defineProps({
  activities: {
    type: Array,
    default: () => [],
  },
  layout: {
    type: String,
    default: "grid",
  },
  variant: {
    type: String,
    default: "default",
  },
  emptyText: {
    type: String,
    default: "暂无活动数据",
  },
  showSignUpStatus: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["item-click"]);

const handleItemClick = (id) => {
  emit("item-click", id);
};
</script>

<style scoped>
.activity-list {
  display: grid;
  gap: 20px;
}

.activity-list--grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.activity-list--list {
  grid-template-columns: 1fr;
}

.activity-list-empty {
  padding: 40px 0;
}

@media (max-width: 768px) {
  .activity-list--grid {
    grid-template-columns: 1fr;
  }
}
</style>
