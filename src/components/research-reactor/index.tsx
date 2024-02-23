"use client";
import { reactor } from "@/reactor/simulator";
import { LineChartDisplay } from "./line-chart-display";
import { RodController } from "./rod-controller";
import { ParameterDisplay } from "./parameter-display";
import { SimulationControl } from "./simulation-control";

export const ResearchReactor = () => {
  return (
    <div className="h-screen">
      <div className="p-3 h-96">
        <LineChartDisplay />
      </div>
      <div className="flex gap-2">
        <ParameterDisplay />
        <RodController />
        <SimulationControl />
      </div>
    </div>
  );
};
