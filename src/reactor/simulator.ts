import { addArrays, multiplyArray } from "@/utils/array";
import { pi } from "./constants";
import { RodController } from "./control-rod/rod-controller";
import { SimulatorSettings, simulatorSettings } from "./settings";

class Simulator {
  private settings: SimulatorSettings;

  // Number of data points to retain
  private dataPoints: number;

  // Total iterations since simulation start
  private iterations: number;

  private simulationSpeed: number;

  // The last time a simulation calculation was run (real time)
  private lastSimulationTime: number;

  // Simulator running time in seconds at each data point
  private simulatorTimes: number[];

  // Excess reactivity - (rod worth * rod position percentage) at each data point
  private rawReactivities: number[];

  // Raw reactivity - thermal reactivity - poison reactivity at each data point
  private netReactivities: number[];

  // Xenon 135 concentration
  private xenonConcentration: number;

  // Iodine 131 concentration
  private iodineConcentration: number;

  // Fuel temperature at each data point
  private fuelTemperatures: number[];

  private waterTemperature: number;

  // Neutron population at each data point
  private neutronPopulations: number[];

  private groupStabilities: number[];

  private stateVectors: number[][];

  private rodController: RodController;

  constructor(settings: SimulatorSettings) {
    this.dataPoints = Math.floor(settings.dataRetentionTime / settings.dtStep);
    this.settings = settings;
    this.simulationSpeed = 10;
    this.lastSimulationTime = 0;
    this.iterations = 0;
    this.xenonConcentration = 0;
    this.iodineConcentration = 0;
    this.waterTemperature = this.settings.ambientTemperature;
    this.simulatorTimes = Array(this.dataPoints);
    this.rawReactivities = Array(this.dataPoints);
    this.netReactivities = Array(this.dataPoints);
    this.fuelTemperatures = Array(this.dataPoints);
    this.neutronPopulations = Array(this.dataPoints);

    this.groupStabilities = Array.from(
      { length: this.settings.numberOfGroups },
      (_, index) =>
        this.settings.delayedGroupBetas[index] /
        (this.settings.delayedGroupLambdas[index] *
          this.settings.promptNeutronLifeTime)
    );
    this.stateVectors = Array.from({ length: this.dataPoints }, () =>
      Array(this.settings.numberOfGroups)
    );

    this.rodController = new RodController({ dtStep: this.settings.dtStep });
  }

  getDataPoints() {
    return this.dataPoints;
  }

  getSettings() {
    return this.settings;
  }

  getRawReactivities() {
    return this.rawReactivities;
  }

  getNetReactivities() {
    return this.netReactivities;
  }

  getSimulatorTimes() {
    return this.simulatorTimes;
  }

  getFuelTemperatures() {
    return this.fuelTemperatures;
  }

  getWaterTemperature() {
    return this.waterTemperature;
  }

  getRawReactivity() {
    return (
      this.settings.excessReactivity +
      this.rodController.getTotalRodReactivity() -
      this.rodController.getTotalRodWorth()
    );
  }

  getRodPositions() {
    return this.rodController.getRodPositions();
  }

  init() {
    this.simulatorTimes[0] = 0;
    this.rawReactivities[0] = this.getRawReactivity();
    this.netReactivities[0] = this.rawReactivities[0]; // Clean core
    this.fuelTemperatures[0] = this.settings.ambientTemperature;
    this.neutronPopulations[0] =
      (-1e5 *
        this.settings.neutronSource *
        this.settings.promptNeutronLifeTime) /
      this.netReactivities[0];
    Array.from({ length: this.settings.numberOfGroups }).forEach((_, index) => {
      this.stateVectors[0][index] =
        this.neutronPopulations[0] * this.groupStabilities[index];
    });

    this.iterations++;
  }

  getCurrentIndex() {
    if (this.iterations === 0) return 0;
    if (this.iterations % this.dataPoints !== 0)
      return (this.iterations % this.dataPoints) - 1;
    return this.dataPoints - 1;
  }

  getNextIndex() {
    const currentIndex = this.getCurrentIndex();
    return currentIndex === this.dataPoints - 1 ? 0 : currentIndex + 1;
  }

  getPower(index: number) {
    const neutronPopulation = this.neutronPopulations[index];
    return (
      neutronPopulation *
      this.settings.macroFissonCrossSection *
      this.settings.thermalNeutronSpeed *
      this.settings.energyReleasedPerFission
    );
  }

  getFuelHeatCapacity(fuelTemperature: number) {
    // Cp taken from simnad1981, where Cp(T) = (2.04 + 4.17e-3 T) J/(K cm^3)
    // Volume of a signle fuel element  ((0.5 * 3.556cm)**2 - (0.5 * 0.635cm)**2)*3.14*38.1cm
    // 3.556 cm is outer radius
    // 0.635 cm is inner radius
    // 38.1  cm is fuel element len.
    // Geometry data from http://www.rcp.ijs.si/ric/description-s.html
    const fuelVolume =
      ((0.5 * 3.556) ** 2 - (0.5 * 0.635) ** 2) *
      pi *
      38.1 *
      this.settings.numberOfFuelElements;
    return fuelVolume * (2.04 + 4.17e-3 * fuelTemperature) * 0.858;
  }

  // Use a general formula to find the real root of the first order
  // polynomial from the TRIGLAV code that describes the dependence
  // of stationary temperature in relation to the reactor power.
  getCoolingPower(fuelTemperature: number) {
    const a = this.settings.temperatureModelCoefficients[2];
    const b = this.settings.temperatureModelCoefficients[1];
    const c = this.settings.temperatureModelCoefficients[0];
    const d = this.waterTemperature - fuelTemperature;
    const d0 = b ** 2 - 3 * a * c;
    const d1 = 2 * b ** 3 - 9 * a * b * c + 27 * a ** 2 * d;
    const C = Math.cbrt((d1 + Math.sqrt(d1 ** 2 - 4 * d0 ** 3)) / 2);
    return (
      -this.settings.numberOfFuelElements * (1 / (3 * a)) * (b + C + d0 / C)
    );
  }

  // Flux in m^-1
  getCurrentFlux() {
    return (
      (this.neutronPopulations[this.getCurrentIndex()] *
        this.settings.thermalNeutronSpeed) /
      this.settings.coreVolume
    );
  }

  // This is a very slow process, an Euler scheme is used for time
  // propagation
  calculatePoisonConcentrations() {
    const flux = this.getCurrentFlux();
    const currentIodineConcentration = this.iodineConcentration;
    this.iodineConcentration =
      currentIodineConcentration +
      this.settings.dtStep *
        (this.settings.iodineFissionYield *
          flux *
          this.settings.macroFissonCrossSection -
          currentIodineConcentration * this.settings.iodineDecayConstant);
    const xenonFromFission =
      this.settings.xenonFissionYield *
      this.settings.macroFissonCrossSection *
      flux;
    const xenonFromIodineDecay =
      currentIodineConcentration * this.settings.iodineDecayConstant;
    const xenonDecay =
      this.xenonConcentration * this.settings.xenonDecayConstant;
    const xenonNeutronAbsorbtion =
      flux *
      this.xenonConcentration *
      this.settings.xenonAbsorbtionMicroCrossSection;
    this.xenonConcentration =
      this.xenonConcentration +
      this.settings.dtStep *
        (xenonFromFission +
          xenonFromIodineDecay -
          xenonDecay -
          xenonNeutronAbsorbtion);
  }

  getReactivityTemperatureCoefficient(temperature: number) {
    const alphaT1 = 240;
    const alpha0 = 6;
    const alphaAtT1 = 9;
    const alphaK = -0.004;
    if (temperature < alphaT1) {
      return alpha0 + (temperature * (alphaAtT1 - alpha0)) / alphaT1;
    } else {
      return alphaAtT1 + alphaK * (temperature - alphaT1);
    }
  }

  calculateStateVector() {
    const currentIndex = this.getCurrentIndex();
    const nextIndex = this.getNextIndex();
    const reactivity = this.netReactivities[nextIndex] * 1e-5;

    const calculateNeutronChange = (
      currentState: number[],
      currentNeutronPopulation: number
    ) => {
      const fissionRate =
        currentNeutronPopulation / this.settings.promptNeutronLifeTime;
      const betaTotal = this.settings.delayedGroupBetas.reduce(
        (sum, beta) => sum + beta,
        0
      );
      let newNeutronPopulation =
        (reactivity - betaTotal) * fissionRate + this.settings.neutronSource;

      const state: number[] = Array(this.settings.numberOfGroups);
      for (let i = 0; i < this.settings.numberOfGroups; i++) {
        const delayedNeutrons =
          this.settings.delayedGroupLambdas[i] * currentState[i]; // per second
        newNeutronPopulation += delayedNeutrons;
        state[i] =
          this.settings.delayedGroupBetas[i] * fissionRate - delayedNeutrons;
      }

      return [newNeutronPopulation, ...state];
    };

    // RK4 scheme
    const currentNeutronPopulation = this.neutronPopulations[currentIndex];
    const currentStateVector = this.stateVectors[currentIndex];

    const result1 = calculateNeutronChange(
      currentStateVector,
      currentNeutronPopulation
    ); // f(t0) -- change of population at t0
    const currentState = [currentNeutronPopulation, ...currentStateVector];
    const [neutronPopulation2Param, ...stateVector2Param] = addArrays(
      multiplyArray(result1, 0.5 * this.settings.dtStep),
      currentState,
      { positiveOnly: true }
    );
    const result2 = calculateNeutronChange(
      stateVector2Param,
      neutronPopulation2Param
    ); // f(t0 + h/2) -- change of population at t0 + 1/2*h
    const [neutronPopulation3Param, ...stateVector3Param] = addArrays(
      multiplyArray(result2, 0.5 * this.settings.dtStep),
      currentState,
      { positiveOnly: true }
    );
    const result3 = calculateNeutronChange(
      stateVector3Param,
      neutronPopulation3Param
    ); // f(t0 + 3h/4) -- change of population at t0 + 3/4*h
    const [neutronPopulation4Param, ...stateVector4Param] = addArrays(
      multiplyArray(result3, this.settings.dtStep),
      currentState,
      { positiveOnly: true }
    );
    const result4 = calculateNeutronChange(
      stateVector4Param,
      neutronPopulation4Param
    ); // f(t0 + h) -- change of population at t0 + h

    // RK4 final sum
    // stateVector += (dt/6)*( (k1+k4) + 2*(k2+k3) )
    const k1PlusK4 = addArrays(result1, result4);
    const k2PlusK3 = addArrays(result2, result3);
    const kFinal = multiplyArray(
      addArrays(k1PlusK4, multiplyArray(k2PlusK3, 2)),
      this.settings.dtStep / 6
    );
    const newState = addArrays(kFinal, currentState);
    const [newNeutronPopulation, ...newStateVector] = newState;
    this.neutronPopulations[nextIndex] = Math.max(10, newNeutronPopulation);
    this.stateVectors[nextIndex] = newStateVector;
  }

  calculateWaterTemperature(currentIndex: number) {
    const waterCapacity =
      this.settings.waterVolume * 1e3 * this.settings.waterSpecificHeat; // C_vode = V * rho * c_v
    const currentPower = this.getPower(currentIndex);
    // Create derivatives
    const tFuel = currentPower / waterCapacity; // dT = P*dt/C_vode
    // From Žerovnik power calibration
    const qAir =
      13.6 *
      Math.pow(this.settings.ambientTemperature - this.waterTemperature, 4 / 3);
    const qConcrete =
      250 * (this.settings.ambientTemperature - this.waterTemperature);
    const tPassiveCooling = (qAir + qConcrete) / waterCapacity;
    // dT = (T-air_temp) * const. * dt
    const tActiveCooling = this.settings.waterCoolingPower / waterCapacity; // dT = P*dt / C_vode
    const newWaterTemperature =
      this.waterTemperature +
      this.settings.dtStep * (tFuel - tPassiveCooling - tActiveCooling);
    if (newWaterTemperature < this.settings.ambientTemperature) {
      this.waterTemperature = this.settings.ambientTemperature;
    } else if (newWaterTemperature > 100) {
      this.waterTemperature = 100;
    } else {
      this.waterTemperature = newWaterTemperature;
    }
  }

  simulate(iterations: number) {
    for (let i = 0; i < iterations; i++) {
      const currentIndex = this.getCurrentIndex();
      const nextIndex = this.getNextIndex();
      this.simulatorTimes[nextIndex] =
        this.simulatorTimes[currentIndex] + this.settings.dtStep;

      // Calculate fuel temperature
      const currentPower = this.getPower(currentIndex);
      const currentFuelTemperature = this.fuelTemperatures[currentIndex];
      const fuelHeatingPower =
        currentPower - this.getCoolingPower(currentFuelTemperature);
      const nextTemperature =
        currentFuelTemperature +
        (fuelHeatingPower * this.settings.dtStep) /
          this.getFuelHeatCapacity(currentFuelTemperature);
      this.fuelTemperatures[nextIndex] = Math.max(
        this.waterTemperature,
        nextTemperature
      );

      // Move rods
      this.rodController.moveRods();
      this.rawReactivities[nextIndex] = this.getRawReactivity();

      // Calculate negative reactivity feedback
      if (this.iterations % this.settings.poisonCalculationIterations === 0) {
        this.calculatePoisonConcentrations();
      }
      const temperatureReactivityFeedback =
        this.getReactivityTemperatureCoefficient(
          this.fuelTemperatures[nextIndex]
        ) *
        (this.fuelTemperatures[nextIndex] - this.settings.ambientTemperature);
      const poisonReactivityFeedback =
        (this.xenonConcentration *
          1e5 *
          this.settings.xenonAbsorbtionMicroCrossSection) /
        (this.settings.nuBar * this.settings.macroFissonCrossSection);
      this.netReactivities[nextIndex] =
        this.rawReactivities[nextIndex] -
        temperatureReactivityFeedback -
        poisonReactivityFeedback;

      // Calculate point kinetics equation
      this.calculateStateVector();

      this.calculateWaterTemperature(currentIndex);

      this.iterations++;
    }
  }

  run = () => {
    const currentTime = Date.now();
    const timeSinceLastSimulation = currentTime - this.lastSimulationTime;
    // timeSinceLastSimulation is in millisecond and dtStep is in second
    const iterationsToCalucate =
      (timeSinceLastSimulation * this.simulationSpeed) /
      (this.settings.dtStep * 1000);
    this.simulate(iterationsToCalucate);

    this.lastSimulationTime = currentTime;
    requestAnimationFrame(this.run);
  };

  start() {
    this.lastSimulationTime = Date.now();
    requestAnimationFrame(this.run);
  }

  setRodTarget(rod: "safety" | "regulatory" | "shim", step: number) {
    this.rodController.setRodTarget(rod, step);
  }
}

export const reactor = new Simulator(simulatorSettings);
