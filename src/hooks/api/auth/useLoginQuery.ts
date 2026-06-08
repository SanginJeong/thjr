import { useRouter } from "next/router";
import { UserInfoItem, UserItem } from "@/types/global";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import apiInstance from "@/lib/axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  item: {
    token: string;
    user: {
      item: UserItem & UserInfoItem;
      href: string;
    };
  };
  links: [];
}

const postLogin = async ({ email, password }: LoginRequest): Promise<LoginResponse> => {
  const response = await apiInstance.post("/token", { email, password });
  return response.data;
};

export const useLoginQuery = () => {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: postLogin,
    onSuccess: (data) => {
      const { token, user } = data.item;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.item.id);
      localStorage.setItem("userType", user.item.type);
      refreshAuth();
      router.replace("/joblist");
    },
  });
  return { mutate, isError, isPending, error };
};
