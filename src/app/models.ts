import { JsonApiModelConfig, JsonApiModel, Attribute, HasMany, BelongsTo } from 'angular2-jsonapi';

@JsonApiModelConfig({
  type: 'cloudwares'
})
export class Cloudware extends JsonApiModel {
  @Attribute()
  name: string;
  
  @Attribute()
  logo: string;
  
  @Attribute()
  versions: Version[];
}

@JsonApiModelConfig({
  type: 'versions'
})
export class Version extends JsonApiModel {
  @Attribute()
  name: string
  
  @BelongsTo()
  cloudware: Cloudware;
}