import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {JsonApiDatastore, JsonApiDatastoreConfig} from 'angular2-jsonapi';
import {Version, Cloudware, User, Instance} from './models';

@Injectable()
@JsonApiDatastoreConfig({
  baseUrl: 'http://localhost:3000/',
  models: {
    cloudwares: Cloudware,
    versions: Version,
    users: User,
    instances: Instance
  }
})
export class DatastoreService extends JsonApiDatastore {
  constructor(http: Http) {
    super(http);
  }
}