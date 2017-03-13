import {Injectable} from '@angular/core';
import {Window} from './window';


@Injectable()
export class WmService {
  windows: Window[] = [];
  zIndex: number = 2;

  getWindows(): Promise<Window[]> {
    return Promise.resolve(this.windows);
  }

  createWindow(opts: any): Promise<Window> {
    let window = new Window(opts);
    if (!window.id)
      window.id = Math.floor(Math.random() * 10000);
    
    window.zIndex = this.zIndex++;
    this.windows.push(window);
    return Promise.resolve(window);
  }

  showWindow(window: Window): Promise<Window> {
    window.visible = true;
    console.log(window);
    return Promise.resolve(window);
  }

  destroyWindow(window: Window) {
    for (var i in this.windows) {
      if (window == this.windows[i]) {
        if (this.windows[i].process && this.windows[i].process.worker)
          this.windows[i].process.worker.postMessage({msg: 'destroy', payload: this.windows[i].id});
        this.windows.splice(parseInt(i), 1);
        break;
      }
    }

  }

  maximizeWindow(window: Window) {
    window.maximize();
  }
  
  activeWindow(window: Window) {
    window.zIndex = this.zIndex++;
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
