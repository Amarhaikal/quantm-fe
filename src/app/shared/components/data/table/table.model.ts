import { NumericType } from '../../form/numeric/numeric';

export interface TableColumn {
  field: string;
  header: string;
  width?: string;
  textAlign?: 'left' | 'center' | 'right';
  type?: 'text' | 'date' | 'datetime' | 'badge' | 'action' | 'avatarText';
  editable?: boolean;
  required?: boolean;
  inputType?: 'text' | 'dropdown' | 'date' | 'number' | 'numeric';
  options?: any[];
  minlength?: number;
  maxlength?: number;
  sortable?: boolean; // (default: true)
  imageField?: string;
  // Numeric input options
  numericType?: NumericType;
  numericCurrency?: string;
  numericMin?: number;
  numericMax?: number;
  numericMinFractionDigits?: number;
  numericMaxFractionDigits?: number;
}
