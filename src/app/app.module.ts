import {NgModule} from '@angular/core';
import {BrowserModule}  from '@angular/platform-browser';
import {HttpModule}    from '@angular/http';

import {AppComponent} from './app.component';
import {DesktopComponent} from './desktop.component';
import {WindowComponent} from './window.component';
import {TaskbarComponent} from './taskbar.component';
import {StartmenuComponent} from './startmenu.component';
import {DesktopIconListComponent} from './desktop-icon-list.component';
import {DesktopIconItemComponent} from './desktop-icon-item.component';

import {WmService} from './wm.service';
import {AppManagerService} from './app-manager.service';
import {RegistryService} from './registry.service';
import {ProcessManagerService} from './process-manager.service';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule
  ],
  declarations: [
    AppComponent,
    DesktopComponent,
    TaskbarComponent,
    WindowComponent,
    StartmenuComponent,
    DesktopIconListComponent,
    DesktopIconItemComponent
  ],
  providers: [
    WmService,
    AppManagerService,
    RegistryService,
    ProcessManagerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
