import { useEffect, useState } from "react";

const allergyMap = {
  "계란": ["난류"],
  "슈크림": ["난류","우유","밀"],
  "우유": ["우유"],
  "요거트": ["우유"],
  "치즈": ["우유"],
  "돈까스": ["밀","대두","돼지고기"],
  "만두": ["밀","돼지고기"],
  "빵": ["밀"],
  "떡볶이": ["밀"],
  "멸치": ["어류"],
  "삼치": ["어류"],
  "고등어": ["어류"],
  "새우": ["갑각류"],
  "게": ["갑각류"],
  "땅콩": ["땅콩"],
  "아몬드": ["견과류"],
  "호두": ["견과류"],
  "닭": ["닭고기"],
  "돼지": ["돼지고기"],
  "소고기": ["소고기"],
};

export default function Home() {
  const [meals, setMeals] = useState(null);
  const [highlight, setHighlight] = useState(null);
  const [origin, setOrigin] = useState("");
  const [showOrigin, setShowOrigin] = useState(false);
  const [newMenus, setNewMenus] = useState([]);

  useEffect(() => {
    fetch("/api/food")
      .then(res => res.json())
      .then(data => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.content, "text/html");
        const rows = doc.querySelectorAll("table tbody tr");

        const today = new Date().getDay();
        const colIndex = today === 0 ? 7 : today;

        const breakfast = rows[1]?.children[colIndex]?.innerHTML || "";
        const lunch = rows[2]?.children[colIndex]?.innerHTML || "";
        const dinner = rows[3]?.children[colIndex]?.innerHTML || "";

        const originRow = rows[rows.length - 1];
        const originText = originRow?.innerText || "";

        setMeals({ breakfast, lunch, dinner });
        setOrigin(originText);

        determineHighlight();
        detectNewMenus([breakfast, lunch, dinner]);
      });
  }, []);

  function determineHighlight() {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();

    if (minutes <= 480) setHighlight("breakfast");
    else if (minutes <= 780) setHighlight("lunch");
    else if (minutes <= 1080) setHighlight("dinner");
    else setHighlight("breakfast");
  }

  function getAllergyInfo(text) {
    let detected = new Set();

    Object.keys(allergyMap).forEach(keyword => {
      if (text.includes(keyword)) {
        allergyMap[keyword].forEach(a => detected.add(a));
      }
    });

    return detected.size > 0
      ? ` ⚠ ${Array.from(detected).join(", ")}`
      : "";
  }

  function detectNewMenus(mealList) {
    let unknown = [];

    mealList.forEach(mealHtml => {
      mealHtml
        .split("<br>")
        .map(item => item.replace(/&nbsp;/g, "").trim())
        .forEach(clean => {
          if (!clean) return;

          let matched = false;
          Object.keys(allergyMap).forEach(keyword => {
            if (clean.includes(keyword)) matched = true;
          });

          if (!matched) unknown.push(clean);
        });
    });

    setNewMenus([...new Set(unknown)]);
  }

  function formatMeal(html) {
    return html
      .split("<br>")
      .map(item => {
        const clean = item.replace(/&nbsp;/g, "").trim();
        if (!clean) return "";
        return clean + getAllergyInfo(clean);
      })
      .join("<br>");
  }

  if (!meals) return <div style={{ padding: 20 }}>불러오는 중...</div>;

  return (
    <div style={{ fontFamily: "sans-serif", padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h1>🍽 오늘의 식단</h1>

      <MealCard title="🌅 조식" html={formatMeal(meals.breakfast)} active={highlight==="breakfast"} />
      <MealCard title="🌞 중식" html={formatMeal(meals.lunch)} active={highlight==="lunch"} />
      <MealCard title="🌙 석식" html={formatMeal(meals.dinner)} active={highlight==="dinner"} />

      {/* 원산지 */}
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
          <div style={{
            marginTop: 10,
            padding: 15,
            backgroundColor: "#fafafa",
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            fontSize: "0.9rem",
            lineHeight: "1.6"
          }}>
            {origin}
          </div>
        )}
      </div>

      {/* 신규 메뉴 */}
      {newMenus.length > 0 && (
        <div style={{
          marginTop: 30,
          padding: 15,
          backgroundColor: "#eef6ff",
          borderRadius: 8
        }}>
          <h3>🆕 신규 메뉴 감지 (DB 검토 필요)</h3>
          <ul>
            {newMenus.map((menu, idx) => (
              <li key={idx}>{menu}</li>
            ))}
          </ul>
        </div>
      )}
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
