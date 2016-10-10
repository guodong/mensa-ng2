

export class Session {

  constructor(args: any) {
    for (var i in args) {
      this[i] = args[i];
    }
    
  }
}