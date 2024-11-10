<template>
  <div class="expansion-panel">
    <div class="expansion-header" @click="togglePanel">
      <div class="header-content">
        <h3 class="title">{{ title }}</h3>
        <span class="icon" :class="{ 'open': isOpen }">▼</span>
      </div>
    </div>
      <div v-if="isOpen" class="expansion-body">
        <slot></slot>
      </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
});

const isOpen = ref(false);

const togglePanel = () => {
  isOpen.value = !isOpen.value;
};
</script>

<style scoped>
.expansion-panel {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.expansion-header {
  padding: 15px;
  background-color: #f9f9f9;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e0e0e0;
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
  padding: 15px;
  background-color: #fff;
}

.expand-enter-active, .expand-leave-active {
  transition: max-height 0.5s ease;
}

.expand-enter, .expand-leave-to {
  max-height: 0;
  overflow: hidden;
}
</style>
