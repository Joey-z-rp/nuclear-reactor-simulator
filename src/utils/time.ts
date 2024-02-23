export const formatSeconds = (
  seconds: number,
  shouldMillisecond: boolean = false
) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const remainingMillisecond = Math.floor(
    (seconds - Math.floor(seconds)) * 1000
  );

  const formattedHours = hours < 10 ? "0" + hours : hours;
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  const formattedSeconds =
    remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}${
    shouldMillisecond ? `.${remainingMillisecond}` : ""
  }`;
};
