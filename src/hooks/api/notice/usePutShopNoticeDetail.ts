import { useMutation } from "@tanstack/react-query";
import { Link, NoticeItem, ShopItem } from "@/types/global";
import apiInstance from "@/lib/axios";

export interface PutShopNoticeDetailRequest {
  shopId: string;
  noticeId: string;
  data: {
    hourlyPay: number;
    startsAt: string;
    workhour: number;
    description: string;
  };
}

export interface PutShopNoticeDetailResponse {
  item: NoticeItem & {
    shop: {
      item: ShopItem;
      href: string;
    };
  };
  links: Link[];
}

const putShopNoticeDetail = async ({
  shopId,
  noticeId,
  data,
}: PutShopNoticeDetailRequest): Promise<PutShopNoticeDetailResponse> => {
  const response = await apiInstance.put(`/shops/${shopId}/notices/${noticeId}`, data);
  return response.data;
};

export const usePutShopNoticeDetailQuery = () => {
  return useMutation({
    mutationFn: putShopNoticeDetail,
  });
};
