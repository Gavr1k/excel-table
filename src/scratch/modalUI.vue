<template>
  <div v-show="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="closeModal">X</button>
      </div>
      <div class="modal-body">
        <slot name="body"></slot>
      </div>
      <div class="modal-footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, defineEmits, watch } from 'vue';

interface ModalProps {
  title?: string;
  modelValue: boolean;
}

const props = defineProps<ModalProps>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'close'): void;
}>();

const isVisible = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
  isVisible.value = newVal;
});

const closeModal = () => {
  emit('update:modelValue', false);
  emit('close');
};

</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  width: 400px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.modal-body {
  margin-bottom: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.cancel-btn {
  background: #ccc;
}

.confirm-btn {
  background: #4caf50;
  color: white;
}

</style>
