import { useState } from "react";
import { Parameter } from "./parameter";
import { useUpdate } from "@/hooks/useUpdate";
import { reactor } from "@/reactor/simulator";
import { getNextOrder, getPowerWithUnit } from "@/utils/power";
import { round } from "@/utils/number";

export const ParameterDisplay = () => {
  const [parameters, setParameters] = useState({
    fuelTemperature: 0,
    waterTemperature: 0,
    netReactivity: 0,
    rawReactivity: 0,
    power: 0,
    reactorPeriod: Infinity,
  });

  useUpdate({
    initialData: parameters,
    setData: setParameters,
    getData: () => {
      const currentIndex = reactor.getCurrentIndex();
      return {
        fuelTemperature: round(reactor.getFuelTemperatures()[currentIndex]),
        waterTemperature: round(reactor.getWaterTemperature()),
        netReactivity: round(reactor.getNetReactivities()[currentIndex]),
        rawReactivity: round(reactor.getRawReactivities()[currentIndex]),
        power: round(reactor.getPower(currentIndex), 7),
        reactorPeriod: round(reactor.getReactorPeriod()),
      };
    },
    checkIsChanged: (oldData, newData) =>
      oldData.fuelTemperature !== newData.fuelTemperature ||
      oldData.waterTemperature !== newData.waterTemperature ||
      oldData.netReactivity !== newData.netReactivity ||
      oldData.rawReactivity !== newData.rawReactivity ||
      oldData.power !== newData.power ||
      oldData.reactorPeriod !== newData.reactorPeriod,
  });

  const { power, unit } = getPowerWithUnit(
    parameters.power,
    getNextOrder(parameters.power).nextOrderOfMagnitude
  );

  return (
    <div className="p-3 flex gap-2">
      <div className="flex flex-col gap-2">
        <Parameter name="Power" value={power} unit={unit} color="red" />
        <Parameter
          name="Reactor period"
          value={parameters.reactorPeriod}
          unit={Number.isFinite(parameters.reactorPeriod) ? "s" : ""}
        />
        <Parameter
          name="Fuel temperature"
          value={parameters.fuelTemperature}
          unit="°C"
          color="green"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Parameter
          name="Water temperature"
          value={parameters.waterTemperature}
          unit="°C"
        />
        <Parameter
          name="Net reactivity"
          value={parameters.netReactivity}
          unit="pcm"
          color="blue"
        />
        <Parameter
          name="Raw reactivity"
          value={parameters.rawReactivity}
          unit="pcm"
          color="gray"
        />
      </div>
    </div>
  );
};
