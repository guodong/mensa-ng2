export class Window {
  id: any;
  content: string;
  x: string;
  y: string;
  visible: boolean;
  
  constructor(args: any) {
    this.visible = false;
    for (var i in args) {
      this[i] = args[i];
    }
    
  }
}