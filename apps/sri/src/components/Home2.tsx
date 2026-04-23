import { useState } from "react";

const Home2 = () => {
  const [clicks, setClicks] = useState(0);

  return (
    <div>
      <h3>Home 2</h3>
      <button type="button" onClick={() => setClicks((c) => c + 1)}>
        Clicked {clicks} times
      </button>
    </div>
  );
};

export default Home2;
