import {Component, Input, AfterViewInit, ViewChild, ElementRef, PipeTransform, Pipe} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {Window} from './window';
import {WmService} from './wm.service';
import * as interact from 'interact.js';

@Pipe({name: 'safeHtml'})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {}
  transform(value: any) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}

@Pipe({ name: 'safeUrl' })
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.css']
})
export class WindowComponent implements AfterViewInit {
  @Input()
  window: Window;

  @ViewChild('canvas') cvs: ElementRef;
  
  canvas: any;
  imageData: any;

  constructor(private wmService: WmService) {
  }

  ngAfterViewInit() {
    var me = this;
    if (this.window.type == 'cloudware') {

      this.canvas = this.cvs.nativeElement;
      this.window.canvas = this.canvas;
      this.canvas.width = 1;
      this.canvas.height = 1;

      var canvas = this.canvas;
      canvas.width = 1;
      canvas.height = 1;
      if (this.window.width != 0 && this.window.height != 0)
        this.imageData = canvas.getContext('2d').createImageData(this.window.width, this.window.height);
    }
    
    interact('#wd-' + this.window.id + ' .top').draggable({
      onmove: function(event: any) {
        var target = event.target.parentNode.parentNode.parentNode, x = (parseFloat(target.style.left) || 0) + event.dx, y = (parseFloat(target.style.top) || 0) + event.dy;
        target.style.left = x + 'px';
        target.style.top = y + 'px';

      },
    }).styleCursor(false);

    interact('#wd-' + this.window.id).resizable({
      edges: {
        left: false, // has bug
        right: true,
        bottom: true,
        top: false
      }
    }).on('resizemove', function(event: any) {
      var target = event.target, x = (parseFloat(target.getAttribute('data-resize-x')) || 0), y = (parseFloat(target.getAttribute('data-resize-y')) || 0);

      // update the element's style
      target.style.width = event.rect.width + 'px';
      target.style.height = event.rect.height + 'px';

      me.window.width = event.rect.width;
      me.window.height = event.rect.height;

      // translate when resizing from top or left edges
      x += event.deltaRect.left;
      y += event.deltaRect.top;

      target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px,' + y + 'px)';

      target.setAttribute('data-resize-x', x);
      target.setAttribute('data-resize-y', y);
    });
  }

  close() {
    this.wmService.destroyWindow(this.window);
  }

  toggleMaximize() {
    this.window.toggleMaximize();
  }

  minimize() {
    this.window.minimize();
  }
}
