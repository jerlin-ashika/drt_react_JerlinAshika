import axiosInstance from "../api/instance";

export const assetService = {
  getAll: (params) =>
    axiosInstance.get(
      `/satellites${
        params
          ? `?objectTypes=${params?.objectTypes}&attributes=${params?.attributes}`
          : ""
      }`
    ),
};
