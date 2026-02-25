export default async function handler(req, res) {
  const targetDate = new Date().toISOString().split("T")[0];

  try {
    const response = await fetch(
      `https://haenuri.25village.or.kr/api/food_schedule/?date=${targetDate}`
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch food data" });
  }
}
