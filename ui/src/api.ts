const API_BASE_URL = "http://localhost:5000";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit,
): Promise<ApiResponse<T>> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json();
    return { success: false, errors: errorData.errors };
  }

  const data = await response.json();
  return { success: true, data };
};
