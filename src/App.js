import './App.css';
import Wrapper from "./Editor/container";


function App() {
  localStorage.setItem("language", "c");
    return (
      <div className="App">
        <Wrapper />
        <span id="text_width_finder"></span>
      </div>
    );
}

export default App;
