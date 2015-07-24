import {Parser as StandardParser} from 'aurelia-binding';
import {Parser} from './parser';

export function configure(aurelia) {
  aurelia.container.autoRegister(Parser, StandardParser);
}