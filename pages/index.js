// pages/tournament-application.jsx
import { useState, useMemo } from "react";

// Helper: basic RU phone validation: +7XXXXXXXXXX or 8XXXXXXXXXX
const isValidRuPhone = (v) =>
   true;

const emptyApplicant = {
  tournamentName: "",
  streamName: "",
  applicantFullName: "",
  phone: "",
};

const emptyParticipant = () => ({
  fullName: "",
  birthDate: "", // YYYY-MM-DD
  birthYear: "",
  trainer: "",
  city: "",
  school: "",
});

export default function TournamentApplicationPage() {
  const [form, setForm] = useState(emptyApplicant);
  const [participants, setParticipants] = useState([emptyParticipant()]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const allRequiredFilled = useMemo(() => {
    if (
        !form.tournamentName.trim() ||
        !form.streamName.trim() ||
        !form.applicantFullName.trim() ||
        !isValidRuPhone(form.phone)
    ) return false;

    // хотя бы у каждого участника должно быть ФИО
    return participants.every((p) => p.fullName.trim());
  }, [form, participants]);

  const onChangeForm = (key, value) =>
      setForm((prev) => ({ ...prev, [key]: value }));

  const onChangeParticipant = (idx, key, value) => {
    setParticipants((prev) => {
      const next = [...prev];
      const updated = { ...next[idx], [key]: value };
      if (key === "birthDate" && value) {
        const y = new Date(value).getFullYear();
        if (!isNaN(y)) updated.birthYear = String(y);
      }
      next[idx] = updated;
      return next;
    });
  };

  const addParticipant = () =>
      setParticipants((prev) => [...prev, emptyParticipant()]);

  const removeParticipant = (idx) =>
      setParticipants((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!allRequiredFilled) {
      setMessage({ type: "error", text: "Заполните обязательные поля." });
      return;
    }

    setSubmitting(true);
    try {
      const apiBase = "https://ketorry.ru:2017"
      const payload = {
        ...form,
        phone: form.phone.replace(/\s|\(|\)|-/g, ""),
        participants,
      };

      const res = await fetch(`${apiBase}/form/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `HTTP ${res.status}`);
      }

      const data = await res.json().catch(() => ({}));
      if (!data?.ok) throw new Error("Сервер вернул ошибку");

      setMessage({ type: "success", text: "Заявка отправлена. Мы свяжемся с вами." });
      setForm(emptyApplicant);
      setParticipants([emptyParticipant()]);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Не удалось отправить заявку. Попробуйте ещё раз." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="page">
        <div className="container">
          <h1 className="title">Подача заявки на турнир</h1>

          <form className="card" onSubmit={handleSubmit}>
            <section className="section">
              <h2 className="sectionTitle">Информация о турнире</h2>
              <div className="grid2">
                <Field label="Название турнира" required>
                  <input
                      type="text"
                      value={form.tournamentName}
                      onChange={(e) => onChangeForm("tournamentName", e.target.value)}
                      placeholder="Например: Кубок города 2025"
                  />
                </Field>
                <Field label="Дата турнира" required>
                  <input
                      type="text"
                      value={form.streamName}
                      onChange={(e) => onChangeForm("streamName", e.target.value)}
                      placeholder="16.05.2025"
                  />
                </Field>
              </div>
            </section>

            <section className="section">
              <h2 className="sectionTitle">Контакты подающего</h2>
              <div className="grid2">
                <Field label="ФИО подающего" required>
                  <input
                      type="text"
                      value={form.applicantFullName}
                      onChange={(e) => onChangeForm("applicantFullName", e.target.value)}
                      placeholder="Иванова Ирина Сергеевна"
                  />
                </Field>
                <Field label="Телефон (Россия)" hint="Формат: +7XXXXXXXXXX или 8XXXXXXXXXX" required>
                  <input
                      value={form.phone}
                      onChange={(e) => onChangeForm("phone", e.target.value.replace(/\s/g, ""))}
                      placeholder="+7XXXXXXXXXX"
                  />
                </Field>
              </div>
            </section>

            <section className="section">
              <h2 className="sectionTitle">Участники</h2>
              <ParticipantsTable
                  participants={participants}
                  onChange={onChangeParticipant}
                  onRemove={removeParticipant}
              />
              <div className="actionsRow">
                <button type="button" className="secondary" onClick={addParticipant}>
                  + Добавить участника
                </button>
              </div>
            </section>

            {message && (
                <div className={`notice ${message.type}`}>{message.text}</div>
            )}

            <div className="submitRow">
              <button type="submit" className="primary" disabled={!allRequiredFilled || submitting}>
                {submitting ? "Отправка…" : "Отправить заявку"}
              </button>
            </div>
          </form>
        </div>

        <style jsx>{`
          .page { min-height: 100vh; background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%); padding: 40px 16px; }
          .container { max-width: 1040px; margin: 0 auto; }
          .title { font-family: Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size: 28px; font-weight: 700; margin: 0 0 24px; letter-spacing: 0.2px; color: #0f172a; }
          .card { background: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(2,12,27,0.08); padding: 24px; }
          .section { margin: 8px 0 20px; }
          .sectionTitle { font-size: 18px; margin: 0 0 14px; color: #0f172a; }
          .grid2 { display: grid; grid-template-columns: 1fr; gap: 14px; }
          @media (min-width: 760px) { .grid2 { grid-template-columns: 1fr 1fr; } }
          .actionsRow { display: flex; justify-content: flex-start; margin-top: 12px; }
          .submitRow { display: flex; justify-content: flex-end; margin-top: 12px; }
          .primary, .secondary { border: 0; border-radius: 10px; padding: 12px 16px; font-weight: 600; cursor: pointer; }
          .primary { background: #3b82f6; color: white; box-shadow: 0 6px 16px rgba(59,130,246,0.35); transition: transform 0.08s ease; }
          .primary:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }
          .primary:hover:not(:disabled) { transform: translateY(-1px); }
          .secondary { background: rgba(59,130,246,0.1); color: #1e40af; }
          .notice { margin: 8px 0 0; padding: 10px 12px; border-radius: 10px; font-size: 14px; }
          .notice.success { background: #ecfdf5; color: #065f46; }
          .notice.error { background: #fef2f2; color: #991b1b; }
        `}</style>
      </div>
  );
}

function Field({ label, hint, required, children }) {
  return (
      <label className="field">
        <div className="labelRow">
        <span className="labelText">
          {label}{required && <span className="req">*</span>}
        </span>
          {hint && <span className="hint">{hint}</span>}
        </div>
        {children}
        <style jsx>{`
          .field { display: flex; flex-direction: column; gap: 8px; }
          .labelRow { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
          .labelText { color: #0f172a; font-weight: 600; }
          .req { color: #ef4444; margin-left: 4px; }
          .hint { color: #64748b; font-size: 12px; }
          input, select { height: 44px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; outline: none; font-size: 14px; }
          input:focus, select:focus { border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
        `}</style>
      </label>
  );
}

function ParticipantsTable({ participants, onChange, onRemove }) {
  return (
      <div className="tableWrap">
        <div className="tableHead">
          <div className="c name">ФИО</div>
          <div className="c birthDate">Дата рождения</div>
          <div className="c birthYear">Год рождения</div>
          <div className="c city">Город</div>
          <div className="c school">Школа</div>
          <div className="c trainer">Тренер</div>
          <div className="c actions"></div>
        </div>

        {participants.map((p, idx) => (
            <div className="tableRow" key={idx}>
              <div className="c name">
                <input type="text" placeholder="Иванова Анна"
                       value={p.fullName} onChange={(e) => onChange(idx, "fullName", e.target.value)} />
              </div>
              <div className="c birthDate">
                <input type="date" value={p.birthDate}
                       onChange={(e) => onChange(idx, "birthDate", e.target.value)} />
              </div>
              <div className="c birthYear">
                <input type="number" placeholder="2013" min="1900" max="2099"
                       value={p.birthYear} onChange={(e) => onChange(idx, "birthYear", e.target.value)} />
              </div>
              <div className="c city">
                <input type="text" placeholder="Город"
                       value={p.city} onChange={(e) => onChange(idx, "city", e.target.value)} />
              </div>
              <div className="c school">
                <input type="text" placeholder="Школа или клуб"
                       value={p.school} onChange={(e) => onChange(idx, "school", e.target.value)} />
              </div>
              <div className="c trainer">
                <input type="text" placeholder="Фамилия Имя"
                       value={p.trainer} onChange={(e) => onChange(idx, "trainer", e.target.value)} />
              </div>
              <div className="c actions">
                <button type="button" className="link danger"
                        onClick={() => onRemove(idx)} disabled={participants.length === 1}>
                  Удалить
                </button>
              </div>
            </div>
        ))}

        <style jsx>{`
          .tableWrap { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
          .tableHead { display: grid; grid-template-columns: 2fr 1.2fr 0.9fr 1.2fr 1fr 1.2fr 0.8fr; gap: 0; background: #f8fafc; color: #334155; font-weight: 600; font-size: 14px; padding: 10px 12px; }
          .tableRow { display: grid; grid-template-columns: 2fr 1.2fr 0.9fr 1.2fr 1fr 1.2fr 0.8fr; gap: 0; padding: 10px 12px; border-top: 1px solid #e2e8f0; }
          .c { padding-right: 8px; display: flex; align-items: center; }
          .actions { justify-content: flex-end; }
          .link { background: transparent; border: 0; cursor: pointer; font-weight: 600; }
          .danger { color: #ef4444; }
          @media (max-width: 960px) {
            .tableHead, .tableRow { grid-template-columns: 1fr; }
            .tableHead { display: none; }
            .tableRow { border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 10px; }
            .c { padding: 6px 0; }
            .c.name::before { content: "ФИО"; font-weight: 600; color: #64748b; width: 130px; flex: 0 0 130px; }
            .c.birthDate::before { content: "Дата рождения"; font-weight: 600; color: #64748b; width: 130px; flex: 0 0 130px; }
            .c.birthYear::before { content: "Год рождения"; font-weight: 600; color: #64748b; width: 130px; flex: 0 0 130px; }
            .c.trainer::before { content: "Тренер"; font-weight: 600; color: #64748b; width: 130px; flex: 0 0 130px; }
            .c.city::before { content: "Город"; font-weight: 600; color: #64748b; width: 130px; flex: 0 0 130px; }
            .c.school::before { content: "Школа"; font-weight: 600; color: #64748b; width: 130px; flex: 0 0 130px; }
            .c.actions { justify-content: flex-start; }
          }
          input { width: 100%; height: 40px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 10px; }
          input:focus { border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); outline: none; }
        `}</style>
      </div>
  );
}
