import "./parameter.css";

export const Parameter = ({
  color,
  value,
  unit,
  name,
}: {
  color?: string;
  value: number;
  unit: string;
  name: string;
}) => {
  return (
    <div className="bg-gray-300 p-2 rounded-md min-w-40">
      <div className="text-sm">{name}:</div>
      <div className="flex">
        {color && (
          <div className="arrow mr-2" style={{ borderLeftColor: color }} />
        )}
        <div>
          {value} {unit}
        </div>
      </div>
    </div>
  );
};
