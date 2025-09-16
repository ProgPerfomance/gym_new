// components/applications/ApplicationsPage.jsx
import React, { useEffect, useMemo, useState } from "react";

import SearchBar from "./SearchBar";
import ApplicationCard from "./ApplicationCard";
import EmptyState from "./EmptyState";
import styles from "./ApplicationsPage.module.css";
import {fetchApplications} from "@/api";

export default function ApplicationsPage() {
    const [apps, setApps] = useState([]);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const data = await fetchApplications();
                if (mounted) setApps(data);
            } catch (e) {
                if (mounted) setErr("Ошибка загрузки заявок");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => (mounted = false);
    }, []);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return apps;
        return apps.filter((a) => {
            const hay = [
                a?.tournamentName,
                a?.streamName,
                a?.applicantFullName,
                a?.phone,
                ...(Array.isArray(a?.participants)
                    ? a.participants.map((p) => p?.fullName)
                    : []),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return hay.includes(s);
        });
    }, [q, apps]);

    return (
        <div className={styles.page}>
            <div className={styles.topbar}>
                <h1 className={styles.h1}>Заявки на турниры</h1>
                <SearchBar
                    value={q}
                    onChange={setQ}
                    placeholder="Поиск по турниру, потоку, подающему, телефону или ФИО участника…"
                />
            </div>

            {loading && <div className={styles.state}>Загрузка…</div>}
            {err && !loading && <div className={styles.error}>{err}</div>}

            {!loading && !err && filtered.length === 0 && (
                <EmptyState text="По вашему запросу заявок не найдено" />
            )}

            {!loading && !err && filtered.length > 0 && (
                <div className={styles.grid}>
                    {filtered.map((item, idx) => (
                        <ApplicationCard key={idx} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}
