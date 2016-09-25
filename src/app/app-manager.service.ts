import {Injectable} from '@angular/core';
import {Headers, Http} from '@angular/http';
import {RegistryService} from './registry.service';
import {App} from './app';
import {Version} from "./models";

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
      var appconfig = res.json();
      var uuid = Math.random();
      var app = new App({
        id: uuid,
        url: url,
        name: appconfig.name,
        config: appconfig,
        logo: url + '/' + 'icon.png'
      });
      this.registryService.addApp(app);

    }).catch(this.handleError);
  }

  installCloudwareVersion(version: Version) {
    var apps = this.registryService.getApps();
    for (var i in apps) {
      if (apps[i].id === version.id) {
        return Promise.resolve(apps[i]);
      }
    }

    var app = new App({
      id: version.id,
      config: version,
      name: version.cloudware.name,
      type: 'cloudware',
      logo: 'http://apiv2.cloudwarehub.com/uploads/' + version.cloudware.logo
    });
    this.registryService.addApp(app);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
