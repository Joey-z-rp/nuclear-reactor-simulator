import { useRef } from "react";
import { useMount } from "./useMount";

type UseUpdate<D extends any> = {
  initialData: D;
  setData: (data: D) => void;
  getData: () => D;
  checkIsChanged: (oldData: D, newData: D) => boolean;
};

export const useUpdate = <D>({
  initialData,
  setData,
  getData,
  checkIsChanged,
}: UseUpdate<D>) => {
  const dataRef = useRef(initialData);

  useMount(() => {
    const update = () => {
      const data = getData();
      const isChanged = checkIsChanged(dataRef.current, data);
      if (isChanged) {
        dataRef.current = data;
        setData(data);
      }

      requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  });
};
