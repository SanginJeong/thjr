import { useMutation } from "@tanstack/react-query";

export interface PutPresignedURLRequest {
  presignedURL: string;
  file: File;
}

const putPresignedURL = async ({ presignedURL, file }: PutPresignedURLRequest) => {
  const response = await fetch(presignedURL, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });
  return response;
};

export const usePutPresignedURLQuery = () => {
  return useMutation({
    mutationFn: putPresignedURL,
  });
};
