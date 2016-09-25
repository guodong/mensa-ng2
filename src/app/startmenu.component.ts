import {Component, ElementRef, OnInit} from '@angular/core';
import {DatastoreService} from "./datastore.service";
import {Version} from "./models";
import {AppManagerService} from "./app-manager.service";

@Component({
  selector: 'startmenu',
  templateUrl: './startmenu.component.html',
  styleUrls: ['./startmenu.component.css'],
  host: {
    '(document:click)': 'onClick($event)',
  },
})
export class StartmenuComponent implements OnInit {
  active: boolean;
  versions: Version[];

  constructor(private _eref: ElementRef, private dsService: DatastoreService, private amService: AppManagerService) {
  }

  ngOnInit() {
    this.dsService.query(Version).subscribe(
      (versions: Version[]) => this.versions = versions
    )
  }

  onStartClick() {
    this.active = !this.active;
  }

  onClick(event: any) {
    if (!this._eref.nativeElement.contains(event.target)) {
      this.active = false;
    }
  }
  
  run(version: Version) {
    this.amService.installCloudwareVersion(version);
    this.active = false;
  }
}
