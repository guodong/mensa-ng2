export class App {
  id: string;
  url: string;
  type: string;
  config: any;
  
  constructor(args: any) {
    for (var i in args) {
      this[i] = args[i];
    }
    
  }
}