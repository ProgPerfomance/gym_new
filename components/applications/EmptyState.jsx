// components/applications/EmptyState.jsx
import React from "react";
import styles from "./EmptyState.module.css";

export default function EmptyState({ text = "Заявок не найдено" }) {
    return (
        <div className={styles.empty}>
            <div className={styles.emoji}>🗂️</div>
            <div className={styles.text}>{text}</div>
        </div>
    );
}
