import React, { useState } from 'react';
import styles from './create.module.css';
import axios from 'axios';
import { useRouter } from 'next/router';

const CreateTournament = () => {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post('https://ketorry.ru:2017/tournaments/create', {
                name,
                date,
            });

            console.log('Ответ сервера:', res.data);

            // после успешного создания можно редиректнуть на список
            router.push('/tour');
        } catch (err) {
            console.error('Ошибка при создании турнира:', err);
            alert('Ошибка при создании турнира');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Создать турнир</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                    <label className={styles.label}>Название турнира</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Дата</label>
                    <input
                        type="date"
                        className={styles.input}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className={styles.button} disabled={loading}>
                    {loading ? 'Создаём...' : 'Создать'}
                </button>
            </form>
        </div>
    );
};

export default CreateTournament;
