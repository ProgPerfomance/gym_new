// components/applications/ApplicationCard.jsx
import React, { useState } from "react";
import ParticipantsTable from "./ParticipantsTable";
import styles from "./ApplicationCard.module.css";

function getIdString(_id) {
    try {
        if (typeof _id === "string") return _id;
        if (_id && typeof _id.$oid === "string") return _id.$oid;
    } catch (_) {}
    return "";
}

// Опционально: извлекаем время создания из ObjectId (первые 4 байта — timestamp)
function getCreatedAtFromObjectId(oid) {
    if (!oid || oid.length < 8) return null;
    const tsHex = oid.substring(0, 8);
    const ts = parseInt(tsHex, 16);
    if (Number.isNaN(ts)) return null;
    return new Date(ts * 1000);
}

function fmtDate(d) {
    if (!d) return "";
    try {
        return new Intl.DateTimeFormat("ru-RU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).format(d);
    } catch {
        return "";
    }
}

export default function ApplicationCard({ item }) {
    const [open, setOpen] = useState(false);
    const oid = getIdString(item?._id);
    const createdAt = getCreatedAtFromObjectId(oid);

    const total = Array.isArray(item?.participants) ? item.participants.length : 0;

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.titleBlock}>
                    <div className={styles.title}>
                        {item?.tournamentName || "—"} <span className={styles.sep}>•</span>{" "}
                        {item?.streamName || "—"}
                    </div>
                    <div className={styles.meta}>
                        <span>Заявка: {oid || "—"}</span>
                        {createdAt && <span className={styles.dot}>•</span>}
                        {createdAt && <span>Создано: {fmtDate(createdAt)}</span>}
                    </div>
                </div>

                <div className={styles.stat}>
                    <span className={styles.badge}>{total} участ.</span>
                </div>
            </div>

            <div className={styles.applicant}>
                <div>
                    <div className={styles.label}>Подающий</div>
                    <div className={styles.value}>{item?.applicantFullName || "—"}</div>
                </div>
                <div>
                    <div className={styles.label}>Телефон</div>
                    <div className={styles.value}>{item?.phone || "—"}</div>
                </div>
            </div>

            <div className={styles.actions}>
                <button className={styles.btn} onClick={() => setOpen((v) => !v)}>
                    {open ? "Скрыть участников" : "Показать участников"}
                </button>
            </div>

            {open && <ParticipantsTable participants={item?.participants || []} />}
        </div>
    );
}
