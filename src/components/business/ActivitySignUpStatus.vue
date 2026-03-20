<template>
  <el-tag :type="statusMeta.type" effect="plain" round class="activity-sign-up-status">
    {{ statusMeta.text }}
  </el-tag>
</template>

<script setup>
import { computed } from "vue";
import { getActivitySignupStatusMeta } from "@/utils/frontBusiness";

const props = defineProps({
  activity: {
    type: Object,
    default: () => ({}),
  },
});

const statusMeta = computed(() => getActivitySignupStatusMeta(props.activity));
</script>

<style scoped>
.activity-sign-up-status {
  flex-shrink: 0;
}
</style>
