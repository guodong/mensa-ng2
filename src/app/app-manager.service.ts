import {Injectable} from '@angular/core';
import {Headers, Http} from '@angular/http';
import {RegistryService} from './registry.service';
import {App} from './app';

@Injectable()
export class AppManagerService {
  constructor(private registryService: RegistryService, private http: Http) {
  }

  install(url: string): Promise<App> {
    var apps = this.registryService.getApps();
    for (var i in apps) {
      if (apps[i].url === url) {
        return Promise.resolve(apps[i]);
      }
    }

    this.http.get(url + '/mensa.json').toPromise().then(res => {
      console.log(res.json());
      var appconfig = res.json();
      var uuid = Math.random();
      var app = new App({
        id: uuid,
        url: url,
        config: appconfig
      });
      this.registryService.addApp(app);

    }).catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
