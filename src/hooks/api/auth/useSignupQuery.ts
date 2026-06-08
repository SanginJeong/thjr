import { useMutation } from "@tanstack/react-query";
import { Link, UserItem, UserType } from "@/types/global";
import apiInstance from "@/lib/axios";

export interface SignupRequest {
  email: string;
  password: string;
  type: UserType;
}

export interface SignupResponse {
  item: UserItem;
  links: Link[];
}

const postSignup = async ({ email, password, type }: SignupRequest): Promise<SignupResponse> => {
  const response = await apiInstance.post("/users", { email, password, type });
  return response.data;
};

export const useSignupQuery = () => {
  return useMutation({
    mutationFn: postSignup,
  });
};
