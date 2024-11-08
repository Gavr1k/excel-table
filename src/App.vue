<template>
  <div>
      <vue-excel-editor 
        v-model="jsondata"
        :page="1"
        :noPaging="true"
        :noNumCol="false" 
        :filterRow="true"
        :noFooter="true"
        :noFinding="false"
        :noFindingNext="false"
        :freeSelect="true"
        :autocomplete="true"
        :allowAddCol="true"
        :noHeaderEdit="true"
      >
          <vue-excel-column field="user"   label="User ID"       type="string" width="100px" />
          <vue-excel-column field="name"   label="Name"          type="string" width="200px" />
          <vue-excel-column field="phone"  label="Contact"       type="string" width="130px" />
          <vue-excel-column field="gender" label="Gender"        type="select" width="50px" :options="['F','M','U']" />
          <vue-excel-column field="age"    label="Age"           type="number" width="70px" />
          <vue-excel-column field="birth"  label="Date Of Birth" type="date"   width="80px" />
      </vue-excel-editor> 
  </div>
</template>

<script setup lang="ts">
import VueExcelEditor from './components/table/VueExcelEditor.vue';
import VueExcelColumn from './components/table/VueExcelColumn.vue';
import {ref} from 'vue';

const jsondata = ref([
  { user: 'hc', name: 'Harry Cole',    phone: '1-415-2345678', gender: 'M', age: 25, birth: '1997-07-01' },
  { user: 'sm', name: 'Simon Minolta', phone: '1-123-7675682', gender: 'M', age: 20, birth: '1999-11-12' },
  { user: 'ra', name: 'Raymond Atom',  phone: '1-456-9981212', gender: 'M', age: 19, birth: '2000-06-11' },
  { user: 'ag', name: 'Mary George',   phone: '1-556-1245684', gender: 'F', age: 22, birth: '2002-08-01' },
  { user: 'kl', name: 'Kenny Linus',   phone: '1-891-2345685', gender: 'M', age: 29, birth: '1990-09-01' },
  
  { user: 'dj', name: 'Diana Jones',    phone: '1-234-5678901', gender: 'F', age: 24, birth: '1998-04-15' },
  { user: 'bt', name: 'Brian Taylor',   phone: '1-345-6789012', gender: 'M', age: 31, birth: '1988-12-05' },
  { user: 'lw', name: 'Laura White',    phone: '1-456-7890123', gender: 'F', age: 27, birth: '1996-03-22' },
  { user: 'mk', name: 'Michael King',   phone: '1-567-8901234', gender: 'M', age: 34, birth: '1985-07-30' },
  { user: 'ev', name: 'Emma Vance',     phone: '1-678-9012345', gender: 'F', age: 21, birth: '1999-10-10' },
  { user: 'gs', name: 'George Smith',   phone: '1-789-0123456', gender: 'M', age: 28, birth: '1991-05-18' },
  { user: 'lc', name: 'Linda Clark',    phone: '1-890-1234567', gender: 'F', age: 26, birth: '1993-02-08' },
  { user: 'jr', name: 'John Reynolds',  phone: '1-901-2345678', gender: 'M', age: 23, birth: '1997-09-14' },
  { user: 'kp', name: 'Karen Parker',   phone: '1-012-3456789', gender: 'F', age: 30, birth: '1992-11-25' },
  { user: 'th', name: 'Thomas Harris',  phone: '1-123-4567890', gender: 'M', age: 32, birth: '1989-06-19' },
]);
</script>

<style scoped></style>
