import { Injectable } from '@angular/core';
import { Window } from './window';


@Injectable()
export class WmService {
  windows: Window[] = [];
  
  getWindows(): Promise<Window[]> {
    return Promise.resolve(this.windows);
  }

  createWindow(opts: any): Promise<Window> {
    console.log(123)
    let window = new Window(opts);
    window.id = Math.random();
    this.windows.push(window);
    return Promise.resolve(window);
  }
  
  showWindow(window: Window) {
    window.visible = true;
  }

  getWindowById(id: any) {
    for (var i in this.windows) {
      if (this.windows[i].id == id) {
        return this.windows[i];
      }
    }
    return null;
  }
}
