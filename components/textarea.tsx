"use client";

import { ChangeEvent, useEffect, useRef } from "react";

interface TextareaProps {
  placeholder: string;
  value: string;
  name?: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  tabIndex?: number;
  autoFocus: boolean;
  spellCheck: boolean;
  autoComplete: string;
  autoCorrect: string;
  ariaLabel: string;
  required: boolean;
}

export default function Textarea({
  placeholder,
  value,
  name,
  onChange,
  onKeyDown,
  tabIndex,
  autoFocus,
  spellCheck,
  autoComplete,
  autoCorrect,
  ariaLabel,
  required,
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      let lineHeight = parseFloat(
        getComputedStyle(textareaRef.current).lineHeight,
      );
      if (isNaN(lineHeight)) {
        // Fallback value when lineHeight is "normal"
        lineHeight =
          parseFloat(getComputedStyle(textareaRef.current).fontSize) * 1.2;
      }
      const maxHeight = lineHeight * 5;
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, maxHeight) + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      id="message"
      name={name}
      className="text-md w-full resize-none bg-transparent py-4 pl-3 pr-12 text-zinc-950 placeholder:text-zinc-300 dark:text-zinc-50 dark:placeholder:text-zinc-600"
      rows={1}
      inputMode={"text"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      autoFocus={autoFocus}
      spellCheck={spellCheck}
      autoComplete={autoComplete}
      autoCorrect={autoCorrect}
      aria-label={ariaLabel}
      required={required}
    />
  );
}
