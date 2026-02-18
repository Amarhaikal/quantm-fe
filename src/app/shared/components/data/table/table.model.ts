export interface TableColumn {
  field: string;
  header: string;
  width?: string;
  textAlign?: 'left' | 'center' | 'right';
  type?: 'text' | 'date' | 'datetime' | 'badge' | 'action';
  editable?: boolean;
  inputType?: 'text' | 'dropdown' | 'date' | 'number';
  options?: any[];
}
