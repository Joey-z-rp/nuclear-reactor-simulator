import { useEffect, useRef } from "react";

export const useMount = (callback: Function) => {
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (!isMountedRef.current) {
      callback();
      isMountedRef.current = true;
    }
  }, []);
};
