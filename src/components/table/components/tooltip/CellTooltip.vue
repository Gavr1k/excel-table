<template>
  <div class="tooltip" @mouseover="show" @mouseleave="hide">
    <slot></slot>
    <div v-if="isVisible" class="tooltip-content" :class="positionClass">
        <span>{{ content }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const props = defineProps<{
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}>();

const isVisible = ref<Boolean>(false);
const tooltipPosition = ref('bottom');

const show = () => {
    isVisible.value = true;
};

const hide = () => {
    isVisible.value = false;
};

const positionClass = computed(() => {
    return {
        'tooltip-top': tooltipPosition.value === 'top',
        'tooltip-bottom': tooltipPosition.value === 'bottom',
        'tooltip-left': tooltipPosition.value === 'left',
        'tooltip-right': tooltipPosition.value === 'right',
    };
});

onMounted(() => {
    const tooltip = document.querySelector('.tooltip');
    const tooltipContent = document.querySelector('.tooltip-content');

    if (tooltip && tooltipContent) {
        const tooltipRect = tooltip.getBoundingClientRect();
        const contentRect = tooltipContent.getBoundingClientRect();


        if (tooltipRect.top > contentRect.height) {
            tooltipPosition.value = 'top';
        }
    }
});
</script>

<style scoped lang="scss">
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip-content {
  display: flex;
  flex-wrap: wrap;
  width: 120px;
  word-wrap: break-word;
  white-space: normal;
  visibility: visible;
  background-color: white;
  color: #333;
  text-align: center;
  border-radius: 5px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  opacity: 0.9;
  transition: opacity 0.3s;
}

.tooltip-top {
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
}

.tooltip-bottom {
  top: 125%;
  left: 50%;
  margin-left: -60px;
}

.tooltip-left {
  top: 50%;
  right: 125%;
  margin-top: -15px;
}

.tooltip-right {
  top: 50%;
  left: 125%;
  margin-top: -15px;
}
</style>
