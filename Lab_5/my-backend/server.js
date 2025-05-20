// Завжди завантажуйте змінні середовища на самому початку!
require("dotenv").config({ path: "./key.env" });

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");
const jwt = require("jsonwebtoken");
// Не потрібен bodyParser, якщо використовуємо express.urlencoded
// const bodyParser = require("body-parser");

const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) }); 
const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 5000;

// Переконайтесь, що секретний ключ завантажено
const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  console.error("SECRET_KEY is not defined. Please check your key.env file.");
  process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // замінюємо bodyParser

// Хостинг статичних файлів з папки "public"
app.use(express.static(path.join(__dirname, "public")));

// =================================================================================
// Роутинг – ваші API маршрути
// =================================================================================

// Протестовий маршрут
app.get("/api/test", (req, res) => {
  res.json({ message: "Сервер працює успішно!" });
});

app.get("/api/tours", async (req, res) => {
  try {
    const toursSnapshot = await db.collection("Tours").get();
    const tours = toursSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json({ tours });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

// Приклад чорного списку заборонених слів
const forbiddenWords = ["shit","hyj","лайно", "засуне", "лайно"]; // доповніть список за потреби

app.post("/api/reviews", async (req, res) => {
  try {
    const reviewData = req.body;
    console.log("Крок 1. Отримано дані відгуку:", reviewData);

    // Переконуємося, що поле reviewText існує
    if (!reviewData.reviewText) {
      console.log("Крок 2. Поле reviewText відсутнє.");
      return res.status(400).json({ error: "Відгук повинен містити текст." });
    }

    // Отримуємо текст відгуку в нижньому регістрі
    const reviewTextLower = reviewData.reviewText.toLowerCase();
    console.log("Крок 3. Текст відгуку у нижньому регістрі:", reviewTextLower);

    // Перевірка наявності заборонених слів
    let foundForbidden = false;
    forbiddenWords.forEach(word => {
      // Формуємо регулярний вираз з урахуванням пробілів та можливих Unicode варіантів
      const regex = new RegExp(`(^|\\s)${word}($|\\s)`, 'iu');
      const match = regex.test(reviewTextLower);
      console.log(`Крок 4. Перевірка слова "${word}" за допомогою регулярного виразу ${regex}: результат = ${match}`);
      if (match) {
        foundForbidden = true;
      }
    });

    if (foundForbidden) {
      console.log("Крок 5. Виявлено заборонене слово. Відгук не буде збережено.");
      return res.status(400).json({ error: "Відгук містить заборонені слова." });
    } else {
      console.log("Крок 5. Заборонені слова не знайдено.");
    }

    // Додаємо поле createdAt для відгуку
    reviewData.createdAt = new Date().toISOString();
    console.log("Крок 6. Дані для збереження:", reviewData);

    // Збереження в базі
    const docRef = await db.collection("Review").add(reviewData);
    console.log("Крок 7. Відгук збережено з ID:", docRef.id);

    res.status(201).json({ id: docRef.id, message: "Відгук успішно додано" });
  } catch (error) {
    console.error("Крок 8. Помилка при збереженні відгуку:", error);
    res.status(500).json({ error: error.toString() });
  }
});



app.get("/api/reviews", async (req, res) => {
  try {
    const { tourName } = req.query;
    if (!tourName) {
      // Якщо параметр tourName не надано — повертаємо повідомлення про помилку
      return res.status(400).json({ error: "Параметр 'tourName' є обов'язковим для отримання відгуків." });
    }
    
    // Фільтруємо відгуки тільки для заданого туру
    const reviewsQuery = db.collection("Review").where("tourName", "==", tourName);
    const reviewsSnapshot = await reviewsQuery.get();
    
    const reviews = reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      rating: Number(doc.data().rating) || 0
    }));

    // Обчислення середнього рейтингу для даного туру
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length ? (totalRating / reviews.length) : 0;

    // Сортуємо відгуки від кращих до гірших (від високого рейтингу до низького)
    reviews.sort((a, b) => b.rating - a.rating);

    res.json({ averageRating, reviews });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});


// Приклад POST /api/register для створення користувача через Firebase Admin
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await admin.auth().createUser({ email, password });
    res.status(201).json({ message: "Користувача зареєстровано успішно.", uid: userRecord.uid });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Приклад POST /api/login, де клієнт відсилає idToken
app.post("/api/login", async (req, res) => {
  const { idToken } = req.body; // idToken має бути отриманий через Firebase на клієнтській частині
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    // decodedToken містить інформацію про користувача: uid, email тощо.
    res.json({ token: idToken, user: decodedToken });
  } catch (error) {
    res.status(401).json({ message: "Неправильний токен" });
  }
});


// Middleware для захисту маршрутів
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get("/api/profile", authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: "Користувача не знайдено." });
  }
  res.json({ id: user.id, email: user.email });
});

app.get("/api/private-data", authenticateToken, (req, res) => {
  res.json({ secretData: "Це конфіденційна інформація" });
});

app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});
