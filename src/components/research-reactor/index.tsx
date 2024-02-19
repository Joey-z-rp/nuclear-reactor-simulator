"use client";
import { reactor } from "@/reactor/simulator";
import { LineChartDisplay } from "./line-chart-display";
import { RodController } from "./rod-controller";

export const ResearchReactor = () => {
  return (
    <div>
      <div className="p-10 h-96">
        <LineChartDisplay />
      </div>
      <button
        onClick={() => {
          reactor.init();
          reactor.start();
        }}
      >
        start
      </button>
      <button
        onClick={() => {
          reactor.setRodTarget("safety", 1000);
          reactor.setRodTarget("shim", 1000);
          reactor.setRodTarget("regulatory", 300);
        }}
      >
        pull
      </button>
      <RodController />
    </div>
  );
};
