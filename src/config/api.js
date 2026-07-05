export const API_BASE =
  import.meta.env.MODE === "development"
    ? "http://localhost:8080/api"
    : "ec-site-backend-production.up.railway.app"
