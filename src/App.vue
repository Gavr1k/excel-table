<template>
  <div class="test">
      <vue-excel-editor 
        v-model="jsondata"
        :page="3"
        :noPaging="true"
        :noNumCol="false"
        :noFooter="true"
      >
          <vue-excel-column field="user"   label="User ID"       type="string" />
          <vue-excel-column field="name"   label="Name"          type="string" />
          <vue-excel-column field="phone"  label="Contact"       type="string" />
          <vue-excel-column field="gender" label="Gender"        type="string"  :options="['F','M','U']" />
          <vue-excel-column field="age"    label="Age"           type="string" />
          <vue-excel-column field="birth"  label="Date Of Birth" type="string"/>
      </vue-excel-editor> 
  </div>
</template>

<!--
:filterRow="true"
:noFinding="false"
:noFindingNext="false"
:freeSelect="true"
:autocomplete="true"
:allowAddCol="true"
:noHeaderEdit="true" -->

<script setup lang="ts">
import VueExcelEditor from './components/table/VueExcelEditor.vue';
import VueExcelColumn from './components/table/VueExcelColumn.vue';
import {ref} from 'vue';

const jsondata = ref([
  { 
    name: {
            value: "2024-10-01",
            anomaly: "",
            isSelected: false
    },
    phone: {
            value: '1-415-2345678',
            anomaly: "",
            isSelected: false
    },
    gender: {
            value: 'M',
            anomaly: "",
            isSelected: false
    },
    age: {
            value: '25',
            anomaly: "",
            isSelected: false
    },
    birth: {
      value: '25',
            anomaly: "",
            isSelected: false
    }
  },
]);
</script>

<style scoped>

.test {
  width: 800px;
}
</style>
