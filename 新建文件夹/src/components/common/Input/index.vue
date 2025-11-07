<template>
  <el-input
    v-model="inputValue"
    :type="type"
    :placeholder="placeholder"
    @input="handleInput"
    class="common-input"
  />
</template>

<script setup>
import { ref, watch } from 'vue'

// 接收父组件v-model的值
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  }
})

// 定义子组件内部的值
const inputValue = ref(props.modelValue)

// 监听父组件值的变化，同步到子组件
watch(
  () => props.modelValue,
  (newVal) => {
    inputValue.value = newVal
  }
)

// 触发v-model更新（核心修复：传递输入值给父组件）
const emits = defineEmits(['update:modelValue'])
const handleInput = (val) => {
  emits('update:modelValue', val)
}
</script>