import { Suspense, lazy } from "react";
import "./App.css";

const Home = lazy(() => import("./Home"));
const Home2 = lazy(() => import("./Home2"));

function App() {
  return (
    <div>
      <h1>SRI Test App</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <Home />
        <Home2 />
      </Suspense>
    </div>
  );
}

export default App;
