import { useEffect, useState } from "react";

export default function Home() {
  const [meals, setMeals] = useState(null);

  useEffect(() => {
    fetch("/api/food")
      .then(res => res.json())
      .then(data => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.content, "text/html");
        const rows = doc.querySelectorAll("table tbody tr");

        const today = new Date().getDay();
        const colIndex = today === 0 ? 7 : today;

        const breakfast = rows[1]?.children[colIndex]?.innerHTML;
        const lunch = rows[2]?.children[colIndex]?.innerHTML;
        const dinner = rows[3]?.children[colIndex]?.innerHTML;

        setMeals({ breakfast, lunch, dinner });
      });
  }, []);

  if (!meals) return <div style={{padding:20}}>불러오는 중...</div>;

  return (
    <div style={{ fontFamily:"sans-serif", padding:20 }}>
      <h1>🍽 오늘의 식단</h1>

      <MealCard title="🌅 조식" html={meals.breakfast} />
      <MealCard title="🌞 중식" html={meals.lunch} />
      <MealCard title="🌙 석식" html={meals.dinner} />
    </div>
  );
}

function MealCard({ title, html }) {
  return (
    <div style={{
      border:"1px solid #ddd",
      padding:15,
      marginBottom:20,
      borderRadius:10
    }}>
      <h3>{title}</h3>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
