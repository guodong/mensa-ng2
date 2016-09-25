import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {JsonApiDatastore, JsonApiDatastoreConfig} from 'angular2-jsonapi';
import {Version, Cloudware} from './models';

@Injectable()
@JsonApiDatastoreConfig({
  baseUrl: 'http://apiv2.cloudwarehub.com/',
  models: {
    cloudwares: Cloudware,
    versions: Version
  }
})
export class DatastoreService extends JsonApiDatastore {
  constructor(http: Http) {
    super(http);
  }
}