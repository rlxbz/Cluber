<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :before-close="handleClose"
    :show-close="showClose"
  >
    <!-- 对话框内容 -->
    <slot name="content" />
    
    <!-- 底部按钮 -->
    <template #footer>
      <slot name="footer">
        <!-- 默认按钮组 -->
        <common-button 
          type="default" 
          @click="handleCancel"
        >
          取消
        </common-button>
        <common-button 
          type="primary" 
          @click="handleConfirm"
        >
          确认
        </common-button>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue'
import CommonButton from '../Button/index.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '提示'
  },
  width: {
    type: String,
    default: '500px'
  },
  showClose: {
    type: Boolean,
    default: true
  }
})

const emits = defineEmits(['update:visible', 'confirm', 'cancel'])
const dialogVisible = ref(props.visible)

// 同步外部visible状态
watch(() => props.visible, (val) => {
  dialogVisible.value = val
})

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  emits('update:visible', false)
}

// 取消按钮
const handleCancel = () => {
  emits('cancel')
  handleClose()
}

// 确认按钮
const handleConfirm = () => {
  emits('confirm')
  handleClose()
}
</script>