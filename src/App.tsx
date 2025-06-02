import { memo } from "react";
import { Outlet } from "react-router";

const App = memo(() => {
  return (
    <>
      <main className="select-none">
        <h1 className="py-5 text-center text-xl font-black">
          <a href="/">
            AI가 책을 제대로 추천해줄 수 있을 리 없잖아, 무리무리!(※무리가
            아니었다?!)
          </a>
        </h1>

        <Outlet></Outlet>
      </main>
    </>
  );
});
export default App;
