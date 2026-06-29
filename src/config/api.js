export const API_BASE =
  import.meta.env.MODE === "development"
    ? "http://localhost:8080/api"
    : "https://webshop-backend-ejb6.onrender.com"
