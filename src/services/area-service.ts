import { apiClient } from "@/lib/api-client";
import { DataResponse, MessageResponse } from "@/types/api";
import { Area, CreateAreaInput, UpdateAreaInput } from "@/types/area";

const AREAS_ENDPOINT = "/api/areas";

export const areaService = {
    async getAll() {
        const response = await apiClient.get<DataResponse<Area[]>>(
            AREAS_ENDPOINT,
            {
                cache: "no-store",
            },
        );
        return response.data;
    },
    async getById(id: string) {
        const response = await apiClient.get<DataResponse<Area>>(
            `${AREAS_ENDPOINT}/${id}`,
            {
                cache: "no-store",
            },
        );
        return response.data;
    },
    async create(input: CreateAreaInput) {
        const response = await apiClient.post<DataResponse<Area>, CreateAreaInput>(
            AREAS_ENDPOINT, input,
        );
        return response.data;
    },
    async update(id: string, input: UpdateAreaInput) {
        const response = await apiClient.patch<DataResponse<Area>, UpdateAreaInput>(
            `${AREAS_ENDPOINT}/${id}`, input,
        );
        return response.data;
    },
    async delete(id: string) {
        await apiClient.delete<MessageResponse>(
            `${AREAS_ENDPOINT}/${id}`,
        );
    },
};