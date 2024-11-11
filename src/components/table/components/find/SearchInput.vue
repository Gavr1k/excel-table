<template>
  <div class="panel-input-b">
    <input
      ref="inputField"
      id="inputField"
      type="text"
      v-model="searchQuery"
      class="panel-input"
      trim
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      @keydown.exact.enter="emitSearch"
    />
    <SearchButton @click="emitSearch" />
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';
import SearchButton from './SearchButton.vue';

const emit = defineEmits(['search']);
const searchQuery = ref('');

const emitSearch = () => {
  emit('search', searchQuery.value);
};
</script>

<style scoped lang="scss">
$tableBaseColor: #009639;

.panel-input-b {
  display: flex;
  align-items: center;
  border: 1px solid lightgray;
  border-radius: 4px;
  width: 100%;
  height: 2.3rem;
}

.panel-input {
  border: none;
  padding: 0.6rem;
  width: 100%;
  font-size: 0.88rem;
  background-color: transparent;
}
</style>
