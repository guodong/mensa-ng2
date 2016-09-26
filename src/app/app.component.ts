import { Component } from '@angular/core';
import {AppManagerService} from './app-manager.service';
import './../../assets/styles/normalize.css';
import './../../assets/styles/styles.css';

@Component({
  selector: 'body',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private appManagerService: AppManagerService) {
    this.appManagerService.install('/apps/about').then(app => console.log(app));
  }
  
  
}
