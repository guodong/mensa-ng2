import { Component, OnInit } from '@angular/core';
import {ProcessManagerService} from './process-manager.service';
import {Process} from './process';

@Component({
  selector: 'taskbar',
  templateUrl: './taskbar.component.html',
  styleUrls: ['./taskbar.component.css']
})
export class TaskbarComponent implements OnInit {
  date: string;
  time: string;
  processes: Process[] = [];
  
  constructor(private processManagerService: ProcessManagerService) {}

  ngOnInit(): void {
    var me = this;
    this.processes = this.processManagerService.getProcesses();
    function startTime(){
      var m = new Date();
      var dateString = m.getFullYear() + "/" + ("0" + (m.getMonth() + 1)).slice(-2) + "/" + ("0" + m.getDate()).slice(-2);
      var timeString = ("0" + m.getHours()).slice(-2) + ":" + ("0" + m.getMinutes()).slice(-2) + ":" + ("0" + m.getSeconds()).slice(-2);
      me.date = dateString;
      me.time = timeString;
    }
    startTime();
    setInterval(startTime, 1000);
  }
}
