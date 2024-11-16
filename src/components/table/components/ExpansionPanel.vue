<template>
  <div class="expansion-panel">
    <div class="expansion-header" @click="togglePanel">
      <div class="header-content">
        <h3 class="title">{{ title }}</h3>
        <span class="icon" :class="{ 'open': isOpen }">▼</span>
      </div>
    </div>
    <transition name="expand">
      <div v-show="isOpen" class="expansion-body">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:show']);

const isOpen = ref(props.show);

const togglePanel = () => {
  isOpen.value = !isOpen.value;
  emitUpdate();
};

watch(() => props.show, (newVal) => {
  isOpen.value = newVal;
});

const emitUpdate = () => {
  emit('update:show', isOpen.value);
};
</script>

<style scoped>
.expansion-panel {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.expansion-header {
  padding: 16px;
  background-color: #f9f9f9;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.expansion-header:hover {
  background-color: #f1f1f1;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.icon {
  transition: transform 0.3s ease;
  font-size: 16px;
}

.icon.open {
  transform: rotate(180deg);
}

.expansion-body {
  background-color: #fff;
  overflow: hidden;
}

.expand-enter-active, .expand-leave-active {
  transition: max-height 0.5s ease, opacity 0.5s ease;
}

.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to, .expand-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>
