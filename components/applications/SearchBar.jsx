// components/applications/SearchBar.jsx
import React from "react";
import styles from "./SearchBar.module.css";

export default function SearchBar({ value, onChange, placeholder = "Поиск..." }) {
    return (
        <div className={styles.wrap}>
            <input
                className={styles.input}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
}
