import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { Window } from './window';
import { WmService } from './wm.service';
import {ProcessManagerService} from './process-manager.service';
import {App} from "./app";
import {RegistryService} from "./registry.service";

@Component({
  selector: 'desktop',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.css']
})
export class DesktopComponent implements OnInit {
  @Input()
  windows: Window[];
  
  apps: App[] = [];
  constructor(private wmService: WmService, private pmService: ProcessManagerService, private registryService: RegistryService) {}

  ngOnInit(): void {
    this.wmService.getWindows().then(windows => this.windows = windows);
    this.apps = this.registryService.getApps();
  }
  
  active(window: Window) {
    this.wmService.activeWindow(window);
    this.pmService.activeProcess(window.process);
  }

}
