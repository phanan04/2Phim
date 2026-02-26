import { KKPHIM_API, KKPHIM_IMG } from "@/lib/constants";
import type { KKPhimListResponse } from "@/types";

export { KKPHIM_IMG };

const FETCH_OPTIONS = { next: { revalidate: 1800 } } as const;

/**
 * Danh sách phim mới cập nhật từ KKPhim (phimapi.com).
 * KKPhim cung cấp API công khai tại phimapi.com — cùng schema với OPhim.
 */
export async function getLatestKKPhimFilms(page = 1): Promise<KKPhimListResponse> {
    const res = await fetch(KKPHIM_API.latestFilms(page), FETCH_OPTIONS);
    if (!res.ok) throw new Error(`KKPhim API error: ${res.status}`);
    return res.json();
}

/** Tìm kiếm phim theo từ khóa */
export async function searchKKPhimFilms(keyword: string, page = 1): Promise<KKPhimListResponse> {
    const res = await fetch(KKPHIM_API.search(keyword, page), FETCH_OPTIONS);
    if (!res.ok) throw new Error(`KKPhim search error: ${res.status}`);
    return res.json();
}
