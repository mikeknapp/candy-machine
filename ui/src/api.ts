export const API_BASE_URL = "http://localhost:5000";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> => {
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  };
  options = { ...defaultOptions, ...options };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json();
    return { success: false, errors: errorData.errors };
  }

  const data = await response.json();
  return { success: true, data };
};

export const eventRequest = async (
  endpoint: string,
  onMessage: (msg: string) => void,
): Promise<boolean> => {
  const eventSource = new EventSource(`${API_BASE_URL}${endpoint}`);

  eventSource.onmessage = (event) => {
    onMessage(event.data);
  };

  // Return a promise that resolves when the event source is closed.
  return new Promise(async (resolve) => {
    // Also, log any errors.
    eventSource.onerror = (event) => {
      if (eventSource.readyState === EventSource.CLOSED) {
        resolve(true);
        return;
      }
      console.error("EventSource failed:", event);
      eventSource.close();
      resolve(false);
    };
  });
};
