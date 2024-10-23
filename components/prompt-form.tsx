import Textarea from "./textarea";
import Button from "./button";
import Spinner from "./spinner";

import { useAIState } from "ai/rsc";
import FileUploadCard, { FileUpload } from "@/components/file-upload-card";
import FileUploadButton from "@/components/file-upload-button";

interface PromptFormProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSubmit: (message: string) => void;
  isAtBottom: boolean;
  scrollToBottom: () => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  inputFileRef: React.RefObject<HTMLInputElement | null>;
  fileUpload: FileUpload | null;
  setFileUpload: (file: FileUpload | null) => void;
}

export default function PromptForm({
  inputValue,
  setInputValue,
  handleSubmit,
  handleFileUpload,
  isAtBottom,
  scrollToBottom,
  inputFileRef,
  fileUpload,
  setFileUpload,
}: PromptFormProps) {
  const [aiState] = useAIState();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <div className="fixed bottom-0 z-10 flex w-full flex-col items-center justify-center">
      {!isAtBottom && (
        <div className="relative inset-x-0 top-[-48px] mx-auto h-0 w-[42px] drop-shadow-sm">
          <Button
            rounded
            variant="secondary"
            onClick={() => {
              scrollToBottom();
            }}
            ariaLabel={"Scroll to bottom"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 2C7.77614 2 8 2.22386 8 2.5L8 11.2929L11.1464 8.14645C11.3417 7.95118 11.6583 7.95118 11.8536 8.14645C12.0488 8.34171 12.0488 8.65829 11.8536 8.85355L7.85355 12.8536C7.75979 12.9473 7.63261 13 7.5 13C7.36739 13 7.24021 12.9473 7.14645 12.8536L3.14645 8.85355C2.95118 8.65829 2.95118 8.34171 3.14645 8.14645C3.34171 7.95118 3.65829 7.95118 3.85355 8.14645L7 11.2929L7 2.5C7 2.22386 7.22386 2 7.5 2Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </Button>
        </div>
      )}
      <div className="relative bottom-0 flex w-full flex-col items-center justify-center bg-gradient-to-t from-white via-white to-transparent backdrop-blur-[1px] dark:from-zinc-950 dark:via-zinc-950">
        <div className="w-full space-y-3 px-3 pb-3 pt-2 md:mx-5 md:max-w-2xl">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              // Blur focus on mobile
              if (window.innerWidth < 600) {
                (event.target as HTMLFormElement)["message"]?.blur();
              }
              handleSubmit(inputValue);
            }}
            className="relative"
          >
            <div className="relative flex w-full grow flex-col overflow-hidden rounded-[1.75rem] border border-zinc-200/50 bg-zinc-100 pr-1 ring-slate-950/30 ring-offset-[3px] ring-offset-white transition focus-within:ring-[3px] has-[button:focus]:ring-0 dark:border-zinc-200/10 dark:bg-zinc-900 dark:ring-white/40 dark:ring-offset-zinc-950">
              {fileUpload && (
                <FileUploadCard
                  fileUpload={fileUpload}
                  setFileUpload={setFileUpload}
                />
              )}
              <div className="flex flex-row items-end">
                <FileUploadButton
                  inputFileRef={inputFileRef}
                  handleFileUpload={handleFileUpload}
                />
                <Textarea
                  placeholder="Send a message..."
                  value={inputValue}
                  name="message"
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={handleKeyDown}
                  tabIndex={0}
                  autoFocus
                  spellCheck={false}
                  autoComplete="on"
                  autoCorrect="on"
                  ariaLabel="message"
                  required={true}
                />
              </div>
              <div className="absolute bottom-[0.375rem] right-2">
                <Button
                  variant="secondary"
                  rounded
                  disabled={false}
                  ariaLabel="Send message"
                >
                  {aiState.isFinished ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 15 15"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M7.14645 2.14645C7.34171 1.95118 7.65829 1.95118 7.85355 2.14645L11.8536 6.14645C12.0488 6.34171 12.0488 6.65829 11.8536 6.85355C11.6583 7.04882 11.3417 7.04882 11.1464 6.85355L8 3.70711L8 12.5C8 12.7761 7.77614 13 7.5 13C7.22386 13 7 12.7761 7 12.5L7 3.70711L3.85355 6.85355C3.65829 7.04882 3.34171 7.04882 3.14645 6.85355C2.95118 6.65829 2.95118 6.34171 3.14645 6.14645L7.14645 2.14645Z"
                      />
                    </svg>
                  ) : (
                    <Spinner />
                  )}
                </Button>
              </div>
            </div>
          </form>
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            This chatbot can make mistakes. Check important info
          </p>
        </div>
      </div>
    </div>
  );
}
