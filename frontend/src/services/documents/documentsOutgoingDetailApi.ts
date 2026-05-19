import { apiGet } from "../core/apiClient";

export type OutgoingDetail = {
  id: number;
  soKyHieu?: string;
  trichYeu: string;
  loaiVanBanId?: number;
  nguoiKy?: string;
  ngayVanBan?: string;
  doMat?: string;
  doKhan?: string;
  donViChuTriId?: number;
  trangThai?: number;
  daKySo?: boolean;
};

export const fetchOutgoingDetail = (id: number) =>
  apiGet<OutgoingDetail>(`/api/documents/outgoing/${id}`);
