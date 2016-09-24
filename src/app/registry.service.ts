import { Injectable } from '@angular/core';
import {App} from './app';

@Injectable()
export class RegistryService {
  apps: App[] = [];
  
  getApps() {
    return this.apps;
  }
  
  addApp(app: App) {
    this.apps.push(app);
  }
}
