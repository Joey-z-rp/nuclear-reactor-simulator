import { useRef } from "react";
import { useMount } from "./useMount";

type UseUpdate<D extends any = any> = {
  initialData: D;
  setData: (data: D) => void;
  getData: () => D;
  checkIsChanged: (oldData: D, newData: D) => boolean;
};

export const useUpdate = ({
  initialData,
  setData,
  getData,
  checkIsChanged,
}: UseUpdate) => {
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
