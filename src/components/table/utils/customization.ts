import { lazy } from './excelEditor';

export function setFilter(context: any, name: string, filterText: string): void {
  const filterRef = context.$refs[`filter-${name}`]?.[0];

  if (filterRef) {
    filterRef.$el.textContent = filterText;
    filterRef.$emit('update:modelValue', filterText);
  }
}

export function clearFilter(context: any, name?: string): void {
  if (!name) {
    context.columnFilter = {};
  } else {
    setFilter(context, name, '');
  }
}

export function columnSuppress(context: any): void {
  if (context.table.length === 0) return;

  const visibleColumns: Record<string, boolean> = {};

  context.table.forEach((row: Record<string, any>) => {
    Object.keys(row).forEach((field) => {
      if (row[field]) visibleColumns[field] = true;
    });
  });

  context.fields.forEach((field: any) => {
    field.invisible = !visibleColumns[field.name];
  });
}

export function columnAutoWidth(context: any, name?: string): void {
  if (context.table.length === 0) return;

  const targetFields = name
    ? [context.fields.find((f: any) => f.name === name)]
    : context.fields;

  const maxColumnWidths: Record<string, number> = {};

  context.table.forEach((row: Record<string, any>) => {
    targetFields.forEach((field: any) => {
      const cellValue = row[field.name];
      if (cellValue && (!maxColumnWidths[field.name] || maxColumnWidths[field.name] < cellValue.length)) {
        maxColumnWidths[field.name] = cellValue.length;
      }
    });
  });

  targetFields.forEach((field: any) => {
    const maxWidth = maxColumnWidths[field.name] ? maxColumnWidths[field.name] * 12 : 0;
    field.width = `${Math.min(maxWidth, 450)}px`;
  });
}

export function columnFillWidth(context: any): void {
  if (context.table.length === 0 || !context.editor) return;

  const adjustableFields = context.fields.filter((f: any) => f.autoFillWidth);
  const adjustableCount = adjustableFields.length;
  if (adjustableCount === 0) return;

  lazy(context, () => {
    const editorWidth = context.editor.getBoundingClientRect().width;
    const visibleWidth = context.fields
      .filter((f: any) => !f.invisible)
      .reduce((total: number, f: any) => total + parseFloat(f.width), context.numColWidth);

    let availableWidth = editorWidth;
    if (context.vScroller.buttonHeight < context.vScroller.height) availableWidth -= 13;

    const widthDifference = visibleWidth - availableWidth + 2;

    if (Math.abs(widthDifference) > 1) {
      adjustableFields.forEach((f: any) => {
        const newWidth = parseFloat(f.width) - widthDifference / adjustableCount;
        f.width = `${Math.max(newWidth, parseFloat(f.origWidth))}px`;
      });
    }
  });
}
