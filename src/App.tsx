import { Routes, Route } from "react-router";
import IframeTest from "./IframeTest";
import Embed from "./Embed";
import { Link } from "react-router-dom";
import { GlobalAudioContextProvider } from "./GlobalAudioContext";

const App = () => {
  return (
    <GlobalAudioContextProvider>
      <Routes>
        <Route path="/embed" element={<Embed />} />
        <Route
          path="/cortico"
          element={<IframeTest iframeUrl={"http://localhost:3000/embed"} />}
        />
        <Route
          path="/playerjs"
          element={<IframeTest iframeUrl={"http://playerjs.io/iframe.html"} />}
        />

        <Route
          path="*"
          element={
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h1>
                Click on a link below to see the test for Cortico or Player.js
              </h1>
              <Link to={"/cortico"}>Cortico</Link>
              <Link to={"/playerjs"}>Player.js</Link>
            </div>
          }
        />
      </Routes>
    </GlobalAudioContextProvider>
  );
};

export default App;
