import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './tournament.module.css';
import axios from 'axios';

const APPARATUSES = [
    "Булавы",
    "Обруч",
    "Без предмета",
    "Лента",
    "Скакалка",
    "Мяч"
];

const JUDGES = [
    "ДВ-1", "ДВ-2", "ДА-1", "ДА-2",
    "А-1", "А-2", "А-3", "А-4",
    "Е-1", "Е-2", "Е-3", "Е-4"
];

const TournamentPage = () => {
    const router = useRouter();
    const { id } = router.query;

    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    // загрузка участников при открытии
    useEffect(() => {
        if (!id) return;
        const fetchParticipants = async () => {
            try {
                const res = await axios.get(`https://mvpgarage.one:2017/tournaments/${id}/participants`);
                // нормализуем формат
                const loaded = res.data.map((p) => ({
                    id: p._id?.$oid || p._id, // mongo id
                    name: p.name || '',
                    date_of_birth: p.date_of_birth || '',
                    thread: p.thread || '',
                    school: p.school || '',
                    mentor: p.mentor || '',
                    city: p.city || '',
                    apparatus: p.apparatus || APPARATUSES[0],
                    grades: p.grades || JUDGES.reduce((acc, j) => ({ ...acc, [j]: null }), {}),
                }));
                setParticipants(loaded);
            } catch (err) {
                console.error('Ошибка загрузки участников:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchParticipants();
    }, [id]);

    const handleAdd = () => {
        setParticipants([
            ...participants,
            {
                id: Date.now(),
                name: '',
                date_of_birth: '',
                thread: '',
                school: '',
                mentor: '',
                city: '',
                apparatus: APPARATUSES[0],
                grades: JUDGES.reduce((acc, j) => ({ ...acc, [j]: null }), {}),
            },
        ]);
    };

    const handleChange = (pid, field, value) => {
        setParticipants((prev) =>
            prev.map((p) => (p.id === pid ? { ...p, [field]: value } : p))
        );
    };

    const handleDelete = (pid) => {
        setParticipants((prev) => prev.filter((p) => p.id !== pid));
    };

    const handleSave = async () => {
        try {
            for (const p of participants) {
                // если id mongo нет, значит новый
                if (String(p.id).length < 15) {
                    await axios.post(
                        `https://mvpgarage.one:2017/tournaments/${id}/participants/add`,
                        {
                            name: p.name,
                            date_of_birth: p.date_of_birth,
                            thread: p.thread,
                            school: p.school,
                            mentor: p.mentor,
                            city: p.city,
                            apparatus: p.apparatus,
                            grades: p.grades,
                        }
                    );
                }
            }
            alert('Сохранено');
            router.reload(); // перезагрузка страницы, чтобы подтянуть из базы
        } catch (err) {
            console.error('Ошибка сохранения:', err);
            alert('Ошибка при сохранении участников');
        }
    };

    if (loading) {
        return <div className={styles.container}>Загрузка...</div>;
    }

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
                    <th>Год</th>
                    <th>Тренер</th>
                    <th>Город</th>
                    <th>Предмет</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {participants.map((p) => (
                    <React.Fragment key={p.id}>
                        <tr>
                            <td>
                                <input
                                    value={p.name}
                                    onChange={(e) => handleChange(p.id, 'name', e.target.value)}
                                    className={styles.inputWide}
                                />
                            </td>
                            <td>
                                <input
                                    type="date"
                                    value={p.date_of_birth}
                                    onChange={(e) =>
                                        handleChange(p.id, 'date_of_birth', e.target.value)
                                    }
                                    className={styles.input}
                                />
                            </td>
                            <td>
                                <input
                                    value={p.thread}
                                    onChange={(e) => handleChange(p.id, 'thread', e.target.value)}
                                    className={styles.input}
                                />
                            </td>
                            <td>
                                <input
                                    value={p.school}
                                    onChange={(e) => handleChange(p.id, 'school', e.target.value)}
                                    className={styles.inputWide}
                                />
                            </td>
                            <td>
                                <p>{p.year ?? ""}</p>
                            </td>
                            <td>
                                <input
                                    value={p.mentor}
                                    onChange={(e) => handleChange(p.id, 'mentor', e.target.value)}
                                    className={styles.inputWide}
                                />
                            </td>
                            <td>
                                <input
                                    value={p.city}
                                    onChange={(e) => handleChange(p.id, 'city', e.target.value)}
                                    className={styles.inputWide}
                                />
                            </td>
                            <td>
                                <select
                                    value={p.apparatus}
                                    onChange={(e) =>
                                        handleChange(p.id, 'apparatus', e.target.value)
                                    }
                                    className={styles.input}
                                >
                                    {APPARATUSES.map((a) => (
                                        <option key={a} value={a}>
                                            {a}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <button
                                    type="button"
                                    className={styles.delete}
                                    onClick={() => handleDelete(p.id)}
                                >
                                    ✕
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={8} className={styles.gradesRow}>
                                <div className={styles.gradesContainer}>
                                    {JUDGES.map((j) => (
                                        <div key={j} className={styles.gradeItem}>
                                            <span className={styles.judge}>{j}:</span>
                                            <span className={styles.score}>
                          {p.grades[j] !== null ? p.grades[j] : '—'}
                        </span>
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
                <button type="button" className={styles.add} onClick={handleAdd}>
                    Добавить участника
                </button>
                <button type="button" className={styles.save} onClick={handleSave}>
                    Сохранить всех
                </button>
            </div>
        </div>
    );
};

export default TournamentPage;
