import {NgModule, enableProdMode} from '@angular/core';
import {BrowserModule}  from '@angular/platform-browser';
import {HttpModule}    from '@angular/http';
import {JsonApiModule} from 'angular2-jsonapi';

import {AppComponent} from './app.component';
import {DesktopComponent} from './desktop.component';
import {WindowComponent} from './window.component';
import {TaskbarComponent} from './taskbar.component';
import {StartmenuComponent} from './startmenu.component';
import {DesktopIconItemComponent} from './desktop-icon-item.component';
import {TaskbarIconItemComponent} from './taskbar-icon-item.component';

import {WmService} from './wm.service';
import {AppManagerService} from './app-manager.service';
import {RegistryService} from './registry.service';
import {ProcessManagerService} from './process-manager.service';
import {DatastoreService} from './datastore.service';

enableProdMode();
@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    JsonApiModule
  ],
  declarations: [
    AppComponent,
    DesktopComponent,
    TaskbarComponent,
    WindowComponent,
    StartmenuComponent,
    DesktopIconItemComponent,
    TaskbarIconItemComponent
  ],
  providers: [
    WmService,
    AppManagerService,
    RegistryService,
    ProcessManagerService,
    DatastoreService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
