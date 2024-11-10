<template>
  <div />
</template>

<script setup lang="ts">
import { defineProps, defineEmits, onMounted, getCurrentInstance, ref, watch } from 'vue';
import { ExcelColumn } from './const/types';

type FieldData = {
  value: any;
  anomaly: boolean;
  isSelected: boolean;
};

type ToValueFunction = (text: string) => FieldData;
type ToTextFunction = (fieldData: FieldData) => string;

interface ExcelColumnProps {
  field: string;
  label?: string | null;
  type: string;
  width?: number;
  autoFillWidth?: boolean;
  validate?: Function;
  change?: Function;
  link?: Function;
  isLink?: Function;
  sort?: boolean;
  sorting?: Function;
  noSorting?: boolean;
  keyField?: boolean;
  sticky?: boolean;
  allowKeys?: string[];
  mandatory?: string;
  lengthLimit?: number;
  textTransform?: 'uppercase' | 'lowercase';
  autocomplete?: boolean;
  initStyle?: Record<string, string | number> | Function;
  invisible?: boolean;
  readonly?: boolean;
  pos?: number;
  options?: Record<string, any> | Function;
  summary?: boolean;
  masking?: string;
  format?: string;
  toValue?: ToValueFunction;
  toText?: ToTextFunction;
  register?: Function;
  placeholder?: string;
  cellClick?: Function;
  listByClick?: boolean;
  color?: string;
  bgcolor?: string;
  hideDuplicate?: boolean;
  grouping?: boolean;
}

const props = defineProps<ExcelColumnProps>();

const instance = getCurrentInstance();
const parent = instance?.proxy;

const uid = `uid${Math.random().toString(36).substr(2, 9)}`;

const _autocomplete = ref<boolean>(false);
const _readonly = ref<boolean>(false);
const _format = ref<string | undefined>(props.format);
const _color = ref<string>('white');
const _bgcolor = ref<string>('blue');
const _listByClick = ref<boolean>(false);

const defaultToValue: ToValueFunction = (text: string) => {
  let transformedText = text;
  if (props.textTransform === 'uppercase') {
    transformedText = text.toUpperCase();
  } else if (props.textTransform === 'lowercase') {
    transformedText = text.toLowerCase();
  }

  let value: any;
  switch (props.type) {
    case 'datetick':
    case 'datetimetick':
    case 'datetimesectick':
      value = new Date(transformedText + ' GMT+0').getTime();
      break;
    case 'check10':
    case 'checkYN':
    case 'checkTF':
      value = transformedText.toUpperCase();
      break;
    case 'map':
      if (typeof props.options === 'function') {
        const list = props.options(transformedText);
        value = Object.keys(list).find(k => list[k] === transformedText);
      } else if (typeof props.options === 'object' && props.options !== null) {
        value = Object.keys(props.options).find(k => (props.options as Record<string, any>)[k] === transformedText);
      } else {
        value = transformedText;
      }
      break;
    default:
      value = transformedText;
      break;
  }

  return {
    value: value,
    anomaly: false,
    isSelected: false
  };
};

const defaultToText: ToTextFunction = (fieldData: FieldData): string => {
  const val = fieldData.value;
  if (props.keyField && val && val.toString().startsWith('§')) return '';
  const offset = new Date().getTimezoneOffset() * 60 * 1000;
  let d: number | undefined;

  switch (props.type) {
    case 'date':
      d = new Date(val).getTime();
      if (!d) return '';
      return new Date(d - offset).toISOString().slice(0, 10);
    case 'datetick':
    case 'datetimetick':
    case 'datetimesectick':
      d = new Date(val * 1 ? val * 1 : val).getTime();
      if (!d) return '';
      if (props.type === 'datetick') {
        return new Date(d - offset).toISOString().slice(0, 10);
      } else if (props.type === 'datetimetick') {
        return new Date(d - offset).toISOString().replace('T', ' ').slice(0, 16);
      } else { // datetimesectick
        return new Date(d - offset).toISOString().replace('T', ' ').slice(0, 19);
      }
    case 'map':
      if (typeof props.options === 'function') {
        const optionsResult = props.options(val);
        return optionsResult[val] ?? val;
      } else if (typeof props.options === 'object' && props.options !== null) {
        return (props.options as Record<string, any>)[val] ?? val;
      }
      return val;
    case 'password':
      return props.masking.repeat(fieldData.value?.toString().length || 0);
    case 'action':
      return '';
    case 'badge':
      if (props.bgcolor) {
        const bgcolor = typeof props.bgcolor === 'function' ? props.bgcolor(val) : props.bgcolor;
        return `<span class='badge' style='background-color:${bgcolor}'>${val}</span>`;
      } else {
        return `<span class='badge'>${val}</span>`;
      }
    default:
      return val;
  }
};

// Назначение функций toValue и toText, если они не предоставлены
const toValue: ToValueFunction = props.toValue ?? defaultToValue;
const toText: ToTextFunction = props.toText ?? defaultToText;

// Функция инициализации
const init = () => {
  let style: Record<string, string | number> = {};

  if (typeof props.initStyle === 'function') {
    style = props.initStyle();
  } else if (typeof props.initStyle === 'object' && props.initStyle !== null) {
    style = props.initStyle as Record<string, string | number>;
  }

  let validate = props.validate;
  let allowKeys = props.allowKeys;
  let lengthLimit = props.lengthLimit;

  switch (props.type) {
    case 'number':
      style.textAlign = 'right';
      allowKeys = allowKeys || ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '-'];
      break;
    case 'date':
      allowKeys = allowKeys || ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-'];
      break;
    case 'datetime':
    case 'datetick':
    case 'datetimetick':
    case 'datetimesectick':
      allowKeys = allowKeys || ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', ' ', ':'];
      break;
    case 'check10':
      style.textAlign = 'center';
      style.textTransform = 'uppercase';
      allowKeys = allowKeys || ['0', '1'];
      lengthLimit = lengthLimit || 1;
      break;
    case 'checkYN':
      style.textAlign = 'center';
      style.textTransform = 'uppercase';
      allowKeys = allowKeys || ['Y', 'N'];
      lengthLimit = lengthLimit || 1;
      break;
    case 'checkTF':
      style.textAlign = 'center';
      style.textTransform = 'uppercase';
      allowKeys = allowKeys || ['T', 'F'];
      lengthLimit = lengthLimit || 1;
      break;
    case 'map':
      if (props.options && props.options.constructor.name === 'AsyncFunction') {
        throw new Error('VueExcelColumn: Map does not support Async Function');
      }
      break;
    case 'select':
    case 'string':
    case 'password':
      break;
    case 'action':
      _listByClick.value = true;
      break;
    case 'badge':
      _color.value = 'white';
      _bgcolor.value = 'blue';
      _format.value = 'html';
      style.textAlign = 'center';
      break;
    default:
      throw new Error(`VueExcelColumn: Not supported type: ${props.type}`);
  }

  if (props.textTransform) {
    style.textTransform = props.textTransform;
  }
  if (props.textAlign) {
    style.textAlign = props.textAlign;
  }

  // Обновление внутренних состояний
  _autocomplete.value = props.autocomplete ?? (props.type === 'action');
  _readonly.value = props.readonly ?? false;

  // Регистрация столбца в родительском компоненте
  if (parent && typeof parent.registerColumnWrapper === 'function') {
    parent.registerColumnWrapper({
      name: props.field,
      label: props.label === null ? props.field : props.label,
      type: props.type,
      width: props.width,
      origWidth: props.width,
      autoFillWidth: props.autoFillWidth,

      validate: validate,
      change: props.change,
      link: props.link,
      isLink: props.isLink ? props.isLink : (props.link ? () => true : null),
      sort: props.sort,
      sorting: props.sorting,
      noSorting: props.noSorting !== null ? props.noSorting : parent.noSorting,

      keyField: props.keyField,
      sticky: props.sticky,
      allowKeys: allowKeys,
      mandatory: props.mandatory,
      lengthLimit: Number(lengthLimit),
      textTransform: props.textTransform,

      get autocomplete() {
        if (props.type === 'map' || props.type === 'select') return true;
        if (props.type === 'password') return false;
        return _autocomplete.value === null ? parent.autocomplete : _autocomplete.value;
      },
      set autocomplete(val: boolean) {
        _autocomplete.value = val;
      },
      initStyle: style,
      invisible: props.invisible,
      get readonly() {
        if (props.link) return true;
        if (props.type === 'action') return false;
        return _readonly.value === null ? parent.readonly : _readonly.value;
      },
      set readonly(val: boolean) {
        _readonly.value = val;
      },
      pos: Number(props.pos),
      options: props.options,
      summary: props.summary,
      masking: props.masking,
      format: _format.value ?? props.format,
      toValue: toValue, // Теперь toValue возвращает объект
      toText: (...args: any[]) => {
        const fieldData: FieldData = args[0];
        const result = toText(fieldData);
        if (props.placeholder && result === '') return props.placeholder;
        return result;
      },
      register: props.register,
      placeholder: props.placeholder,
      cellClick: props.cellClick,
      listByClick: props.listByClick ?? _listByClick.value,
      color: props.color ?? _color.value,
      bgcolor: props.bgcolor ?? _bgcolor.value,
      hideDuplicate: props.hideDuplicate ?? props.grouping,
      grouping: props.grouping,
    });
  }
};

onMounted(() => {
  init();
});
</script>

<style scoped></style>
