import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-3xl font-bold underline">Vite + Tailwind</h1>
      <div className="card bg-gray-100 p-4 shadow-lg flex flex-col m-10">
        <button
          onClick={() => setCount((count) => count + 1)}
          className=" bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
        >
          count is {count}
        </button>
        <p className="mt-4">
          Edit{" "}
          <code className="bg-gray-200 text-sm font-mono p-1 rounded">
            src/App.tsx
          </code>{" "}
          and save to test HMR
        </p>
      </div>
    </div>
  );
}

export default App;
