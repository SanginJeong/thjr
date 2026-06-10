import { useMutation } from "@tanstack/react-query";
import { Link } from "@/types/global";
import apiInstance from "@/lib/axios";

export interface PostPresignedURLRequest {
  name: string; // "example.jpg, example.png 처럼 업로드 파일의 이름"
}

export interface PostPresignedURLResponse {
  item: {
    url: string;
  };
  links: Link[];
}

const postPresignedURL = async ({ name }: PostPresignedURLRequest): Promise<PostPresignedURLResponse> => {
  const response = await apiInstance.post("/images", { name });
  return response.data;
};

export const usePostPresignedURLQuery = () => {
  return useMutation({
    mutationFn: postPresignedURL,
  });
};
