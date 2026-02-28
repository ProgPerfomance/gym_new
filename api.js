// lib/api.js
import axios from "axios";

export const api = axios.create({
    baseURL: "https://ketorry.ru:2017",
    // при необходимости: timeout: 10000,
});

// Универсальный геттер заявок
export async function fetchApplications() {
    const { data } = await api.get("/applications");
    // ожидаем массив объектов, как в примере из Mongo
    return Array.isArray(data) ? data : [];
}
