export type SimulatorSettings = {
  dataRetentionTime: number;
  dtStep: number;
  excessReactivity: number;
  ambientTemperature: number;
  promptNeutronLifeTime: number;
  neutronSource: number;
  delayedGroupBetas: number[];
  delayedGroupLambdas: number[];
  numberOfGroups: number;
  macroFissonCrossSection: number;
  energyReleasedPerFission: number;
  thermalNeutronSpeed: number;
  temperatureModelCoefficients: number[];
  numberOfFuelElements: number;
  poisonCalculationIterations: number;
  coreVolume: number;
  iodineFissionYield: number;
  xenonFissionYield: number;
  iodineDecayConstant: number;
  xenonDecayConstant: number;
  xenonAbsorbtionMicroCrossSection: number;
  nuBar: number;
  waterVolume: number;
  waterSpecificHeat: number;
  waterCoolingPower: number;
};

export type ControlRodSettings = {
  dtStep: number;
};

export const simulatorSettings: SimulatorSettings = {
  dataRetentionTime: 1800, // 30 minutes
  dtStep: 0.001, // 1ms
  excessReactivity: 3000, // Core reactivity(pcm) with all rods out,
  ambientTemperature: 22, // The fuel and water temperature before start
  promptNeutronLifeTime: 3.9e-5, // second,
  neutronSource: 1e5, // Number of neutrons generated from the source per second
  delayedGroupBetas: [
    0.23097e-3, 1.53278e-3, 1.3718e-3, 2.76451e-3, 0.80489e-3, 0.29396e-3,
  ], // Delayed neutron fractions
  delayedGroupLambdas: [0.0124, 0.0305, 0.1115, 0.301, 1.138, 3.01], // Decay constants
  numberOfGroups: 6,
  macroFissonCrossSection: 0.56, // m^-1
  energyReleasedPerFission: 3.20435e-11, // 200 MeV in joules
  thermalNeutronSpeed: 2200, // Thermal neutron speed at 0.025 eV (m/s)
  temperatureModelCoefficients: [67.18e-3, -8.381e-6, 0.3843e-9], // The constants to calculate stationary fuel temperature
  numberOfFuelElements: 59,
  poisonCalculationIterations: 100, // Calculate poison concentration every 100 iterations
  coreVolume: 0.02543, // (m^3)
  iodineFissionYield: 0.06386, // 6.386% of the fission product is iodine
  xenonFissionYield: 0.00228, // 0.228% of the fission product is xenon
  iodineDecayConstant: 0.1035 / 3600, // per second
  xenonDecayConstant: 0.0753 / 3600, // per second
  xenonAbsorbtionMicroCrossSection: 2.6e-22, // m^2
  nuBar: 2.43, // Termična vrednost MT456, ENDF VIII
  waterVolume: 20, // Reactor primary water volume (in cubic meters)
  waterSpecificHeat: 4185.5, // J/kgK
  waterCoolingPower: 2.4e5,
};
