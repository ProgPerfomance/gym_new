import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './judge.module.css';

const JUDGES = [
    "ДВ-1", "ДВ-2", "ДА-1", "ДА-2",
    "А-1", "А-2", "А-3", "А-4",
    "Е-1", "Е-2", "Е-3", "Е-4"
];

const JudgePage = () => {
    const [judge, setJudge] = useState('');
    const [tournaments, setTournaments] = useState([]);
    const [selectedTour, setSelectedTour] = useState('');
    const [participants, setParticipants] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [score, setScore] = useState('');

    // загрузка турниров
    useEffect(() => {
        const fetchTours = async () => {
            try {
                const res = await axios.get('https://ketorry.ru:2017/tournaments');
                setTournaments(res.data);
            } catch (e) {
                console.error('Ошибка при загрузке турниров', e);
            }
        };
        fetchTours();
    }, []);

    // загрузка участников при выборе турнира
    useEffect(() => {
        if (!selectedTour) return;
        const fetchParticipants = async () => {
            try {
                const res = await axios.get(
                    `https://ketorry.ru:2017/tournaments/${selectedTour}/participants`
                );
                setParticipants(res.data);
            } catch (e) {
                console.error('Ошибка при загрузке участников', e);
            }
        };
        fetchParticipants();
    }, [selectedTour]);

    const handleSaveScore = async () => {
        if (!selectedParticipant || !judge) return;

        try {
            await axios.post(`https://ketorry.ru:2017/judge/set-score`, {
                participantId: selectedParticipant._id.$oid || selectedParticipant._id,
                judge,
                score,
            });

            alert(`Оценка ${score} сохранена для ${selectedParticipant.name}`);

            // обновляем список после сохранения
            const res = await axios.get(
                `https://ketorry.ru:2017/tournaments/${selectedTour}/participants`
            );
            setParticipants(res.data);

            setSelectedParticipant(null);
            setScore('');
        } catch (e) {
            console.error('Ошибка при сохранении оценки:', e);
            alert('Не удалось сохранить оценку');
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Интерфейс судьи</h1>

            <div className={styles.selector}>
                <label>Кто вы:</label>
                <select
                    value={judge}
                    onChange={(e) => setJudge(e.target.value)}
                    className={styles.select}
                >
                    <option value="">Выберите судью</option>
                    {JUDGES.map((j) => (
                        <option key={j} value={j}>
                            {j}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.selector}>
                <label>Выберите турнир:</label>
                <select
                    value={selectedTour}
                    onChange={(e) => setSelectedTour(e.target.value)}
                    className={styles.select}
                >
                    <option value="">—</option>
                    {tournaments.map((t) => (
                        <option key={t._id.$oid || t._id} value={t._id.$oid || t._id}>
                            {t.name} ({t.date})
                        </option>
                    ))}
                </select>
            </div>

            {selectedTour && judge && (
                <div className={styles.participants}>
                    <h2>Участники</h2>
                    <ul className={styles.list}>
                        {participants.map((p) => {
                            const id = p._id.$oid || p._id;
                            const currentScore = p.grades?.[judge] ?? '—';

                            return (
                                <li
                                    key={id}
                                    onClick={() => setSelectedParticipant(p)}
                                    className={styles.item}
                                >
                                    <div className={styles.participantRow}>
                                        <span>{p.name} — {p.city} {p.apparatus}<br/></span>
                                        <span className={styles.myScore}>
                      Ваша оценка: {currentScore}
                    </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {selectedParticipant && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>Оценка для {selectedParticipant.name}</h3>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            className={styles.input}
                        />
                        <div className={styles.modalActions}>
                            <button onClick={handleSaveScore} className={styles.button}>
                                Сохранить
                            </button>
                            <button
                                onClick={() => setSelectedParticipant(null)}
                                className={styles.cancel}
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JudgePage;
