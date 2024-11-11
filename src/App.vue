<template>
  <div class="test">
      <NestedTableWrapper
        :tableData="tableData"
        :columns="columns"
      ></NestedTableWrapper>
  </div>
</template>

<script setup lang="ts">
import NestedTableWrapper from './components/ui/NestedTable.vue';
import { reactive } from 'vue';

import table from './components/ui/conts';

const tableData = reactive(table);

const columns = reactive([
  { field: "calc_type_id", type: "string", label: "Тип расчета", readonly: true, },
  { field: "pra_version_id", type: "string", label: "Версия" },
  { field: "field_id", type: "string", label: "Месторождение" },
  { field: "name", type: "string", label: "Сценарий" },
  { field: "confirmed", type: "string", label: "Утвержденный" },
  { field: "npv_gep", type: "string", label: "NVP ГЭП, млн.руб" },
  { field: "npv", type: "string", label: "NVP, млн.руб" },
  { field: "qn_cumul", type: "string", label: "Нак.нефть, тыс.т." },
  { field: "created_dt", type: "string", label: "Дата создания сценария" },
  { field: "user_id", type: "string", label: "Автор" },
]);
</script>

<style scoped>

.test {
  width: 100%;
}
</style>
