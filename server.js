const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`AutoAI server запущен на порту ${PORT}`);
});
