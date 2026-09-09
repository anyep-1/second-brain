import { apiClient } from "@/lib/api-client";
import { CreateNoteInput,  Note, UpdateNoteInput } from "@/types/note";
import { DataResponse, MessageResponse } from "@/types/api";

const NOTES_ENDPOINT = "/api/notes";

export const noteService = {
    async getAll() {
        const response = await apiClient.get<DataResponse<Note[]>>(
            NOTES_ENDPOINT, 
            {
                cache: "no-store",
            },
        );
        return response.data;
    },
    async getById(id: string) {
        const response = await apiClient.get<DataResponse<Note>>(
            `${NOTES_ENDPOINT}/${id}`,
            {
                cache: "no-store",
            },
        );
        return response.data;
    },
    async create(input: CreateNoteInput) {
        const response = await apiClient.post<DataResponse<Note>, CreateNoteInput>(
            NOTES_ENDPOINT, input
        );
        return response.data;
    },
    async update(id: string, input: UpdateNoteInput) {
        const response = await apiClient.patch<DataResponse<Note>, UpdateNoteInput>(
            `${NOTES_ENDPOINT}/${id}`, input
        );
        return response.data;
    },
    async delete(id: string) {
        return apiClient.delete<MessageResponse>(
            `${NOTES_ENDPOINT}/${id}`,
        );
    },
};