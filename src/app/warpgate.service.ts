import {Injectable} from '@angular/core';

@Injectable()
export class WarpgateService {

  constructor() {
  }


  /**
   * all states, used for machine learning
   * TODO: limit size
   * @type {Array}
   */
  private states = [];

  private currentState = null;
  private lastState = null;

  /**
   * direction of movement
   * (0,0) ——————> x
   *  |
   *  |
   *  |
   *  v
   *  y
   * @type {number[]}
   */
  private direction = [1, 0];

  /**
   * px per ms
   * @type {number}
   */
  private speed = 0;

  /**
   * predict latency in ms
   * @type {number}
   */
  public latency = 50;

  public predict(state) {
    this.states.push(state);
    if (this.states.length < 5) {
      return state;
    }
    /* restore state */
    this.lastState = this.states.shift();
    this.currentState = state;
    if (!this.lastState) {
      var predicted = {
        time: state.time + this.latency,
        position: [this.currentState.position[0], this.currentState.position[1]]
      };
      return predicted;
    }

    var cachepos = [this.lastState.position[0], this.lastState.position[1]];
    if (Math.abs(this.currentState.position[0] - this.lastState.position[0]) < 5) {
      //cachepos[0] = this.lastState.position[0];
    }
    if (Math.abs(this.currentState.position[1] - this.lastState.position[1]) < 5) {
      //cachepos[1] = this.lastState.position[1];
    }

    this.direction = this.getUnitDirection(cachepos[0], cachepos[1], this.currentState.position[0], this.currentState.position[1]);
    if (this.direction === null || this.currentState.time - this.lastState.time < 10) { /* didn't move */
      //console.log('dir', this.direction);
      var predicted = {
        time: state.time + this.latency,
        position: [this.currentState.position[0], this.currentState.position[1]]
      };
      return predicted;
    }

    this.speed = this.getDistance(cachepos[0], cachepos[1], this.currentState.position[0], this.currentState.position[1]) / (this.currentState.time - this.lastState.time);
    this.speed = this.speed < 10000000 ? this.speed : 1000000;
    var moveDistance = this.speed * this.latency;
    //console.log(moveDistance);
    var dertax = moveDistance * this.direction[0];
    var dertay = moveDistance * this.direction[1];
    dertax = Math.abs(dertax) < 50 ? dertax : 50;
    dertay = Math.abs(dertay) < 50 ? dertay : 50;

    var predicted = {
      time: state.time + this.latency,
      position: [this.currentState.position[0] + dertax, this.currentState.position[1] + dertay]
    };
    return predicted;
  }

  private getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2);
  }

  private getUnitDirection(x1, y1, x2, y2) {
    var distance = this.getDistance(x1, y1, x2, y2);
    if (distance === 0) {
      return null;
    }
    return [(x2 - x1) / distance, (y2 - y1) / distance];
  }

}
