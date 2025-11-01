"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import styles from "./tournament.module.css";

const API = "https://mvpgarage.one:2017";

const APPARATUSES = [
    "Булавы",
    "Обруч",
    "Без предмета",
    "Лента",
    "Скакалка",
    "Мяч",
];

const JUDGES = [
    "ДВ-1", "ДВ-2", "ДА-1", "ДА-2",
    "А-1", "А-2", "А-3", "А-4",
    "Е-1", "Е-2", "Е-3", "Е-4",
];

const TournamentPage = () => {
    const router = useRouter();
    const { id } = router.query;

    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    // ============================
    // 📦 Загрузка участников
    // ============================
    useEffect(() => {
        if (!id) return;
        const load = async () => {
            try {
                const res = await axios.get(`${API}/tournaments/${id}/participants`);
                const data = res.data.map((p) => ({
                    id: p._id?.$oid || p._id,
                    name: p.name || "",
                    date_of_birth: p.date_of_birth || "",
                    thread: p.thread || "",
                    school: p.school || "",
                    mentor: p.mentor || "",
                    city: p.city || "",
                    apparatus: p.apparatus || APPARATUSES[0],
                    grades:
                        p.grades ||
                        JUDGES.reduce((acc, j) => ({ ...acc, [j]: null }), {}),
                }));
                setParticipants(data);
            } catch (err) {
                console.error("Ошибка загрузки:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    // ============================
    // ➕ Добавить участника
    // ============================
    const handleAdd = () => {
        setParticipants((prev) => [
            ...prev,
            {
                id: `temp_${Date.now()}`,
                name: "",
                date_of_birth: "",
                thread: "",
                school: "",
                mentor: "",
                city: "",
                apparatus: APPARATUSES[0],
                grades: JUDGES.reduce((acc, j) => ({ ...acc, [j]: null }), {}),
                isNew: true,
            },
        ]);
    };

    // ============================
    // ✏️ Изменение значения поля
    // ============================
    const handleChange = (pid, field, value) => {
        setParticipants((prev) =>
            prev.map((p) => (p.id === pid ? { ...p, [field]: value } : p))
        );
    };

    // ============================
    // 💾 Сохранить изменения одного участника
    // ============================
    const handleSaveOne = async (p) => {
        const payload = {
            name: p.name,
            date_of_birth: p.date_of_birth,
            thread: p.thread,
            school: p.school,
            mentor: p.mentor,
            city: p.city,
            apparatus: p.apparatus,
            grades: p.grades,
        };

        try {
            if (p.isNew || String(p.id).startsWith("temp_")) {
                await axios.post(`${API}/tournaments/${id}/participants/add`, payload);
            } else {
                await axios.put(`${API}/tournaments/participants/${p.id}`, payload);
            }
            alert("Сохранено");
        } catch (err) {
            console.error("Ошибка сохранения:", err);
            alert("Ошибка при сохранении");
        }
    };

    // ============================
    // 🗑 Удалить участника
    // ============================
    const handleDelete = async (pid) => {
        // if (!confirm("Удалить участника?")) return;

        try {
                await axios.delete(`${API}/tournaments/participants/${pid}`);
            setParticipants((prev) => prev.filter((p) => p.id !== pid));
        } catch (err) {
            console.error("Ошибка удаления:", err);
            alert("Ошибка при удалении");
        }
    };

    if (loading) return <div className={styles.container}>Загрузка...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Участники турнира {id}</h1>

            <table className={styles.table}>
                <thead>
                <tr>
                    <th>ФИО</th>
                    <th>Дата рождения</th>
                    <th>Поток</th>
                    <th>Школа</th>
                    <th>Тренер</th>
                    <th>Город</th>
                    <th>Предмет</th>
                    <th colSpan={2}>Действия</th>
                </tr>
                </thead>
                <tbody>
                {participants.map((p) => (
                    <React.Fragment key={p.id}>
                        <tr>
                            <td>
                                <input
                                    value={p.name}
                                    onChange={(e) => handleChange(p.id, "name", e.target.value)}
                                    className={styles.inputWide}
                                />
                            </td>
                            <td>
                                <input
                                    type="date"
                                    value={p.date_of_birth}
                                    onChange={(e) =>
                                        handleChange(p.id, "date_of_birth", e.target.value)
                                    }
                                    className={styles.input}
                                />
                            </td>
                            <td>
                                <input
                                    value={p.thread}
                                    onChange={(e) =>
                                        handleChange(p.id, "thread", e.target.value)
                                    }
                                    className={styles.input}
                                />
                            </td>
                            <td>
                                <input
                                    value={p.school}
                                    onChange={(e) =>
                                        handleChange(p.id, "school", e.target.value)
                                    }
                                    className={styles.inputWide}
                                />
                            </td>
                            <td>
                                <input
                                    value={p.mentor}
                                    onChange={(e) =>
                                        handleChange(p.id, "mentor", e.target.value)
                                    }
                                    className={styles.inputWide}
                                />
                            </td>
                            <td>
                                <input
                                    value={p.city}
                                    onChange={(e) =>
                                        handleChange(p.id, "city", e.target.value)
                                    }
                                    className={styles.inputWide}
                                />
                            </td>
                            <td>
                                <select
                                    value={p.apparatus}
                                    onChange={(e) =>
                                        handleChange(p.id, "apparatus", e.target.value)
                                    }
                                    className={styles.input}
                                >
                                    {APPARATUSES.map((a) => (
                                        <option key={a}>{a}</option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <button
                                    className={styles.saveOne}
                                    onClick={() => handleSaveOne(p)}
                                >
                                    💾
                                </button>
                            </td>
                            <td>
                                <button
                                    className={styles.delete}
                                    onClick={() => handleDelete(p.id)}
                                >
                                    ✕
                                </button>
                            </td>
                        </tr>

                        <tr>
                            <td colSpan={9} className={styles.gradesRow}>
                                <div className={styles.gradesContainer}>
                                    {JUDGES.map((j) => (
                                        <div key={j} className={styles.gradeItem}>
                                            <span className={styles.judge}>{j}:</span>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={p.grades[j] ?? ""}
                                                onChange={(e) =>
                                                    handleChange(p.id, "grades", {
                                                        ...p.grades,
                                                        [j]:
                                                            e.target.value === ""
                                                                ? null
                                                                : parseFloat(e.target.value),
                                                    })
                                                }
                                                className={styles.scoreInput}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </td>
                        </tr>
                    </React.Fragment>
                ))}
                </tbody>
            </table>
            <div className={styles.actions}>
                <button className={styles.add} onClick={handleAdd}>
                    Добавить участника
                </button>
                <button className={styles.saveAll} onClick={async () => {
                    try {
                        for (const p of participants) {
                            const payload = {
                                name: p.name,
                                date_of_birth: p.date_of_birth,
                                thread: p.thread,
                                school: p.school,
                                mentor: p.mentor,
                                city: p.city,
                                apparatus: p.apparatus,
                                grades: p.grades,
                            };

                            if (p.isNew || String(p.id).startsWith("temp_")) {
                                await axios.post(`${API}/tournaments/${id}/participants/add`, payload);
                            } else {
                                await axios.put(`${API}/tournaments/participants/${p.id}`, payload);
                            }
                        }
                        alert("Все изменения сохранены");
                        router.reload();
                    } catch (err) {
                        console.error("Ошибка при сохранении всех:", err);
                        alert("Ошибка при сохранении всех участников");
                    }
                }}>
                    💾 Сохранить всех
                </button>
            </div>
        </div>
    );
};

export default TournamentPage;
