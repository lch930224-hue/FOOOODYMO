import { useEffect, useState } from "react";

export default function Home() {
  const [meals, setMeals] = useState(null);
  const [highlight, setHighlight] = useState(null);
  const [origin, setOrigin] = useState("");
  const [showOrigin, setShowOrigin] = useState(false);

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

        // 마지막 행이 원산지
        const originRow = rows[rows.length - 1];
        const originText = originRow?.innerText || "";

        setMeals({ breakfast, lunch, dinner });
        setOrigin(originText);

        determineHighlight();
      });
  }, []);

  function determineHighlight() {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();

    const breakfastEnd = 8 * 60;
    const lunchEnd = 13 * 60;
    const dinnerEnd = 18 * 60;

    if (minutes <= breakfastEnd) {
      setHighlight("breakfast");
    } else if (minutes <= lunchEnd) {
      setHighlight("lunch");
    } else if (minutes <= dinnerEnd) {
      setHighlight("dinner");
    } else {
      setHighlight("breakfast");
    }
  }

  if (!meals) return <div style={{ padding: 20 }}>불러오는 중...</div>;

  return (
    <div style={{ fontFamily: "sans-serif", padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h1>🍽 오늘의 식단</h1>

      <MealCard title="🌅 조식" html={meals.breakfast} active={highlight==="breakfast"} />
      <MealCard title="🌞 중식" html={meals.lunch} active={highlight==="lunch"} />
      <MealCard title="🌙 석식" html={meals.dinner} active={highlight==="dinner"} />

      {/* 원산지 영역 */}
      <div style={{ marginTop: 30 }}>
        <div
          onClick={() => setShowOrigin(!showOrigin)}
          style={{
            cursor: "pointer",
            padding: 12,
            backgroundColor: "#f2f2f2",
            borderRadius: 8,
            fontWeight: "bold"
          }}
        >
          📦 원산지 정보 {showOrigin ? "▲" : "▼"}
        </div>

        {showOrigin && (
          <div
            style={{
              marginTop: 10,
              padding: 15,
              backgroundColor: "#fafafa",
              border: "1px solid #e0e0e0",
              borderRadius: 8,
              fontSize: "0.9rem",
              lineHeight: "1.6"
            }}
          >
            {origin}
          </div>
        )}
      </div>
    </div>
  );
}

function MealCard({ title, html, active }) {
  return (
    <div style={{
      border: "1px solid #ddd",
      padding: 15,
      marginBottom: 20,
      borderRadius: 10,
      backgroundColor: active ? "#fff3cd" : "white",
      boxShadow: active ? "0 0 10px rgba(255,193,7,0.6)" : "none"
    }}>
      <h3>{title}</h3>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
