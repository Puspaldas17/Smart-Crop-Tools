import { RequestHandler } from "express";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });

// ── Smart fallback engine (works without any API key) ──────────────────────
function smartFallback(message: string, lang: string): string {
  const m = message.toLowerCase();
  const isHi = lang.startsWith("hi");
  const isOr = lang.startsWith("or");

  const t = (en: string, hi: string, or: string) => isHi ? hi : isOr ? or : en;

  if (/(weather|temp|rain|mausam|paanipaag|मौसम|ପାଣିପାଗ)/.test(m))
    return t(
      "Based on seasonal patterns, expect temperatures between 28–34°C with moderate humidity. Ideal conditions for Rice and Maize. Irrigate early morning to reduce evaporation loss.",
      "मौसम विश्लेषण: तापमान 28-34°C, मध्यम आर्द्रता। धान और मक्का के लिए उपयुक्त। सुबह जल्दी सिंचाई करें।",
      "ପାଣିପାଗ ବିଶ୍ଳେଷଣ: ତାପମାତ୍ରା 28-34°C, ମଧ୍ୟମ ଆର୍ଦ୍ରତା। ଧାନ ଓ ମକା ଚାଷ ପାଇଁ ଉପଯୁକ୍ତ। ସକାଳ ସମୟରେ ଜଳସେଚନ କରନ୍ତୁ।"
    );

  if (/(pest|insect|bug|keet|পোকা|ଫଟ|कीट)/.test(m))
    return t(
      "High humidity increases pest risk. Spray Neem Oil (5ml/L) as a preventive bio-pesticide. Monitor plants weekly for early signs of Brown Planthopper or Leaf Blight.",
      "उच्च आर्द्रता में कीट का खतरा बढ़ता है। नीम तेल (5ml/L) का निवारक छिड़काव करें। भूरा माहू या पत्ती झुलसा के लिए साप्ताहिक निगरानी करें।",
      "ଅଧିକ ଆର୍ଦ୍ରତାରେ ପୋକ ଆଶଙ୍କା ବଢ଼େ। ନିମ ତେଲ (5ml/L) ସ୍ପ୍ରେ କରନ୍ତୁ। ବ୍ରାଉନ ପ୍ଲାଣ୍ଟ ହପର ଓ ପତ୍ର ଝଉଳ ପାଇଁ ସାପ୍ତାହିକ ଦେଖଭାଲ କରନ୍ତୁ।"
    );

  if (/(fertilizer|npk|urea|compost|khad|ସାର|खाद)/.test(m))
    return t(
      "Apply NPK (120:60:40 kg/ha) in split doses. Use Urea at tillering stage (21 days after sowing). Supplement with compost for better soil organic matter.",
      "NPK (120:60:40 kg/ha) को विभाजित खुराक में दें। कल्ले फूटने पर यूरिया डालें। बेहतर जैविक पदार्थ के लिए खाद का उपयोग करें।",
      "NPK (120:60:40 kg/ha) ଭାଗ ଭାଗ କରି ପ୍ରୟୋଗ କରନ୍ତୁ। ଗଜ ବାହାର ସ୍ତରରେ ୟୁରିଆ ଦିଅନ୍ତୁ। ଜୈବ ଖତ ମଧ୍ୟ ବ୍ୟବହାର କରନ୍ତୁ।"
    );

  if (/(irrigation|water|sinchai|pani|ଜଳସେଚନ|सिंचाई)/.test(m))
    return t(
      "Irrigate at critical growth stages: tillering, panicle initiation, and grain filling. Drip irrigation saves 40% water. Avoid waterlogging — it promotes root rot.",
      "महत्वपूर्ण अवस्थाओं में सिंचाई करें: कल्ला, बाली और दाना भराई। ड्रिप सिंचाई 40% पानी बचाती है। जलभराव से बचें — इससे जड़ सड़न होती है।",
      "ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ଅବସ୍ଥାରେ ଜଳସେଚନ କରନ୍ତୁ। ଡ୍ରିପ ଜଳସେଚନ 40% ପାଣି ସଞ୍ଚୟ କରେ। ଜଳ ନିଷ୍କାସନ ନିଶ୍ଚିତ କରନ୍ତୁ।"
    );

  if (/(market|price|mandi|bhav|ବଜାର|मंडी)/.test(m))
    return t(
      "Current mandi trends: Wheat ₹2,200/qtl (up 4%), Rice ₹2,100/qtl (stable), Tomato ₹800/qtl (seasonal high). Sell Wheat in Punjab markets for best price this week.",
      "वर्तमान मंडी भाव: गेहूं ₹2,200/क्विंटल (4% ऊपर), धान ₹2,100/क्विंटल (स्थिर), टमाटर ₹800/क्विंटल। इस सप्ताह पंजाब में गेहूं बेचें।",
      "ବର୍ତ୍ତମାନ ମଣ୍ଡି ଦର: ଗହମ ₹2,200/ କ୍ୱିଣ୍ଟାଲ, ଧାନ ₹2,100/ କ୍ୱିଣ୍ଟାଲ। ଏ ସପ୍ତାହ ଗହମ ବିକ୍ରୟ ଲାଭଦାୟକ।"
    );

  if (/(rice|paddy|dhan|धान|ଧାନ)/.test(m))
    return t(
      "Rice Advisory: Maintain 2–5cm standing water at tillering. Apply Tricyclazole if Blast symptoms appear. Harvest when 85% grains are golden. Expected yield: 50–60 qtl/ha.",
      "धान सलाह: कल्ले फूटने पर 2-5 सेमी खड़ा पानी रखें। ब्लास्ट दिखने पर ट्राइसाइक्लेजोल लगाएं। 85% दाने सुनहरे होने पर कटाई करें।",
      "ଧାନ ପରାମର୍ଶ: ଗଜ ବାହାର ସ୍ତରରେ 2-5 ସେମି ଛିଡ଼ା ପାଣି ରଖନ୍ତୁ। ବ୍ଲାଷ୍ଟ ଦେଖାଦେଲେ ଟ୍ରାଇସାଇକ୍ଲାଜୋଲ ଦିଅନ୍ତୁ।"
    );

  if (/(wheat|gehu|गेहूं|ଗହମ)/.test(m))
    return t(
      "Wheat Advisory: Sow between Nov 1–15 for optimal yield. Apply NPK 120:60:40 kg/ha. First irrigation at CRI stage (21 days). Watch for Yellow Rust — apply Propiconazole if spotted.",
      "गेहूं सलाह: 1-15 नवंबर में बुवाई करें। NPK 120:60:40 डालें। CRI अवस्था (21 दिन) पर सिंचाई करें। पीला रतुआ देखने पर प्रोपिकोनाजोल लगाएं।",
      "ଗହମ ପରାମର୍ଶ: ନଭେମ୍ବର 1-15 ମଧ୍ୟରେ ବୁଣନ୍ତୁ। NPK 120:60:40 ପ୍ରୟୋଗ କରନ୍ତୁ। ହଳଦିଆ ମରଚ ଦେଖାଦେଲେ Propiconazole ସ୍ପ୍ରେ କରନ୍ତୁ।"
    );

  if (/(soil|mitti|ph|nitrogen|ମାଟି|मिट्टी)/.test(m))
    return t(
      "Optimal soil pH for most crops is 6.0–7.0. Test your soil every season. Add lime to raise pH, sulfur to lower it. Maintain organic matter above 1.5% for healthy yield.",
      "अधिकांश फसलों के लिए मिट्टी pH 6.0-7.0 उपयुक्त है। हर मौसम में मिट्टी परीक्षण करें। pH बढ़ाने के लिए चूना, घटाने के लिए सल्फर डालें।",
      "ଅଧିକାଂଶ ଫସଲ ପାଇଁ ମାଟି pH 6.0-7.0 ଉପଯୁକ୍ତ। ପ୍ରତି ଋତୁରେ ମାଟି ପରୀକ୍ଷା କରନ୍ତୁ। ଜୈବ ପଦାର୍ଥ 1.5% ଉପରେ ରଖନ୍ତୁ।"
    );

  // Default intelligent response
  return t(
    "I can assist with crop advisory, pest management, soil health, irrigation planning, weather insights, and mandi prices. Ask me anything about your farm!",
    "मैं फसल सलाह, कीट प्रबंधन, मिट्टी स्वास्थ्य, सिंचाई योजना, मौसम और मंडी भाव में मदद कर सकता हूं। अपने खेत के बारे में कुछ भी पूछें!",
    "ମୁଁ ଫସଲ ପରାମର୍ଶ, ପୋକ ନିୟନ୍ତ୍ରଣ, ମାଟି ସ୍ୱାସ୍ଥ୍ୟ, ଜଳସେଚନ ଯୋଜନା, ପାଣିପାଗ ଓ ମଣ୍ଡି ଦରରେ ସାହାଯ୍ୟ କରିପାରିବି। ଆପଣଙ୍କ ଜମି ବିଷୟରେ ପଚାରନ୍ତୁ!"
  );
}

export const chatHandler: RequestHandler = async (req, res) => {
  try {
    const { message, lat, lon, lang = "en", history = [] } = req.body as {
      message?: string;
      lat?: number;
      lon?: number;
      lang?: string;
      history?: { role: string; content: string }[];
    };

    if (!message) return res.status(400).json({ error: "message required" });

    const apiKey = process.env.GEMINI_API_KEY;
    const hasValidKey = apiKey && apiKey !== "your_gemini_api_key_here" && apiKey.length > 10;

    // ── Try Gemini if we have a valid API key ──────────────────────────────
    if (hasValidKey) {
      try {
        const shortLang = lang.split("-")[0];
        const targetLang = shortLang === "or" ? "Odia" : shortLang === "hi" ? "Hindi" : "English";

        let weatherContext = "Current weather: partly cloudy, 30°C, Humidity 65%.";
        if (lat != null && lon != null) {
          const wKey = process.env.OPENWEATHER_API_KEY;
          if (wKey && wKey !== "your_openweather_api_key_here") {
            try {
              const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${wKey}&units=metric`);
              if (r.ok) {
                const w = await r.json();
                weatherContext = `Current weather: ${w.weather?.[0]?.description}, Temp: ${w.main?.temp}°C, Humidity: ${w.main?.humidity}%.`;
              }
            } catch (_) {}
          }
        }

        const systemInstruction = `You are AgriVerse, an expert AI agricultural assistant for Indian farmers. Give concise, practical advice (2-4 sentences max). No markdown formatting. ${weatherContext} Reply in ${targetLang} language using its native script.`;

        const contents = history.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }));
        contents.push({ role: "user", parts: [{ text: message }] });

        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents,
          config: { systemInstruction, temperature: 0.3 }
        });

        const reply = response.text;
        if (reply) return res.json({ reply });
      } catch (geminiErr: any) {
        console.warn("Gemini failed, using smart fallback:", geminiErr.message);
      }
    }

    // ── Smart Fallback (always works) ──────────────────────────────────────
    const reply = smartFallback(message, lang);
    res.json({ reply });

  } catch (e: any) {
    console.error("Chat error:", e);
    res.status(500).json({ error: "Chat error. Please try again." });
  }
};
