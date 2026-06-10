import { useMutation } from "@tanstack/react-query";
import { Link, ShopItem, UserInfoItem, UserItem } from "@/types/global";
import apiInstance from "@/lib/axios";

export interface PutShopInfoRequest {
  shopId: string;
  data: ShopItem;
}

export type PutShopInfoResponse = {
  item: ShopItem & {
    user: {
      item: UserItem & Partial<UserInfoItem>;
      href: string;
    };
  };
  links: Link[];
};

const putShopInfo = async ({ shopId, data }: PutShopInfoRequest): Promise<PutShopInfoResponse> => {
  const response = await apiInstance.put(`/shops/${shopId}`, data);
  return response.data;
};

export const usePutShopInfoQuery = () => {
  return useMutation({
    mutationFn: putShopInfo,
  });
};
