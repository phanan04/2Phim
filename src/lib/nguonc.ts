import { NGUONC_API } from "@/lib/constants";
import type { NguonCListResponse, NguonCFilmDetailResponse } from "@/types";

const FETCH_OPTIONS = { next: { revalidate: 1800 } } as const;

/** Danh sách phim mới cập nhật (mặc định trang 1) */
export async function getLatestNguonCFilms(page = 1): Promise<NguonCListResponse> {
    const res = await fetch(NGUONC_API.latestFilms(page), FETCH_OPTIONS);
    if (!res.ok) throw new Error(`NguonC API error: ${res.status}`);
    return res.json();
}

/** Chi tiết phim theo slug — bao gồm danh sách tập và link embed/m3u8 */
export async function getNguonCFilmDetail(slug: string): Promise<NguonCFilmDetailResponse> {
    const res = await fetch(NGUONC_API.filmDetail(slug), FETCH_OPTIONS);
    if (!res.ok) throw new Error(`NguonC film detail error: ${res.status}`);
    return res.json();
}

/** Tìm kiếm phim theo từ khóa */
export async function searchNguonCFilms(keyword: string, page = 1): Promise<NguonCListResponse> {
    const res = await fetch(NGUONC_API.search(keyword, page), FETCH_OPTIONS);
    if (!res.ok) throw new Error(`NguonC search error: ${res.status}`);
    return res.json();
}
