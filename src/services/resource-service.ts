import { apiClient } from "@/lib/api-client";
import { DataResponse, MessageResponse } from "@/types/api";
import { CreateResourceInput, Resource, UpdateResourceInput } from "@/types/resource";

const RESOURCES_ENDPOINT = "/api/resources";

export const resourceService = {
    async getAll() {
        const response = await apiClient.get<DataResponse<Resource[]>>(
            RESOURCES_ENDPOINT,
            {
                cache: "no-store",
            },
        );

        return response.data;
    },

    async getById(id: string) {
        const response = await apiClient.get<DataResponse<Resource>>(
            `${RESOURCES_ENDPOINT}/${id}`,
            {
                cache: "no-store",
            },
        );

        return response.data;
    },

    async create(input: CreateResourceInput) {
        const response = await apiClient.post<DataResponse<Resource>, CreateResourceInput>(
            RESOURCES_ENDPOINT, input
        );

        return response.data;
    },

    async update(id: string, input: UpdateResourceInput) {
        const response = await apiClient.patch<DataResponse<Resource>, UpdateResourceInput>(
            `${RESOURCES_ENDPOINT}/${id}`, input,
        );

        return response.data;
    },

    async delete(id: string) {
        await apiClient.delete<MessageResponse>(
            `${RESOURCES_ENDPOINT}/${id}`,
        );
    },
};