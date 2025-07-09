import { useState } from "react";

function Panel() {
  const [inputValue, setInputValue] = useState("");

  const handleNumberClick = (num: string) => {
    if (inputValue.length < 10) {
      setInputValue((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setInputValue((prev) => prev.slice(0, -1));
  };
  return (
    <>
      {/* Panel numérico */}
      <div className="flex flex-col gap-4 border p-5 rounded-[10px] border-[#d4d2d2]">
        {[
          ["7", "8", "9"],
          ["4", "5", "6"],
          ["1", "2", "3"],
          ["0", "DEL"],
        ].map((row, i) => (
          <div key={i} className="flex gap-4">
            {row.map((value, j) =>
              value !== "DEL" ? (
                <div
                  key={j}
                  onClick={() => handleNumberClick(value)}
                  className="w-19 h-14 border-2 border-black flex items-center justify-center text-2xl font-bold rounded-[8px] cursor-pointer bg-white"
                >
                  {value}
                </div>
              ) : (
                <div
                  key={j}
                  onClick={handleDelete}
                  className="w-24 h-14 border-2 border-black flex items-center justify-center rounded cursor-pointer bg-white"
                >
                  {/* <Image
                          src={DeleteIcon}
                          alt="Borrar"
                          width={40}
                          height={40}
                        /> */}
                </div>
              )
            )}
          </div>
        ))}
      </div>

      {/* Input y botón */}
      <div className="flex flex-col items-center gap-4 mt-6">
        <input
          type="text"
          inputMode="numeric"
          maxLength={10}
          readOnly
          value={inputValue}
          placeholder="Código o DNI"
          className="w-[250px] h-14 text-center text-3xl font-bold border-2 border-black rounded-xl"
        />
        <button className="bg-blue-600 text-white text-2xl font-bold w-20 h-16 rounded hover:bg-blue-700">
          Buscar
        </button>
      </div>
    </>
  );
}

type Area = {
  id: number;
  nombre: string;
  color: string; // Tailwind color classes, ej: 'outline-primary'
};

const areas: Area[] = [
  { id: 1, nombre: "ADMISIÓN", color: "outline-blue-600" },
  {
    id: 2,
    nombre: "OFICINA DE COORDINACIÓN (COA)",
    color: "outline-yellow-500",
  },
  { id: 3, nombre: "OFICINA DE SERVICIOS (OSAR)", color: "outline-cyan-500" },
  { id: 4, nombre: "MESA DE PARTES", color: "outline-gray-600" },
  { id: 5, nombre: "TESORERÍA", color: "outline-green-600" },
  { id: 6, nombre: "DEFENSORÍA DEL ESTUDIANTE", color: "outline-yellow-500" },
];

function SeleccionarArea() {
  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-xl border border-white p-6">
      {/* Header con botón para retroceder */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => history.back()}
          className="text-gray-700 hover:text-black transition"
        >
          <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.57813 12.4981C3.5777 12.6905 3.65086 12.8831 3.79761 13.0299L9.7936 19.0301C10.0864 19.3231 10.5613 19.3233 10.8543 19.0305C11.1473 18.7377 11.1474 18.2629 10.8546 17.9699L6.13418 13.2461L20.3295 13.2461C20.7437 13.2461 21.0795 12.9103 21.0795 12.4961C21.0795 12.0819 20.7437 11.7461 20.3295 11.7461L6.14168 11.7461L10.8546 7.03016C11.1474 6.73718 11.1473 6.2623 10.8543 5.9695C10.5613 5.6767 10.0864 5.67685 9.79362 5.96984L3.84392 11.9233C3.68134 12.0609 3.57812 12.2664 3.57812 12.4961L3.57813 12.4981Z"
              fill="#343C54"
            />
          </svg>
        </button>
      </div>

      {/* Título */}
      <h4 className="text-3xl font-bold text-[#181c32] mb-6">
        Seleccionar Área
      </h4>

      {/* Botones */}
      <div className="flex flex-col gap-4">
        {areas.map((area) => (
          <button
            key={area.id}
            className={`border-2 ${area.color} text-xl font-bold py-2 rounded w-full`}
          >
            {area.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
export { Panel, SeleccionarArea };
