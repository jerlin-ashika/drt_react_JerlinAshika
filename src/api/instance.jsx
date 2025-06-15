import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://backend.digantara.dev/v1",
  headers: {
    Accept: "application/json",
  },
});

export default axiosInstance;
