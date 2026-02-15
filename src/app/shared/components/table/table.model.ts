export interface TableColumn {
  field: string;
  header: string;
  width?: string;
  type?: 'text' | 'date' | 'badge' | 'action';
}
