type FileUploadButtonProps = {
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  inputFileRef: React.RefObject<HTMLInputElement | null>;
};

export default function FileUploadButton({
  inputFileRef,
  handleFileUpload,
}: FileUploadButtonProps) {
  return (
    <div className="mb-3 ml-3">
      <label
        htmlFor="file"
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="5.25"
            y="0.5"
            width="1.5"
            height="11"
            rx="0.75"
            fill="currentColor"
          />
          <rect
            x="11.5"
            y="5.25"
            width="1.5"
            height="11"
            rx="0.75"
            transform="rotate(90 11.5 5.25)"
            fill="currentColor"
          />
        </svg>
        <input
          className="hidden"
          type="file"
          ref={inputFileRef}
          aria-label="Upload file"
          id="file"
          name="file"
          accept=".png, .jpeg, .jpg, .gif, .webp"
          onChange={handleFileUpload}
        />
      </label>
    </div>
  );
}
