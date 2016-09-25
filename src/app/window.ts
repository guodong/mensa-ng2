
export class Window {
  id: any;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  oldGeo: any;
  process: any;
  isMaximized: boolean = false;
  isMinimized: boolean = false;
  zIndex: number;
  
  constructor(args: any) {
    this.visible = false;
    for (var i in args) {
      this[i] = args[i];
    }
    
  }

  maximize() {
    this.oldGeo = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
    this.x = 0;
    this.y = 0;
    this.width = document.body.clientWidth;
    this.height = document.body.clientHeight - 41;
    this.isMaximized = true;
  }
  
  unMaximize() {
    this.x = this.oldGeo.x;
    this.y = this.oldGeo.y;
    this.width = this.oldGeo.width;
    this.height = this.oldGeo.height;
    this.isMaximized = false;
  }
  
  toggleMaximize() {
    this.isMaximized ? this.unMaximize() : this.maximize();
  }
  
  minimize() {
    this.visible = false;
  }

  unMinimize() {
    this.visible = true;
  }

  destroy() {

  }
}