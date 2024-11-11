export interface LocalizedLabel {
  footerLeft: (top: number, bottom: number, total: number) => string;
  first: string;
  previous: string;
  next: string;
  last: string;
  footerRight: {
    selected: string;
    filtered: string;
    loaded: string;
  };
  processing: string;
  tableSetting: string;
  exportExcel: string;
  importExcel: string;
  back: string;
  reset: string;
  sortingAndFiltering: string;
  sortAscending: string;
  sortDescending: string;
  near: string;
  exactMatch: string;
  notMatch: string;
  greaterThan: string;
  greaterThanOrEqualTo: string;
  lessThan: string;
  lessThanOrEqualTo: string;
  regularExpression: string;
  customFilter: string;
  listFirstNValuesOnly: (n: number) => string;
  apply: string;
  noRecordIsRead: string;
  readonlyColumnDetected: string;
  columnHasValidationError: (name: string, err: string) => string;
  rowHasValidationError: (row: number, name: string, err: string) => string;
  noMatchedColumnName: string;
  invalidInputValue: string;
  missingKeyColumn: string;
  noRecordIndicator: string;
}

export const defaultLocalizedLabel: LocalizedLabel = {
  footerLeft: (top, bottom, total) => `Record ${top} to ${bottom} of ${total}`,
  first: 'First',
  previous: 'Previous',
  next: 'Next',
  last: 'Last',
  footerRight: {
    selected: 'Selected:',
    filtered: 'Filtered:',
    loaded: 'Loaded:'
  },
  processing: 'Processing',
  tableSetting: 'Table Setting',
  exportExcel: 'Export Excel',
  importExcel: 'Import Excel',
  back: 'Back',
  reset: 'Default',
  sortingAndFiltering: 'Sorting And Filtering',
  sortAscending: 'Sort Ascending',
  sortDescending: 'Sort Descending',
  near: '≒ Near',
  exactMatch: '= Exact Match',
  notMatch: '≠ Not Match',
  greaterThan: '&gt; Greater Than',
  greaterThanOrEqualTo: '≥ Greater Than or Equal To',
  lessThan: '&lt; Less Than',
  lessThanOrEqualTo: '≤ Less Than Or Equal To',
  regularExpression: '~ Regular Expression',
  customFilter: 'Custom Filter',
  listFirstNValuesOnly: n => `List first ${n} values only`,
  apply: 'Apply',
  noRecordIsRead: 'No record is read',
  readonlyColumnDetected: 'Readonly column detected',
  columnHasValidationError: (name, err) => `Column ${name} has validation error: ${err}`,
  rowHasValidationError: (row, name, err) => `Row ${row} has validation error for column ${name}: ${err}`,
  noMatchedColumnName: 'No matched column name',
  invalidInputValue: 'Invalid input value',
  missingKeyColumn: 'Missing key column',
  noRecordIndicator: 'No record'
};
