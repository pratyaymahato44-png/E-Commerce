import axios from "axios";
import * as Sentry from "@sentry/react";

const raw = import.meta.env.VITE_API_URL;

const base =
  typeof raw === "string"
    ? raw.replace(/\/+$/, "")
    : "";

export async function apiFetch(path, options = {}) {
  const { getToken, method = "GET", body } = options;

  const headers = {
    "Content-Type": "application/json",
  };

  if (getToken) {
    const token = await getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    const response = await axios({
      url: `${base}${path}`,
      method,
      headers,
      data: body,
    });

    Sentry.addBreadcrumb({
      category: "api",
      message: `${method} ${path}`,
      level: "info",
      data: {
        status: response.status,
      },
    });

    return response.data;

  } catch (error) {
    const status = error.response?.status;

    Sentry.addBreadcrumb({
      category: "api",
      message: `${method} ${path}`,
      level: "error",
      data: {
        status,
        network: !error.response,
      },
    });

    // Report only network and server errors to Sentry
    if (!error.response || status >= 500) {
      Sentry.captureException(error, {
        tags: {
          "api.fetch": error.response ? "http" : "network",
          "http.status": status ? String(status) : "unknown",
        },
        extra: {
          path,
          method,
          status,
        },
      });
    }

    throw error;
  }
}