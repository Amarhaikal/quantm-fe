import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  /**
   * Validates the Malaysian ID No. (YYMMDD-SS-NNNN)
   * Consolidates all sub-validations (Date, State, Serial) into a single result.
   */
  static idNoValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      // Sanitize: remove hyphens and underscores (placeholders)
      const sanitized = value.replace(/[-_]/g, '');

      // Only validate if the user has entered something significant
      // But for a full ID No. check, we usually want to wait for 12 digits or check partials
      if (sanitized.length < 6) return null;

      // 1. Validate Date (First 6 digits: YYMMDD)
      const monthStr = sanitized.substring(2, 4);
      const dayStr = sanitized.substring(4, 6);
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);

      if (month < 1 || month > 12) return { invalidIdNo: true };

      let maxDays = 31;
      if (month === 2) {
        maxDays = 29; // Simplified
      } else if ([4, 6, 9, 11].includes(month)) {
        maxDays = 30;
      }
      if (day < 1 || day > maxDays) return { invalidIdNo: true };

      // 2. Validate State Code (Digits 7 and 8)
      if (sanitized.length >= 8) {
        const stateCodeStr = sanitized.substring(6, 8);
        const validStateCodes = [
          '01',
          '21',
          '22',
          '23',
          '24',
          '02',
          '25',
          '26',
          '27',
          '03',
          '28',
          '29',
          '04',
          '30',
          '05',
          '31',
          '59',
          '06',
          '32',
          '33',
          '07',
          '34',
          '35',
          '08',
          '36',
          '37',
          '38',
          '39',
          '09',
          '40',
          '10',
          '41',
          '42',
          '43',
          '44',
          '11',
          '45',
          '46',
          '12',
          '47',
          '48',
          '49',
          '13',
          '50',
          '51',
          '52',
          '53',
          '14',
          '54',
          '55',
          '56',
          '57',
          '15',
          '58',
          '16',
          '71',
          '72',
        ];
        if (!validStateCodes.includes(stateCodeStr)) return { invalidIdNo: true };
      }

      // 3. Validate Serial Number (Digits 9-12)
      if (sanitized.length >= 12) {
        const serialStr = sanitized.substring(8, 12);
        if (!/^\d{4}$/.test(serialStr)) return { invalidIdNo: true };
      }

      return null;
    };
  }
}
