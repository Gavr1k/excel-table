<template>
  <button
    :class="['btn', buttonType, { 'btn-disabled': disabled }]"
    :disabled="disabled"
    @click.stop="$emit('click')"
  >
    <template v-if="icon">
      <i :class="icon" class="btn-icon"></i>
    </template>
    <span class="btn-text"><slot></slot></span>
  </button>
</template>

<script lang="ts" setup>
// баг эмит срабатывает два раза




import { defineProps, computed } from 'vue';

interface ButtonUIProps {
  type?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  icon?: string;
}

const props = defineProps<ButtonUIProps>();

const emit = defineEmits<{'close'}>();

const buttonType = computed(() => {
  return props.type || 'primary';  
});
</script>

<style scoped>
.btn {
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s, transform 0.2s;
}

.btn-primary {
  background-color: #4caf50;
  color: white;
}

.btn-secondary {
  background-color: #ccc;
  color: #333;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.btn-text {
  margin-left: 8px;
}

.btn-icon {
  font-size: 18px;
}

.btn:hover:not(.btn-disabled) {
  transform: scale(1.05);
}
</style>
