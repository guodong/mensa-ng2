import {Injectable} from '@angular/core';
import {DatastoreService} from "./datastore.service";
import {User} from "./models";


@Injectable()
export class SessiongManagerService {
  currentUser: User;

  constructor(private dsService: DatastoreService) {}
  

  loginAsGuest() {
    var me = this;
    if (localStorage.getItem('user')) {
      var obj = JSON.parse(localStorage.getItem('user'));
      this.dsService.findRecord(User, obj.id).subscribe(
        (u: User) => (me.currentUser = u)
      ); // load user info on page load
      return localStorage.getItem('user');
    }

    let user = this.dsService.createRecord(User, {
      role: 'guest'
    });
    user.save().subscribe((u: User) => {
      localStorage.setItem('user', JSON.stringify({id: u.id, sysname: u.sysname, role: u.role}));
      me.currentUser = u;
    });
  }
  
}
