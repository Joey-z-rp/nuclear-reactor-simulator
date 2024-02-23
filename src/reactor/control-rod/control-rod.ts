import { ControlRodSettings } from "../settings";

export const CONTROL_ROD_STEPS = 1000;
const CONTROL_ROD_WORTH = 4000; // 4000pcm
const CONTROL_ROD_SPEED = 15; // 15 steps per second
const SCRAM_PERIOD = 6; // Scram in 6s
const FIRE_ACCELERATION_SPEED = 50;

export class ControlRod {
  private name: string;

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

  private isScrammed: boolean;

  private isFiring: boolean;

  // The time passed since pulsing started
  private pulseTime: number;

  constructor(name: string, settings: ControlRodSettings) {
    this.name = name;
    this.settings = settings;
    this.totalSteps = CONTROL_ROD_STEPS;
    this.worth = CONTROL_ROD_WORTH;
    this.speed = CONTROL_ROD_SPEED;
    this.position = 0;
    this.currentStep = 0;
    this.targetStep = 0;
    this.isScrammed = false;
    this.isFiring = false;
    this.pulseTime = 0;
  }

  getName() {
    return this.name;
  }

  getCurrentStep() {
    return this.currentStep;
  }

  getTargetStep() {
    return this.targetStep;
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
    if (this.isFiring) {
      const currentPulseTime = this.pulseTime + this.settings.dtStep;
      this.pulseTime = currentPulseTime;
      const nextPosition =
        Math.pow(currentPulseTime, 2) *
        FIRE_ACCELERATION_SPEED *
        0.5 *
        CONTROL_ROD_STEPS;
      this.currentStep = Math.floor(nextPosition);
      if (nextPosition >= this.targetStep) {
        this.position = this.targetStep;
        this.isFiring = false;
      } else {
        this.position = nextPosition;
      }
      return;
    }
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
    if (!this.isScrammed && !this.isFiring) this.targetStep = step;
  }

  scram() {
    if (this.isScrammed) return;
    this.isScrammed = true;
    this.speed = Math.ceil(CONTROL_ROD_STEPS / SCRAM_PERIOD);
    this.targetStep = 0;
  }

  fire(targetStep: number) {
    this.targetStep = targetStep;
    this.pulseTime = 0;
    this.isFiring = true;
  }
}
