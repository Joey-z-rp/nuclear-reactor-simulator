import { ControlRodSettings } from "../settings";
import { ControlRod } from "./control-rod";

export class RodController {
  private safetyRod: ControlRod;
  private regulatoryRod: ControlRod;
  private shimRod: ControlRod;
  private rods: ControlRod[];

  constructor(settings: ControlRodSettings) {
    this.safetyRod = new ControlRod("safety", settings);
    this.regulatoryRod = new ControlRod("regulatory", settings);
    this.shimRod = new ControlRod("shim", settings);
    this.rods = [this.safetyRod, this.regulatoryRod, this.shimRod];
  }

  getRodPositions(): Record<
    string,
    { currentStep: number; targetStep: number }
  > {
    return this.rods.reduce(
      (positions, rod) => ({
        ...positions,
        [rod.getName()]: {
          currentStep: rod.getCurrentStep(),
          targetStep: rod.getTargetStep(),
        },
      }),
      {}
    );
  }

  getTotalRodReactivity() {
    return this.rods.reduce(
      (reactivity, rod) => reactivity + rod.getReactivity(),
      0
    );
  }

  getTotalRodWorth() {
    return this.rods.reduce((worth, rod) => worth + rod.getRodWorth(), 0);
  }

  moveRods() {
    this.rods.forEach((rod) => {
      rod.move();
    });
  }

  setRodTarget(rod: "safety" | "regulatory" | "shim", step: number) {
    switch (rod) {
      case "safety":
        return this.safetyRod.setTarget(step);
      case "regulatory":
        return this.regulatoryRod.setTarget(step);
      case "shim":
        return this.shimRod.setTarget(step);
      default:
        return;
    }
  }
}
