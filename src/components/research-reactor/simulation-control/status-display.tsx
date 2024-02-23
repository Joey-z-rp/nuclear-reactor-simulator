import { useUpdate } from "@/hooks/useUpdate";
import { reactor } from "@/reactor/simulator";
import { ScramStatus } from "@/reactor/types";
import { useState } from "react";

const statuses = {
  [ScramStatus.POWER]: "Power too high",
  [ScramStatus.FUEL_TEMPERATURE]: "Fuel temperature too high",
  [ScramStatus.WATER_TEMPERATURE]: "Water temperature too high",
  [ScramStatus.REACTOR_PERIOD]: "Reactor period too low",
  [ScramStatus.USER_INITIATED]: "User initialed",
  [ScramStatus.AFTER_PULSE]: "Scram after pulse",
};

export const StatusDisplay = () => {
  const [status, setStatus] = useState<{ scramStatus: ScramStatus | null }>({
    scramStatus: null,
  });

  useUpdate({
    initialData: status,
    setData: setStatus,
    getData: () => ({
      scramStatus: reactor.getScramStatus(),
    }),
    checkIsChanged: (oldData, newData) =>
      oldData.scramStatus !== newData.scramStatus,
  });

  const textColor =
    status.scramStatus !== null ? "text-red-500" : "text-green-500";

  return (
    <div className="p-2 flex flex-col gap-2 bg-gray-200">
      <div className="flex flex-col text-center gap-2">
        <div>Reactor status:</div>
        <div className={textColor}>
          {status.scramStatus !== null
            ? `Scrammed: ${statuses[status.scramStatus]}`
            : "Normal"}
        </div>
      </div>
      <div className="flex justify-center">
        <button
          className={`text-md text-white ${
            status.scramStatus ? "bg-gray-500" : "bg-red-500"
          } rounded-md p-2 mr-2`}
          onClick={() => reactor.scram(ScramStatus.USER_INITIATED)}
          disabled={!!status.scramStatus}
        >
          SCRAM
        </button>
      </div>
    </div>
  );
};
