import { errors } from '@vinejs/vine';
// import { FieldContext, ErrorReporterContract } from '@vinejs/vine/types';

export class CustomErrorReporter {
  hasErrors = false;
  errors = {};
  /**
   * VineJS call the report method
   */
  report(message, rule, field, meta) {
    this.hasErrors = true;

    /**
     * Collecting errors as per the JSONAPI spec
     */
    this.errors[field.wildCardPath] = message;
  }

  /**
   * Creates and returns an instance of the
   * ValidationError class
   */
  createError() {
    return new errors.E_VALIDATION_ERROR(this.errors);
  }
}
