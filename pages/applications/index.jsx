// pages/applications/index.jsx
import React from "react";
import dynamic from "next/dynamic";

// отключаем SSR для безопасной работы с window/fetch, если нужно
const ApplicationsPage = dynamic(
    () => import("../../components/applications/ApplicationsPage"),
    { ssr: false }
);

export default function ApplicationsIndex() {
    return <ApplicationsPage />;
}
