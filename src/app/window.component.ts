import {Component, Input, AfterViewChecked} from '@angular/core';
import {Window} from './window';
import {WmService} from './wm.service';
import * as interact from 'interact.js';

@Component({
  selector: 'window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.css']
})
export class WindowComponent implements AfterViewChecked {
  @Input()
  window: Window;

  constructor(private wmService: WmService) {
  }

  ngAfterViewChecked() {
    var me = this;
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
