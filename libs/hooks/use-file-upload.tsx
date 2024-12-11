import { useRef, useState } from "react";

interface FileUpload {
  contentType: string;
  name: string;
  size: number;
  isUploading: boolean;
  url: string;
  downloadUrl: string;
  pathname: string;
  contentDisposition: string;
}

interface PutBlobResult {
  url: string;
  downloadUrl: string;
  pathname: string;
  contentDisposition: string;
}

export default function useFileUpload() {
  const [fileUpload, setFileUpload] = useState<FileUpload | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = inputFileRef.current?.files?.[0];
    if (file) {
      const newFile: FileUpload = {
        ...file,
        name: file.name,
        size: file.size,
        isUploading: true,
        url: "",
        downloadUrl: "",
        pathname: "",
        contentDisposition: "",
        contentType: ""
      };
      setFileUpload(newFile);
      const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: "POST",
        body: file,
      });

      const newBlob = (await response.json()) as PutBlobResult;
      const uploadedFile: FileUpload = {
        ...newBlob,
        name: file.name,
        size: file.size,
        isUploading: false,
        contentType: ""
      };
      setFileUpload(uploadedFile);
    }
  };
  return { fileUpload, setFileUpload, inputFileRef, handleFileUpload };
}
