import { Component } from '@angular/core';
import {AppManagerService} from './app-manager.service';
import './../../assets/styles/normalize.css';
import './../../assets/styles/styles.css';
import {SessiongManagerService} from "./session-manager.service";

@Component({
  selector: 'body',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private appManagerService: AppManagerService, private smService: SessiongManagerService) {
    this.appManagerService.install('/apps/about').then(app => console.log(app));
    //this.appManagerService.install('/apps/myfiles');
    this.smService.loginAsGuest();
  }
  
}
