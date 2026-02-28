"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import styles from "./tournament.module.css";

const API = "https://ketorry.ru:2017";

const APPARATUSES = ["Булавы", "Обруч", "Без предмета", "Лента", "Скакалка", "Мяч"];
const JUDGE_GROUPS = [
    { title: "Бригада ДВ", list: ["ДВ-1", "ДВ-2"] },
    { title: "Бригада ДА", list: ["ДА-1", "ДА-2"] },
    { title: "Бригада А", list: ["А-1", "А-2", "А-3", "А-4"] },
    { title: "Бригада Е", list: ["Е-1", "Е-2", "Е-3", "Е-4"] },
];

const TournamentPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        (async () => {
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
                    grades: Object.fromEntries(
                        Object.entries(
                            p.grades ||
                            JUDGE_GROUPS.flatMap((g) => g.list).reduce((acc, j) => ({ ...acc, [j]: null }), {})
                        ).map(([k, v]) => [k, typeof v === "string" ? parseFloat(v) || null : v])
                    ),

                    isNew: false,
                }));
                setParticipants(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const handleAdd = () =>
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
                grades: JUDGE_GROUPS.flatMap((g) => g.list).reduce((acc, j) => ({ ...acc, [j]: null }), {}),
                isNew: true,
            },
        ]);

    const handleChange = (pid, field, value) =>
        setParticipants((prev) => prev.map((p) => (p.id === pid ? { ...p, [field]: value } : p)));

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
            if (p.isNew || String(p.id).startsWith("temp_"))
                await axios.post(`${API}/tournaments/${id}/participants/add`, payload);
            else await axios.put(`${API}/tournaments/participants/${p.id}`, payload);
            alert("Сохранено");
        } catch (e) {
            console.error(e);
            alert("Ошибка сохранения");
        }
    };

    const handleDelete = async (pid) => {
        try {
            await axios.delete(`${API}/tournaments/participants/${pid}`);
            setParticipants((prev) => prev.filter((p) => p.id !== pid));
        } catch (e) {
            console.error(e);
            alert("Ошибка удаления");
        }
    };

    const handleSaveAll = async () => {
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
                if (p.isNew || String(p.id).startsWith("temp_"))
                    await axios.post(`${API}/tournaments/${id}/participants/add`, payload);
                else await axios.put(`${API}/tournaments/participants/${p.id}`, payload);
            }
            alert("Все изменения сохранены");
            router.reload();
        } catch (e) {
            console.error(e);
            alert("Ошибка сохранения всех участников");
        }
    };

    const calculateTotals = (grades) => {
        // Универсальный парсер
        const toNumber = (n) => {
            if (n === null || n === undefined || n === "") return 0;
            const val = typeof n === "string" ? parseFloat(n) : n;
            return isNaN(val) ? 0 : val;
        };

        const dw1 = toNumber(grades["ДВ-1"]);
        const dw2 = toNumber(grades["ДВ-2"]);
        const da1 = toNumber(grades["ДА-1"]);
        const da2 = toNumber(grades["ДА-2"]);

        const DВ = (dw1 + dw2) / 2;
        const DА = (da1 + da2) / 2;
        const D = (DВ + DА) / 2;

        // Подсчёт по А и Е — с усреднением без пропусков
        const calcArt = (keys) => {
            const arr = keys.map((k) => toNumber(grades[k]));
            const sorted = arr.sort((a, b) => a - b);
            // если все нули — возвращаем 0
            if (sorted.every((v) => v === 0)) return 0;
            const avg = (sorted[1] + sorted[2]) / 2;
            return +(10 - avg).toFixed(2);
        };

        const A = calcArt(["А-1", "А-2", "А-3", "А-4"]);
        const E = calcArt(["Е-1", "Е-2", "Е-3", "Е-4"]);

        const total = +(D + A + E).toFixed(3);

        return { DВ, DА, D, A, E, total };
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
                {participants.map((p) => {
                    const totals = calculateTotals(p.grades);
                    return (
                        <React.Fragment key={p.id}>
                            <tr>
                                <td><input value={p.name} onChange={(e)=>handleChange(p.id,"name",e.target.value)} className={styles.inputWide}/></td>
                                <td><input type="date" value={p.date_of_birth} onChange={(e)=>handleChange(p.id,"date_of_birth",e.target.value)} className={styles.input}/></td>
                                <td><input value={p.thread} onChange={(e)=>handleChange(p.id,"thread",e.target.value)} className={styles.input}/></td>
                                <td><input value={p.school} onChange={(e)=>handleChange(p.id,"school",e.target.value)} className={styles.inputWide}/></td>
                                <td><input value={p.mentor} onChange={(e)=>handleChange(p.id,"mentor",e.target.value)} className={styles.inputWide}/></td>
                                <td><input value={p.city} onChange={(e)=>handleChange(p.id,"city",e.target.value)} className={styles.inputWide}/></td>
                                <td>
                                    <select value={p.apparatus} onChange={(e)=>handleChange(p.id,"apparatus",e.target.value)} className={styles.input}>
                                        {APPARATUSES.map((a)=><option key={a}>{a}</option>)}
                                    </select>
                                </td>
                                <td><button className={styles.saveOne} onClick={()=>handleSaveOne(p)}>💾</button></td>
                                <td><button className={styles.delete} onClick={()=>handleDelete(p.id)}>✕</button></td>
                            </tr>
                            <tr>
                                <td colSpan={9} className={styles.gradesRow}>
                                    <div className={styles.gradesLine}>
                                        {JUDGE_GROUPS.flatMap((g) =>
                                            g.list.map((j) => (
                                                <div key={j} className={styles.gradeColumn}>
                                                    <h4 className={styles.columnTitle}>{j}</h4>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={p.grades[j] ?? ""}
                                                        onChange={(e) =>
                                                            handleChange(p.id, "grades", {
                                                                ...p.grades,
                                                                [j]:
                                                                    e.target.value === "" ? null : parseFloat(e.target.value),
                                                            })
                                                        }
                                                        className={styles.scoreInput}
                                                    />
                                                </div>
                                            ))
                                        )}

                                        <div className={styles.gradeColumn}>
                                            <h4 className={styles.columnTitle}>ДВ</h4>
                                            <p className={styles.scoreValue}>{totals.ДВ ?? "—"}</p>
                                        </div>
                                        <div className={styles.gradeColumn}>
                                            <h4 className={styles.columnTitle}>ДА</h4>
                                            <p className={styles.scoreValue}>{totals.ДА ?? "—"}</p>
                                        </div>
                                        <div className={styles.gradeColumn}>
                                            <h4 className={styles.columnTitle}>D</h4>
                                            <p className={styles.scoreValue}>{totals.D ?? "—"}</p>
                                        </div>
                                        <div className={styles.gradeColumn}>
                                            <h4 className={styles.columnTitle}>A</h4>
                                            <p className={styles.scoreValue}>{totals.A ?? "—"}</p>
                                        </div>
                                        <div className={styles.gradeColumn}>
                                            <h4 className={styles.columnTitle}>E</h4>
                                            <p className={styles.scoreValue}>{totals.E ?? "—"}</p>
                                        </div>
                                        <div className={styles.gradeColumn}>
                                            <h4 className={styles.columnTitle}>Итого</h4>
                                            <p className={`${styles.scoreValue} ${styles.total}`}>
                                                {totals.total ?? "—"}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </React.Fragment>
                    );
                })}
                </tbody>
            </table>

            <div className={styles.actions}>
                <button className={styles.add} onClick={handleAdd}>Добавить участника</button>
                <button className={styles.saveAll} onClick={handleSaveAll}>💾 Сохранить всех</button>
            </div>
        </div>
    );
};

export default TournamentPage;
