import {
  createBrowserRouter,
  redirect,
  type LoaderFunctionArgs,
} from "react-router";
import App from "./App";
import SettingsPage from "./app/settings/pages";
import ChatPage from "./app/chat/page";

const rootLoader = async ({ request }: LoaderFunctionArgs) => {
  if (typeof window !== "undefined") {
    const apiKey = localStorage.getItem("gemini-api-key");
    const currentPath = new URL(request.url).pathname;

    if (!apiKey && currentPath !== "/settings") {
      return redirect("/settings");
    }
    if (currentPath !== "/settings" && apiKey && currentPath !== "/chat") {
      return redirect("/chat");
    }
  }
  return null; // API 키가 있거나, localStorage를 사용할 수 없는 환경이거나, 이미 /settings 페이지인 경우 null 반환
};

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    loader: rootLoader, // 이 로더는 App 컴포넌트와 그 모든 자식들에게 적용됩니다.
    children: [
      {
        path: "settings",
        Component: SettingsPage,
      },
      {
        path: "chat",
        Component: ChatPage,
      },
    ],
  },
]);

export default router;
