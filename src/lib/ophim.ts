import { OPHIM_API, OPHIM_IMG } from "@/lib/constants";
import type { OPhimListResponse } from "@/types";

export { OPHIM_IMG };

const FETCH_OPTIONS = { next: { revalidate: 1800 } } as const;

/** Danh sách phim mới cập nhật (mặc định trang 1) */
export async function getLatestOPhimFilms(page = 1): Promise<OPhimListResponse> {
    const res = await fetch(OPHIM_API.latestFilms(page), FETCH_OPTIONS);
    if (!res.ok) throw new Error(`OPhim API error: ${res.status}`);
    return res.json();
}

/** Tìm kiếm phim theo từ khóa */
export async function searchOPhimFilms(keyword: string, page = 1): Promise<OPhimListResponse> {
    const res = await fetch(OPHIM_API.search(keyword, page), FETCH_OPTIONS);
    if (!res.ok) throw new Error(`OPhim search error: ${res.status}`);
    return res.json();
}
