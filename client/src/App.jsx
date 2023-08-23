import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home/Home";
import Signup from "./components/Signup/Signup";
import Login from "./components/Login/Login";
import SelectType from "./components/SelectType/SelectType";
import SelectHosting from "./components/SelectHosting/SelectHosting";

export default function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/signup" exact element={<Signup />} />
          <Route path="/login" exact element={<Login />} />
          <Route path="/select_type" exact element={<SelectType />} />
          <Route path="/select_hosting" exact element={<SelectHosting />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
