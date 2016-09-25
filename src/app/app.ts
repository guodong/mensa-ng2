export class App {
  id: string;
  url: string;
  type: string;
  config: any;
  logo: string;
  name: string;
  
  constructor(args: any) {
    for (var i in args) {
      this[i] = args[i];
    }
    
  }
}