export function setFilter(this: any, name: string, filterText: string): void {
  const filterRef = this.$refs[`filter-${name}`]?.[0];

  if (filterRef) {
    filterRef.$el.textContent = filterText;
    filterRef.$emit('update:modelValue', filterText);
  }
}


export function clearFilter(this: any, name?: string): void {
  if (!name) {
    this.columnFilter = {};
  } else {
    this.setFilter(name, '');
  }
}


export function columnSuppress(this: any): void {
  if (this.table.length === 0) return;

  const visibleColumns: Record<string, boolean> = {};

  // Собираем информацию о видимых колонках на основе значений в таблице
  this.table.forEach((row: Record<string, any>) => {
    Object.keys(row).forEach((field) => {
      if (row[field]) visibleColumns[field] = true;
    });
  });

  // Устанавливаем поле `invisible` для колонок, не имеющих видимых значений
  this.fields.forEach((field: any) => {
    field.invisible = !visibleColumns[field.name];
  });
}


export function columnAutoWidth(this: any, name?: string): void {
  if (this.table.length === 0) return;

  const targetFields = name
    ? [this.fields.find((f: any) => f.name === name)]
    : this.fields;

  const maxColumnWidths: Record<string, number> = {};

  this.table.forEach((row: Record<string, any>) => {
    targetFields.forEach((field: any) => {
      const cellValue = row[field.name];
      if (cellValue && (!maxColumnWidths[field.name] || maxColumnWidths[field.name] < cellValue.length)) {
        maxColumnWidths[field.name] = cellValue.length;
      }
    });
  });

  targetFields.forEach((field: any) => {
    const maxWidth = maxColumnWidths[field.name] ? maxColumnWidths[field.name] * 12 : 0;
    field.width = `${Math.min(maxWidth, 450)}px`; // Ограничиваем ширину до 450px
  });
}


export function columnFillWidth(this: any): void {
  if (this.table.length === 0 || !this.editor) return;

  const adjustableFields = this.fields.filter((f: any) => f.autoFillWidth);
  const adjustableCount = adjustableFields.length;
  if (adjustableCount === 0) return;

  lazy(this, () => {
    const editorWidth = this.editor.getBoundingClientRect().width;
    const visibleWidth = this.fields
      .filter((f: any) => !f.invisible)
      .reduce((total: number, f: any) => total + parseFloat(f.width), this.numColWidth);

    let availableWidth = editorWidth;
    if (this.vScroller.buttonHeight < this.vScroller.height) availableWidth -= 13;

    const widthDifference = visibleWidth - availableWidth + 2;

    if (Math.abs(widthDifference) > 1) {
      adjustableFields.forEach((f: any) => {
        const newWidth = parseFloat(f.width) - widthDifference / adjustableCount;
        f.width = `${Math.max(newWidth, parseFloat(f.origWidth))}px`;
      });
    }
  });
}
