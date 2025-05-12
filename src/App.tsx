import { memo, useCallback, useState } from "react";
import { GoogleGenAI } from "@google/genai";

const App = memo(() => {
  const [myApiKey, setApiKey] = useState<string>();
  const [bookInputCount, setBookInputCount] = useState<number>(1);
  const [geminiRes, setGeminiRes] = useState<string[]>([]);

  const onApiKeyFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      setApiKey(formData.get("api-key") as string);
    },
    []
  );

  const geminiReq = useCallback(
    async (msg: string) => {
      const ai = new GoogleGenAI({
        apiKey: myApiKey,
      });
      const config = {
        responseMimeType: "text/plain",
        systemInstruction: [
          {
            text: `한 번 요청이 들어가고 답변을 받아야 함. 다음 대화는 없음. 학교도서관용 서비스임.`,
          },
        ],
      };
      const model = "gemini-2.0-flash-lite";
      const contents = [
        {
          role: "user",
          parts: [
            {
              text: msg,
            },
          ],
        },
      ];

      const response = await ai.models.generateContentStream({
        model,
        config,
        contents,
      });
      for await (const chunk of response) {
        console.log(chunk.text);
        setGeminiRes((prev) => [...prev, chunk?.text ?? ""]);
      }
    },
    [myApiKey]
  );
  const onApiReqFormSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      try {
        e.preventDefault();
        if (!myApiKey) throw new Error("API키를 입력해주십시오.");
        const formData = new FormData(e.currentTarget);
        const userInfo: string = formData.get("api-req-user-info") as string;
        if (!userInfo) throw new Error("유저정보를 입력해주십시오.");
        const bookInfo: string[] = formData.getAll(
          "api-req-book-info"
        ) as string[];
        const userReq: string = formData.get("api-req-user-req") as string;
        if (!userReq) throw new Error("요청내용을 입력해주십시오.");
        console.log(userInfo, bookInfo, userReq);
        const msg = `다음 사용자가 읽을 만한 도서를 추천해줘 \n 사용자: ${userInfo} \n 최근 읽은 도서: ${bookInfo.flatMap(
          (book) => book
        )} \n 요청사항: ${userReq})  } `;
        setGeminiRes([""]);

        await geminiReq(msg);
      } catch (e) {
        if (e instanceof Error) {
          setGeminiRes([e.message]);
        } else {
          setGeminiRes(["ERROR"]);
        }
      }
    },
    [geminiReq, myApiKey]
  );
  return (
    <article className="space-y-2">
      <h1>DLS 도서추천 서비스 예시</h1>
      <section className="border-2 px-5">
        <h2>APIKEY</h2>
        <input
          placeholder={"API key 입력하고 입력버튼 누르십시오."}
          readOnly={true}
          defaultValue={myApiKey}
        ></input>
        <p>
          APIKEY는{" "}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
          >
            링크
          </a>
          를 통해 발급받을 수 있습니다.
        </p>
      </section>
      <section>
        <input
          placeholder="GOOGLE_AI_STUDIO_API_KEY"
          name="api-key"
          form="form-api-key"
          className="border-2"
        ></input>
        <button form="form-api-key" className="border-2" type="submit">
          입력
        </button>
      </section>

      <section className="border-2 p-4">
        <h2>요청</h2>
        <div className="flex flex-row grow">
          <label htmlFor="api-req-user-info">userInfo</label>
          <input
            name="api-req-user-info"
            form="form-api-req"
            className="border-2 grow "
            placeholder="유저정보(예: 중학교 2학년)"
          ></input>
        </div>
        <div className="flex flex-row grow">
          <label htmlFor="api-req-user-req">userReq</label>
          <input
            name="api-req-user-req"
            form="form-api-req"
            className="border-2 grow "
            placeholder="요청내용(예: 2학기 국어 수행평가용 도서 추천)"
          ></input>
        </div>
        <div className="flex flex-col space-y-2">
          <div>최근 읽은 도서</div>
          {Array.from({ length: bookInputCount }).map((_, index) => {
            return (
              <input
                className="border-2"
                key={`${index}-bookinfoInput`}
                form="form-api-req"
                name="api-req-book-info"
                placeholder="서명(저자) 예: 소년이 온다(한강)"
              ></input>
            );
          })}
          <button
            className="border-2"
            onClick={() => {
              setBookInputCount(bookInputCount + 1);
            }}
          >
            책 추가++
          </button>
        </div>

        <button
          className="rounded-md border-2 grow w-full bg-emerald-500/30 hover:bg-emerald-500/50"
          type="submit"
          form="form-api-req"
        >
          책 추천 받기
        </button>
      </section>
      <article className="border-2 px-5">
        <h2>GEMINI답변</h2>
        <pre className="font-sans whitespace-pre-wrap break-words">
          {geminiRes.map((res, index) => {
            return <span key={`${index}-geminiRes`}>{res}</span>;
          })}
        </pre>
      </article>

      <form id="form-api-key" onSubmit={onApiKeyFormSubmit}></form>
      <form id="form-api-req" onSubmit={onApiReqFormSubmit}></form>
    </article>
  );
});
export default App;
