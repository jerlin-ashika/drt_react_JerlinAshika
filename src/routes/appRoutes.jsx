import { Route, Routes } from "react-router-dom";
import AssetList from "../pages/assets/list";

const AppRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<AssetList />} />
    </Routes>
  );
};
export default AppRoute;
