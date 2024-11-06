export function findPageTop(context: any, rowPos: number): number {
  for (let pt = context.pageTop; pt < context.table.length; pt += context.pageSize) {
    if (rowPos >= pt && rowPos < pt + context.pageSize) {
      return pt;
    }
  }

  for (let pt = context.pageTop; pt > 0; pt -= context.pageSize) {
    if (rowPos >= pt && rowPos < pt + context.pageSize) {
      return pt;
    }
  }

  return context.pageTop;
}

/* TODO
moveInputSquare
*/

export function doFind(context: any, searchString?: string): boolean {
  searchString = (searchString ?? context.inputFind).toUpperCase();
  context.inputFind = searchString;

  const startRow = Math.max(0, context.currentRowPos);

  for (let r = startRow + context.pageTop; r < context.table.length; r++) {
    const record = context.table[r];

    for (let c = (r === startRow + context.pageTop ? context.currentColPos + 1 : 0); c < context.fields.length; c++) {
      const fieldName = context.fields[c].name;

      if (record[fieldName] !== undefined && String(record[fieldName]).toUpperCase().includes(searchString)) {
        context.pageTop = findPageTop(context, r);
        
        setTimeout(() => {
          context.moveInputSquare(r - context.pageTop, c);
          setTimeout(() => context.inputBox.focus(), 0);
          context.focused = true;
        }, 0);

        return true;
      }
    }
  }

  for (let r = 0; r <= startRow + context.pageTop; r++) {
    const record = context.table[r];

    for (let c = 0; c < (r === startRow + context.pageTop ? context.currentColPos : context.fields.length); c++) {
      const fieldName = context.fields[c].name;

      if (record[fieldName] !== undefined && String(record[fieldName]).toUpperCase().includes(searchString)) {
        context.pageTop = findPageTop(context, r);
        context.moveInputSquare(r - context.pageTop, c);

        setTimeout(() => {
          context.focused = true;
        }, 0);

        return true;
      }
    }
  }

  return false;
}
