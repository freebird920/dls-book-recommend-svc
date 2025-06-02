import { memo } from "react";
import { Outlet } from "react-router";

const App = memo(() => {
  return (
    <>
      <main>
        <Outlet></Outlet>
      </main>
    </>
  );
});
export default App;
