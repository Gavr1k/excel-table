<template>
  <VueExcelEditor 
  :columns="columnsData" 
  :row-data="rowsData"
  :grid-options="gridOptions"
  ></VueExcelEditor>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import VueExcelEditor from './scratch/VueExcelEditor.vue';

const columnsData = ref([
  {
    headerName: "Group 1",
    children: [
      {
        headerName: "Subgroup 1.1",
        children: [
          { headerName: "Name", field: "name" },
          { headerName: "Age", field: "age" }
        ]
      },
      { headerName: "Gender", field: "gender" },
      { headerName: "Gender", field: "gender" },
      { headerName: "Gender", field: "gender" },

    ]
  },
  {
    headerName: "Group 2",
    children: [
      { headerName: "Country", field: "country" },
      {
        headerName: "Subgroup 2.1",
        children: [
          { headerName: "City", field: "city" },
          { headerName: "Street", field: "street" }
        ]
      }
    ]
  }
]);
const rowsData = ref([]);

// { name: "John", age: 25, gender: "Male", country: "USA", city: "New York", street: "5th Ave" },
// { name: "Anna", age: 30, gender: "Female", country: "UK", city: "London", street: "Baker St" }


const gridOptions = ref({
  numCol: false,
  selectable: true,
})
</script>
