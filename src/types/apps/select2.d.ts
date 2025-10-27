// src/types/select2.d.ts
import 'jquery';

declare module 'jquery' {
  interface JQuery {
    select2(...args: any[]): JQuery;
  }
}
