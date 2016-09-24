import { Component } from '@angular/core';
import {RegistryService} from './registry.service';
import {App} from './app';

@Component({
  selector: 'desktop-icon-list',
  templateUrl: './desktop-icon-list.component.html',
  styleUrls: ['./desktop-icon-list.component.css']
})
export class DesktopIconListComponent {
  apps: App[] = [];
  
  constructor(private registryService: RegistryService) {
    this.apps = registryService.getApps();
  }
  
  
}
