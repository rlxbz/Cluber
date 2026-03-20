<template>
  <el-tag :type="statusMeta.type" effect="plain" round>
    {{ statusMeta.text }}
  </el-tag>
</template>

<script setup>
import { computed } from "vue";
import { getApplyStatusMeta } from "@/utils/frontBusiness";

const props = defineProps({
  status: {
    type: String,
    default: "",
  },
});

const statusMeta = computed(() => getApplyStatusMeta(props.status));
</script>
