export interface ErrorObject {
  error_class: string;
  message: string;
  details_headline?: string;
  details?: string;
  traceback?: string[];
}
