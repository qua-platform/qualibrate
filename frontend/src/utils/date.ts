// type formatOptionsType = {
//   onlyTime?: boolean;
// };

export const formatDate = (receivedDate?: string | Date, onlyTime?: boolean) => {
  if (!receivedDate) {
    return "-";
  }
  const date = new Date(receivedDate);

  const day = transformTimePart(date.getDate());
  const month = transformTimePart(date.getMonth() + 1);
  const year = transformTimePart(date.getFullYear());

  const firstPart = !onlyTime ? `${day}/${month}/${year}` : "";
  const secondPart = `${transformTimePart(date.getHours())}:${transformTimePart(date.getMinutes())}:${transformTimePart(
    date.getSeconds(),
  )}`;

  return `${firstPart} ${secondPart}`;
};

const transformTimePart = (time: number) => {
  return time < 10 ? "0" + time : time;
};
