import { apiClient } from "@/lib/api-client";
import { DataResponse, MessageResponse } from "@/types/api";
import { CreateProjectInput, Project, UpdateProjectInput } from "@/types/project";

const PROJECT_ENDPOINT = "/api/projects";

export const projectService = {
    async getAll() {
        const response = await apiClient.get<DataResponse<Project[]>>(
            PROJECT_ENDPOINT,
            {
                cache: "no-store",
            },
        );
        return response.data;
    },
    async getById(id: string) {
        const response = await apiClient.get<DataResponse<Project>>(
            `${PROJECT_ENDPOINT}/${id}`,
            {
                cache: "no-store",
            },
        );
        return response.data;
    },
    async create(input: CreateProjectInput) {
        const response = await apiClient.post<DataResponse<Project>, CreateProjectInput>(
            PROJECT_ENDPOINT, input,
        );
        return response.data;
    },
    async update(id: string, input: UpdateProjectInput) {
        const response = await apiClient.patch<DataResponse<Project>, UpdateProjectInput>(
            `${PROJECT_ENDPOINT}/${id}`, input,
        );
        return response.data;
    },
    async delete(id: string) {
        return apiClient.delete<DataResponse<MessageResponse>>(
            `${PROJECT_ENDPOINT}/${id}`,
        );
    }
}