<template>
  <el-button 
    :type="type" 
    :size="size" 
    :disabled="disabled" 
    :loading="loading"
    :round="round"
    @click="$emit('click')"
  >
    <slot />
  </el-button>
</template>

<script setup>
import { defineProps } from 'vue'

// 定义组件属性
const props = defineProps({
  type: {
    type: String,
    default: 'primary' // 默认为主按钮
  },
  size: {
    type: String,
    default: 'default' // 尺寸：large / default / small
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  round: {
    type: Boolean,
    default: false // 是否圆角
  }
})
</script>