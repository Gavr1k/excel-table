import { refreshPageSize, firstPage } from './paging';

import { moveInputSquare } from './inputBox';

import { hashCode, filterGrouping, calSummary, reviseSelectedAfterTableChange, calStickyLeft } from './excelEditor';

export function resetColumn(context: any): void {
  context.fields = [];
  context.tableContent.scrollTo(0, context.tableContent.scrollTop);
  calStickyLeft(context);
}

export function componentTabInto(context: any, e: KeyboardEvent): void {
  if (e.key === 'Tab') {
    const moved = moveInputSquare(context, context.currentRowPos, context.currentColPos);
    if (!moved) {
      moveInputSquare(context, 0, 0);
    }
  }
}

export function reset(context: any): void {
  context.errmsg = {};
  context.redo = [];
  context.showFilteredOnly = true;
  context.showSelectedOnly = false;
  context.columnFilter = {};
  context.sortPos = 0;
  context.sortDir = 0;
  context.inputFind = '';
  context.pageTop = 0;
  context.selected = {};
  context.selectedCount = 0;
  context.prevSelect = -1;
  context.processing = false;
  context.rowIndex = {};
  refresh(context);
}

export function toggleSelectView(context: any, e?: Event): void {
  if (e) e.stopPropagation();
  context.showSelectedOnly = !context.showSelectedOnly;
  firstPage(context);
  refresh(context);
}


export function toggleFilterView(context: any, e?: Event): void {
  if (e) e.stopPropagation();
  context.showFilteredOnly = !context.showFilteredOnly;
  refresh(context);
}


export function registerColumn(context: any, field: any): void {
  let pos = context.fields.findIndex((item: any) => item.pos > field.pos);
  if (pos === -1) pos = context.fields.length;

  context.fields.splice(pos, 0, field);

  if (context.register) context.register(field, pos);
  if (field.register) field.register(field, pos);

  if (field.summary) context.summaryRow = true;

  context.colHash = hashCode(`${context.version}${JSON.stringify(context.fields)}`);
}

export function insertColumn(context: any, pos: number): void {
  const colname = `COL-${Math.random().toString().slice(2, 6)}`;
  let colDef = {
    name: colname,
    label: colname,
    type: 'string',
    width: '100px',

    validate: null,
    change: null,
    link: null,
    sort: null,

    keyField: false,
    sticky: false,
    allowKeys: null,
    mandatory: false,
    lengthLimit: 0,

    autocomplete: context.autocomplete,
    textTransform: null,
    initStyle: { textAlign: 'left' },
    invisible: false,
    readonly: context.readonly,
    pos: 0,
    options: null,
    summary: null,
    toValue: (t: any) => t,
    toText: (t: any) => t,
    register: null
  };

  if (context.addColumn) colDef = context.addColumn(colDef);

  newColumn(context, colDef, pos);
}

export function newColumn(context: any, field: any, pos: number): void {
  context.fields.splice(pos, 0, field);

  if (context.register) context.register(field, pos);
  if (field.register) field.register(field, pos);

  if (field.summary) context.summaryRow = true;

  context.colHash = hashCode(`${context.version}${JSON.stringify(context.fields)}`);
}

function autoRegisterAllColumns(context: any, rows: Record<string, any>[]): void {
  if (!rows.length) return;

  const widths = rows.slice(0, 25)
    .reduce((acc: number[], row) => {
      Object.keys(row).forEach((key, i) => {
        const length = row[key]?.toString().length || 0;
        acc[i] = Math.max(acc[i] || 0, length);
      });
      return acc;
    }, [])
    .map((length) => Math.min(Math.max(length * 8.2, 55), 250));

  Object.keys(rows[0]).forEach((col, i) => {
    if (col === '$id') return;

    registerColumn(context, {
      name: col,
      label: col,
      type: widths[i] ? 'string' : 'number',
      width: `${widths[i] || 75}px`,
      validate: null,
      change: null,
      link: null,
      keyField: false,
      sticky: false,
      tabStop: true,
      allowKeys: null,
      mandatory: false,
      lengthLimit: 0,
      autocomplete: context.autocomplete,
      initStyle: { textAlign: widths[i] ? 'left' : 'right' },
      invisible: false,
      readonly: context.readonly,
      pos: 0,
      options: null,
      summary: null,
      sort: null,
      toValue: (t: any) => t,
      toText: (t: any) => t,
      register: null
    });
  });
}

export function refresh(context: any): void {
  context.prevSelect = -1;

  if (context.fields.length === 0 && context.modelValue.length && Object.keys(context.modelValue[0]).length > 0) {
    autoRegisterAllColumns(context, context.modelValue);
  }

  calTable(context);
  calStickyLeft(context);
  refreshPageSize(context);
}

export function calTable(context: any): void {
  context.textTip = '';
  const seed = String(new Date().getTime() % 1e8);

  context.modelValue.forEach((rec: any, i: number) => {
    if (!rec.$id) rec.$id = `${seed}-${String(i).padStart(7, '0')}`;
  });

  if (context.showFilteredOnly === false) {
    context.table = context.modelValue;
  } else {
    const filterColumnList = Object.keys(context.columnFilter);
    const filter: Record<string, any> = {};

    filterColumnList.forEach((k) => {
      const filterText = context.columnFilter[k];
      const isNumberType = context.fields[k].type === 'number';
      filter[k] = parseFilter(filterText, isNumberType);
    });

    context.filteredValue = context.modelValue
      .filter((record) => context.recordFilter(record))
      .filter((record, i) => filterGrouping(context, record, i, context.modelValue));

    if (filterColumnList.length > 0) {
      context.table = context.filteredValue.filter((record) => applyFilters(context, record, filter, filterColumnList));
    } else {
      context.table = context.filteredValue;
    }
  }

  reviseSelectedAfterTableChange(context);

  if (context.showSelectedOnly) {
    context.table = context.table.filter((rec: any, i: number) => context.selected[i]);
    reviseSelectedAfterTableChange(context);
  }

  calSummary(context);
}


export function renderColumnCellStyle(context: any, field: any, record: any): Record<string, any> {
  let style = typeof field.initStyle === 'function' ? field.initStyle(record, field) : { ...field.initStyle };

  if (field.readonly) {
    style = { ...style, ...context.readonlyStyle };
  }

  if (field.left) {
    style.left = field.left;
  }

  if (record && field.color) {
    style.color = typeof field.color === 'function' ? field.color(record) : field.color;
  }

  return style;
}


function parseFilter(filterText: string, isNumberType: boolean) {
  const filterVal = filterText.trim().toUpperCase();
  switch (true) {
    case filterVal.startsWith('<='):
      return { type: 1, modelValue: isNumberType ? +filterVal.slice(2) : filterVal.slice(2) };
    case filterVal.startsWith('<>'):
      return { type: 9, modelValue: filterVal.slice(2) };
    case filterVal.startsWith('<'):
      return { type: 2, modelValue: isNumberType ? +filterVal.slice(1) : filterVal.slice(1) };
    case filterVal.startsWith('>='):
      return { type: 3, modelValue: isNumberType ? +filterVal.slice(2) : filterVal.slice(2) };
    case filterVal.startsWith('>'):
      return { type: 4, modelValue: isNumberType ? +filterVal.slice(1) : filterVal.slice(1) };
    case filterVal.startsWith('='):
      return { type: 0, modelValue: filterVal.slice(1) };
    case filterVal.startsWith('*') && filterVal.endsWith('*'):
      return { type: 5, modelValue: filterVal.slice(1, -1) };
    case filterVal.startsWith('*'):
      return { type: 6, modelValue: filterVal.slice(1) };
    case filterVal.endsWith('*'):
      return { type: 7, modelValue: filterVal.slice(0, -1) };
    case filterVal.includes('*') || filterVal.includes('?'):
      return { type: 8, modelValue: '^' + filterVal.replace(/\*/g, '.*').replace(/\?/g, '.') + '$' };
    default:
      return { type: 5, modelValue: filterVal };
  }
}

function applyFilters(
  context: any,
  record: any,
  filter: Record<string, any>,
  filterColumnList: string[],
): boolean {
  const content: Record<string, any> = {};
  
  filterColumnList.forEach((k) => {
    const field = context.fields[k];
    const val = record[field.name];
    content[k] = field.type === 'number' && filter[k].type <= 4 ? val : String(val || '').toUpperCase();
  });

  return filterColumnList.every((k) => {
    const { type, modelValue } = filter[k];
    const value = content[k];
    switch (type) {
      case 0: return value === modelValue;
      case 1: return value <= modelValue;
      case 2: return value < modelValue;
      case 3: return value >= modelValue;
      case 4: return value > modelValue;
      case 5: return value.includes(modelValue);
      case 6: return value.endsWith(modelValue);
      case 7: return value.startsWith(modelValue);
      case 8: return new RegExp(modelValue, 'i').test(value);
      case 9: return value !== modelValue;
      default: return true;
    }
  });
}



