export interface TableColumn {
  field: string;
  header: string;
  width?: string;
  textAlign?: 'left' | 'center' | 'right';
  type?: 'text' | 'date' | 'datetime' | 'badge' | 'action';
  editable?: boolean;
  required?: boolean;
  inputType?: 'text' | 'dropdown' | 'date' | 'number';
  options?: any[];
}
