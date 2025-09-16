// components/applications/ParticipantsTable.jsx
import React from "react";
import styles from "./ParticipantsTable.module.css";

function safe(v) {
    return (v ?? "").toString();
}

export default function ParticipantsTable({ participants = [] }) {
    if (!participants.length) {
        return <div className={styles.empty}>Участников нет</div>;
    }

    return (
        <div className={styles.tableWrap}>
            <table className={styles.table}>
                <thead>
                <tr>
                    <th>#</th>
                    <th>ФИО</th>
                    <th>Дата рождения</th>
                    <th>Город</th>
                    <th>Школа</th>
                    <th>Тренер</th>
                </tr>
                </thead>
                <tbody>
                {participants.map((p, idx) => (
                    <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{safe(p.fullName)}</td>
                        <td>{safe(p.birthDate)}</td>
                        <td>{safe(p.city)}</td>
                        <td>{safe(p.school)}</td>
                        <td>{safe(p.trainer)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
