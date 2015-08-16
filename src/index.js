import {Parser as StandardParser} from 'aurelia-binding';
import {Parser} from './parser';

export function configure(frameworkConfig) {
  frameworkConfig.container.autoRegister(Parser, StandardParser);
}
