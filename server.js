const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Главная страница
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AutoAI — генератор объявлений</title>
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #f4f7fb;
      color: #172033;
    }

    .container {
      max-width: 900px;
      margin: 40px auto;
      padding: 20px;
    }

    .card {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 35px rgba(0,0,0,0.08);
    }

    h1 {
      margin-top: 0;
      font-size: 34px;
    }

    .subtitle {
      color: #667085;
      margin-bottom: 30px;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .full {
      grid-column: 1 / -1;
    }

    label {
      font-weight: 600;
    }

    input,
    textarea {
      width: 100%;
      padding: 13px;
      border: 1px solid #d0d5dd;
      border-radius: 10px;
      font-size: 16px;
      outline: none;
    }

    input:focus,
    textarea:focus {
      border-color: #667eea;
    }

    textarea {
      min-height: 100px;
      resize: vertical;
    }

    button {
      width: 100%;
      margin-top: 24px;
      padding: 15px;
      border: 0;
      border-radius: 12px;
      background: #4f46e5;
      color: white;
      font-size: 17px;
      font-weight: 700;
      cursor: pointer;
    }

    button:hover {
      background: #4338ca;
    }

    button:disabled {
      opacity: 0.6;
      cursor: wait;
    }

    #result {
      display: none;
      margin-top: 25px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 12px;
      white-space: pre-wrap;
      line-height: 1.6;
    }

    .error {
      color: #b42318;
      background: #fef3f2;
      padding: 15px;
      border-radius: 10px;
      margin-top: 20px;
    }

    @media (max-width: 700px) {
      .grid {
        grid-template-columns: 1fr;
      }

      .full {
        grid-column: auto;
      }

      .container {
        margin: 10px auto;
      }

      .card {
        padding: 20px;
      }
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="card">
      <h1>🚗 AutoAI</h1>

      <div class="subtitle">
        Создайте привлекательное объявление автомобиля с помощью AI
      </div>

      <form id="carForm">
        <div class="grid">

          <div class="field">
            <label>Марка</label>
            <input name="brand" placeholder="BMW">
          </div>

          <div class="field">
            <label>Модель</label>
            <input name="model" placeholder="320i">
          </div>

          <div class="field">
            <label>Год</label>
            <input name="year" placeholder="2020">
          </div>

          <div class="field">
            <label>Пробег</label>
            <input name="mileage" placeholder="85000">
          </div>

          <div class="field">
            <label>Двигатель</label>
            <input name="engine" placeholder="2.0 бензин">
          </div>

          <div class="field">
            <label>Коробка</label>
            <input name="gear" placeholder="Автомат">
          </div>

          <div class="field">
            <label>Кузов</label>
            <input name="body" placeholder="Седан">
          </div>

          <div class="field">
            <label>Цвет</label>
            <input name="color" placeholder="Чёрный">
          </div>

          <div class="field full">
            <label>Комплектация</label>
            <textarea name="features" placeholder="Кожа, камера, навигация..."></textarea>
          </div>

          <div class="field full">
            <label>Состояние</label>
            <textarea name="condition" placeholder="Хорошее состояние, один владелец..."></textarea>
          </div>

        </div>

        <button id="submitButton" type="submit">
          ✨ Создать объявление
        </button>
      </form>

      <div id="error"></div>
      <div id="result"></div>
    </div>
  </div>

  <script>
    const form = document.getElementById("carForm");
    const result = document.getElementById("result");
    const error = document.getElementById("error");
    const button = document.getElementById("submitButton");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      result.style.display = "none";
      error.innerHTML = "";
      button.disabled = true;
      button.textContent = "⏳ Создаём объявление...";

      const data = Object.fromEntries(new FormData(form));

      try {
        const response = await fetch("/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });

        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(json.error || "Ошибка сервера");
        }

        result.textContent = json.text;
        result.style.display = "block";

      } catch (err) {
        error.innerHTML =
          '<div class="error">❌ ' +
          (err.message || "Не удалось создать объявление") +
          "</div>";
      } finally {
        button.disabled = false;
        button.textContent = "✨ Создать объявление";
      }
    });
  </script>
</body>
</html>
  `);
});

// API генерации объявления
app.post("/generate", async (req, res) => {
  try {
    const car = req.body;

    const prompt = `
Ты профессиональный автор объявлений автомобилей.

Создай привлекательное, но честное объявление для продажи автомобиля.

ВАЖНО:
- Не придумывай характеристики, которых нет в данных.
- Не обещай то, чего пользователь не указал.
- Пиши естественно и убедительно.
- Сделай хороший заголовок.
- Текст должен подходить для размещения на площадке объявлений.

Данные автомобиля:

Марка: ${car.brand || ""}
Модель: ${car.model || ""}
Год: ${car.year || ""}
Пробег: ${car.mileage || ""} км
Двигатель: ${car.engine || ""}
Коробка: ${car.gear || ""}
Кузов: ${car.body || ""}
Цвет: ${car.color || ""}
Комплектация: ${car.features || ""}
Состояние: ${car.condition || ""}
`;

    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: prompt
    });

    res.json({
      success: true,
      text: response.output_text
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Не удалось создать объявление"
    });
  }
});

// Порт Runsite
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`AutoAI server запущен на порту ${PORT}`);
});
