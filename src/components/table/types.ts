export interface TableProps {
  modelValue: Array<Record<string, any>>;
  columns: Array<Column>;
  page?: number;
  noPaging?: boolean;
  noNumCol?: boolean;
  filterRow?: boolean;
  noFooter?: boolean;
  noFinding?: boolean;
  noFindingNext?: boolean;
  freeSelect?: boolean;
  autocomplete?: boolean;
  autocompleteCount?: number;
  readonly?: boolean;
  readonlyStyle?: Record<string, any>;
  height?: string;
  width?: string;
  rowStyle?: (row: Record<string, any>) => Record<string, any> | null;
  cellStyle?: (cell: Record<string, any>) => Record<string, any> | null;
  headerLabel?: (fieldLabel: string, field: Record<string, any>) => string;
  recordLabel?: (recordPosition: number, record: Record<string, any>) => string;
  localizedLabel?: Record<string, string>;
  nFilterCount?: number;
  remember?: boolean;
  enterToSouth?: boolean;
  allowAddCol?: boolean;
  addColumn?: () => Record<string, any>;
  noHeaderEdit?: boolean;
  spellcheck?: boolean;
  newIfBottom?: boolean;
  disablePanelSetting?: boolean;
  disablePanelFilter?: boolean;
  noMouseScroll?: boolean;
  noSorting?: boolean;
  noMassUpdate?: boolean;
}

export interface Column {
  field: string;
  label?: string;
  type?: string;
  readonly?: boolean;
  initStyle?: Record<string, any>;
  sticky?: boolean;
  invisible?: boolean;
  width?: string;
  autoFillWidth?: boolean;
  change?: (newValue: any, oldValue: any, row: Record<string, any>) => void;
  validate?: (value: any, row: Record<string, any>) => string | null;
  keyField?: boolean;
  allowKeys?: string[] | ((value: string) => boolean);
  mandatory?: string;
  lengthLimit?: number;
  autocomplete?: boolean;
  pos?: number;
  textTransform?: 'uppercase' | 'lowercase';
  textAlign?: 'left' | 'center' | 'right';
  options?:
    | Array<string | number>
    | ((row: Record<string, any>) => Array<string | number>)
    | Record<string, any>;
  summary?: 'sum' | 'avg' | 'max' | 'min' | null;
  sort?: (a: any, b: any) => number;
  link?: (value: any, row: Record<string, any>) => void;
  isLink?: (value: any) => boolean;
  toText?: (value: any) => string;
  toValue?: (text: string) => any;
  placeholder?: string;
  noSorting?: boolean;
}
