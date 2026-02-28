import React, { useEffect, useState } from 'react';
import styles from './TourList.module.css';
import Link from "next/link";
import axios from 'axios';

const TourList = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const res = await axios.get('https://ketorry.ru:2017/tournaments');
                setTournaments(res.data);
            } catch (e) {
                console.error('Ошибка при загрузке турниров', e);
            } finally {
                setLoading(false);
            }
        };
        fetchTours();
    }, []);

    if (loading) {
        return <div className={styles.container}>Загрузка...</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Список турниров</h1>
            {tournaments.length === 0 ? (
                <p>Турниров пока нет</p>
            ) : (
                <ul className={styles.list}>
                    {tournaments.map((t) => {
                        const id = t._id?.$oid || t._id;
                        return (
                            <li key={id} className={styles.item}>
                                <Link href={`/tournament/${id}`} className={styles.link}>
                                    <div className={styles.itemContent}>
                                        <span className={styles.name}>{t.name}</span>
                                        <span className={styles.date}>{t.date}</span>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
            <Link href="/tour/create" className={styles.button}>
                Создать турнир
            </Link>
        </div>
    );
};

export default TourList;
