import { useMutation } from "@tanstack/react-query";
import { AlertItem, ApplicationItem, ShopItem, NoticeItem, Link } from "@/types/global";
import apiInstance from "@/lib/axios";

export interface PutUserAlertsRequest {
  userId: string;
  alertId: string;
}

export interface PutUserAlertsResponse {
  offset: number;
  limit: number;
  count: number;
  hasNext: boolean;
  items: Array<{
    item: AlertItem & {
      application: {
        item: Omit<ApplicationItem, "createdAt">;
        href: string;
      };
      shop: {
        item: ShopItem;
        href: string;
      };
      notice: {
        item: NoticeItem;
        href: string;
      };
      links: Link[];
    };
    links: Link[];
  }>;
}

const putUserAlerts = async ({ userId, alertId }: PutUserAlertsRequest): Promise<PutUserAlertsResponse> => {
  const response = await apiInstance.put(`/users/${userId}/alerts/${alertId}`);
  return response.data;
};

export const usePutUserAlertsQuery = () => {
  return useMutation({
    mutationFn: putUserAlerts,
    onSuccess: (res) => console.log(res),
    onError: (err) => console.log(err),
  });
};
