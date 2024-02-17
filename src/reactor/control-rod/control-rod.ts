import { ControlRodSettings } from "../settings";

const CONTROL_ROD_STEPS = 1000;
const CONTROL_ROD_WORTH = 4000; // 4000pcm
const CONTROL_ROD_SPEED = 15; // 15 steps per second

export class ControlRod {
  private settings: ControlRodSettings;

  private totalSteps: number;

  private worth: number;

  private speed: number;

  // 0 < position < steps
  private position: number;

  // 0 < currentStep < steps
  private currentStep: number;

  // 0 < targetStep < steps
  private targetStep: number;

  constructor(settings: ControlRodSettings) {
    this.settings = settings;
    this.totalSteps = CONTROL_ROD_STEPS;
    this.worth = CONTROL_ROD_WORTH;
    this.speed = CONTROL_ROD_SPEED;
    this.position = 0;
    this.currentStep = 0;
    this.targetStep = 0;
  }

  getReactivity() {
    if (this.position < 0 || this.position > this.totalSteps)
      throw "Invalid rod position";

    return (this.position / this.totalSteps) * this.worth;
  }

  getRodWorth() {
    return this.worth;
  }

  move() {
    if (this.currentStep === this.targetStep) return;
    if (this.currentStep < this.targetStep) {
      const nextPosition = this.position + this.speed * this.settings.dtStep;
      this.currentStep = Math.floor(nextPosition);
      this.position =
        nextPosition >= this.targetStep ? this.targetStep : nextPosition;
    } else {
      const nextPosition = this.position - this.speed * this.settings.dtStep;
      this.currentStep = Math.ceil(nextPosition);
      this.position =
        nextPosition <= this.targetStep ? this.targetStep : nextPosition;
    }
  }

  setTarget(step: number) {
    this.targetStep = step;
  }
}
