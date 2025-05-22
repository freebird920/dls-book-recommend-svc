import { Fragment, memo, useCallback, useState } from "react";
import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";
import ReactMarkdown from "react-markdown";

//types
type GeminiModelValue =
  | "gemini-2.0-flash"
  | "gemini-2.0-flash-lite"
  | "gemini-2.5-flash-preview-05-20";

const App = memo(() => {
  const [myApiKey, setApiKey] = useState<string>(import.meta.env.VITE_API_KEY);
  const [bookInputCount, setBookInputCount] = useState<number>(1);
  const [geminiRes, setGeminiRes] = useState<string[]>([
    "책을 추천 받아 보십시오.",
  ]);
  const [geminiModel, setGeminiModel] = useState<GeminiModelValue>(
    "gemini-2.5-flash-preview-05-20",
  );

  // useCallback

  const handleModelChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setGeminiModel(
        event.target.value as GeminiModelValue /* as GeminiModelValue */,
      );
    },
    [setGeminiModel],
  );

  const onApiKeyFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      setApiKey(formData.get("api-key") as string);
    },
    [],
  );

  const geminiReq = useCallback(
    async (msg: string) => {
      const ai = new GoogleGenAI({
        apiKey: myApiKey,
      });
      const tools = [{ googleSearch: {} }];
      const config = {
        maxOutputTokens: 2000,
        responseMimeType: "text/plain",
        thinkingConfig: {
          thinkingBudget: 0,
        },
        tools,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, // Block some
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, // Block some
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, // Block some
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, // Block some
          },
        ],
        systemInstruction: [
          {
            text: `
              * **IMPORTANT** Language: Korean.\n
              * **IMPORTANT** You must recommend for book that is fit for School Library of Republic of Korea. \n 
              * **IMPORTANT** Cross check with google search for check if the book is in the real world and it is published in Republic of Korea.\n
              * You can only reply once and you never receive next message from user. \n
              * This service is for School Library in Republic of Korea.\n
              * When you determine User's literacy level, Consider the User's reading history.\n 
              * Must consider the User's requirement. \n 
              * You must state Author with Title \n 
              * Do not recommend books that are in the User's Reading History. \n
              * When you recommend books, the number of books is about 3~5. \n 
              * When you recommend a translated book, You must state the Korean Title of the book. \n 
              `,
          },
        ],
      };
      const model = geminiModel;
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
    [myApiKey, geminiModel],
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
          "api-req-book-info",
        ) as string[];
        const userReq: string = formData.get("api-req-user-req") as string;
        if (!userReq) throw new Error("요청내용을 입력해주십시오.");
        console.log(userInfo, bookInfo, userReq);
        const msg = `Recommend some books for User. \n UserInfo: ${userInfo} \n Reading History: ${bookInfo.flatMap(
          (book) => book,
        )} \n User Need: ${userReq}  } `;
        setGeminiRes(["**CurrentModel**: ", geminiModel, "\n\n"]);

        await geminiReq(msg);
      } catch (e) {
        if (e instanceof Error) {
          setGeminiRes([e.message]);
        } else {
          setGeminiRes(["ERROR"]);
        }
      }
    },
    [geminiReq, myApiKey, geminiModel],
  );

  return (
    <Fragment>
      <div className="@container">
        <article className="mx-auto max-w-2xl space-y-6 p-4">
          <h1 className="text-center font-extrabold">
            울산중앙중학교봉우리글숲도서관책추!
          </h1>
          <p className="text-center text-xs text-neutral-500/30">
            AI가 책을 추천해줄 수 있을 리 없잖아, 무리무리!(※무리가 아니었다?!)
          </p>
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
          <section className="flex flex-col space-y-3 rounded-md border-2 px-5 py-2">
            <h2 className="text-center text-lg font-bold">GEMINI SETTINGS</h2>
            <h3 className="text-center font-bold">Api key Settings</h3>
            <section className="flex space-x-2">
              <input
                placeholder="GOOGLE_AI_STUDIO_API_KEY"
                type="text"
                name="api-key"
                defaultValue={import.meta.env.VITE_API_KEY}
                form="form-api-key"
                className="grow rounded-md border-2"
              ></input>
              <button
                form="form-api-key"
                className="rounded-md border-2 px-2"
                type="submit"
              >
                입력
              </button>
            </section>
            <input
              className="grow rounded-md border-2"
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
                <span className="font-bold underline decoration-2 hover:bg-cyan-500/30">
                  링크
                </span>
              </a>
              를 통해 발급받을 수 있습니다.
            </p>
            <h3 className="text-center font-bold">Model Select</h3>
            <section className="mx-auto flex flex-row justify-between space-x-6">
              <div>
                <input
                  type="radio"
                  id="model-25-flash" // label과 연결할 id
                  name="geminiModelChoice" // 그룹화를 위한 동일한 name
                  value="gemini-2.5-flash-preview-05-20" // 이 옵션의 값
                  checked={geminiModel === "gemini-2.5-flash-preview-05-20"} // 상태와 비교하여 checked 제어
                  onChange={handleModelChange} // onChange 이벤트 사용
                />
                <label htmlFor="model-25-flash" className="">
                  gemini-2.5-flash-preview-05-20
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id="model-flash" // label과 연결할 id
                  name="geminiModelChoice" // 그룹화를 위한 동일한 name
                  value="gemini-2.0-flash" // 이 옵션의 값
                  checked={geminiModel === "gemini-2.0-flash"} // 상태와 비교하여 checked 제어
                  onChange={handleModelChange} // onChange 이벤트 사용
                />
                <label htmlFor="model-flash" className="">
                  Gemini 2.0 Flash
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id="model-flash-lite"
                  name="geminiModelChoice" // 그룹화를 위한 동일한 name
                  value="gemini-2.0-flash-lite"
                  checked={geminiModel === "gemini-2.0-flash-lite"} // 상태와 비교하여 checked 제어
                  onChange={handleModelChange}
                />
                <label htmlFor="model-flash-lite" className="">
                  Gemini 2.0 Flash Lite
                </label>
              </div>
            </section>
          </section>

          <section className="space-y-2 border-2 p-4">
            <h2>요청</h2>
            <div className="flex grow flex-row space-x-2">
              <label htmlFor="api-req-user-info">userInfo</label>
              <input
                name="api-req-user-info"
                form="form-api-req"
                className="grow rounded-md border-2"
                placeholder="유저정보(예: 중학교 2학년)"
              ></input>
            </div>
            <div className="flex grow flex-row space-x-2">
              <label htmlFor="api-req-user-req">userReq</label>
              <input
                name="api-req-user-req"
                form="form-api-req"
                className="grow rounded-md border-2"
                placeholder="요청내용(예: 2학기 국어 수행평가용 도서 추천)"
              ></input>
            </div>
            <div className="flex flex-col space-y-2">
              <div>최근 읽은 도서</div>
              {Array.from({ length: bookInputCount }).map((_, index) => {
                return (
                  <input
                    className="rounded-md border-2"
                    key={`${index}-bookinfoInput`}
                    form="form-api-req"
                    name="api-req-book-info"
                    placeholder="서명(저자) 예: 소년이 온다(한강)"
                  ></input>
                );
              })}
              <button
                className="rounded-md border-2 hover:bg-amber-500/20"
                onClick={() => {
                  setBookInputCount(bookInputCount + 1);
                }}
              >
                책 추가++
              </button>
            </div>
            <div>
              <button
                className="w-full grow rounded-md border-2 bg-emerald-500/30 hover:bg-emerald-500/50"
                type="submit"
                form="form-api-req"
              >
                책 추천 받기
              </button>
            </div>
          </section>
          <section className="border-2 px-5">
            <h2 className="text-center font-bold">GEMINI답변</h2>

            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{geminiRes.join("")}</ReactMarkdown>
            </div>
          </section>

          <form id="form-api-key" onSubmit={onApiKeyFormSubmit}></form>
          <form id="form-api-req" onSubmit={onApiReqFormSubmit}></form>
        </article>
      </div>
    </Fragment>
  );
});
export default App;
