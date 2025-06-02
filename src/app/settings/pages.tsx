import {
  useCallback,
  useLayoutEffect,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import { useNavigate } from "react-router";

const SettingsPage = () => {
  const [currentApiKey, setCurrentApiKey] = useState<string | null>(null);
  const navigate = useNavigate(); // 2. Initialize useNavigate

  // useCallback
  const onClearButtonClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      localStorage.removeItem("gemini-api-key");
      setCurrentApiKey(null);
      navigate("/");
    },
    [],
  );
  const onApiKeyFormSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const apiKeyInput = formData.get("api-key-input");
      if (!apiKeyInput || typeof apiKeyInput !== "string")
        return alert("api-key-input error");
      localStorage.setItem("gemini-api-key", apiKeyInput);
      setCurrentApiKey(apiKeyInput);
      navigate("/chat");
    },
    [],
  );
  // useEffect
  useLayoutEffect(() => {
    const geminiApiKey = localStorage.getItem("gemini-api-key");
    setCurrentApiKey(geminiApiKey);
  }, []);
  return (
    <>
      <div className="@container mx-auto my-5 flex max-w-[480px] flex-col select-none">
        <h2 className="text-center text-2xl font-black">Settings Page</h2>

        <section className="space-y-3 pb-4">
          <div className="text-right">
            <a
              className="rounded-md px-1 font-black hover:bg-rose-500/30"
              href="https://github.com/freebird920/dls-book-recommend-svc"
              target="_blank"
              rel="noopener noreferrer"
            >
              GITHUB: freebird920
            </a>
          </div>
          <div className="text-right">
            <a
              className="rounded-full bg-rose-500/10 px-4 py-1 font-black hover:bg-rose-500/30"
              href="/chat"
            >
              책추천
            </a>
          </div>
        </section>
        {/* apikey 입력 및 저장 파트 */}

        <section className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <label htmlFor="api-key-input" className="font-bold">
              APIKEY
            </label>
            <input
              form="api-key-form"
              id="api-key-input"
              name="api-key-input"
              placeholder="APIKEY"
              className="grow rounded-md border-2 px-1"
            ></input>
          </div>
          <button
            form="api-key-form"
            className="w-full cursor-pointer rounded-md border-2 bg-amber-500/10 font-semibold hover:bg-amber-500/20"
            type="submit"
          >
            저장
          </button>
          <div>
            <p>
              도서 추천 서비스를 이용하시려면 GOOGLE AI STUDIO APIKEY가
              필요합니다. APIKEY는{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="font-bold underline decoration-2 hover:bg-cyan-500/30">
                  링크
                </span>
              </a>
              를 통해 발급받을 수 있습니다.
            </p>
          </div>
          <button
            className="w-full rounded-md border-2 px-2"
            onClick={onClearButtonClick}
            hidden={!currentApiKey}
          >
            저장된 apikey 삭제
          </button>
        </section>
      </div>
      <form onSubmit={onApiKeyFormSubmit} id="api-key-form"></form>
    </>
  );
};

export default SettingsPage;
