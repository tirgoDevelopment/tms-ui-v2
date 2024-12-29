import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'counterAnimation',
})
export class CounterAnimationPipe implements PipeTransform {
  private currentValue = 0;
  private interval: any;

  transform(value: number, duration: number = 1000): number {
    if (this.currentValue === value) {
      return this.currentValue;
    }

    const start = this.currentValue;
    const end = value;
    const frameRate = 10;
    const frames = duration / frameRate;
    const increment = (end - start) / frames;
    let currentFrame = 0;

    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(() => {
      this.currentValue = start + increment * currentFrame;
      currentFrame++;

      if (currentFrame > frames) {
        clearInterval(this.interval);
        this.currentValue = end;
      }
    }, frameRate);
console.log(`Current Value: ${this.currentValue}, Target Value: ${value}`);

    return Math.round(this.currentValue);
  }
}
