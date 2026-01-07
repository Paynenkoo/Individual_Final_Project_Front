import { useParams } from "react-router-dom";
import styles from "../GuideDetails/GuideDetails.module.scss";

const guides = [
  {
    id: "1",
    title: "Основні методи зупинки кровотеч",
    content: `У цьому гайді розглянуто основні методи зупинки кровотеч:
- Використання турнікетів
- Тампонада ран
- Притискання артерій
- Принципи TCCC`,
  },
  {
    id: "2",
    title: "Алгоритм MARCH",
    content: `MARCH — це алгоритм надання допомоги:
- M: Massive bleeding
- A: Airway
- R: Respiration
- C: Circulation
- H: Hypothermia/Head trauma`,
  },
  {
    id: "3",
    title: "Огляд аптечки",
    content: `Обовʼязкові елементи IFAK:
- Турнікет
- Марля (hemostatic)
- Ножиці
- Chest seals
- Рукавички`,
  },
];

function GuideDetails() {
  const { id } = useParams();
  const guide = guides.find((g) => g.id === id);

  if (!guide) {
    return <p className={styles.notFound}>Гайд не знайдено</p>;
  }

  return (
    <div className={styles.guideDetails}>
      <h2>{guide.title}</h2>
      <div className={styles.content}>
        {guide.content.split("\n").map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </div>
    </div>
  );
}

export default GuideDetails;
