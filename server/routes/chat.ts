import { RequestHandler } from "express";

export const chatHandler: RequestHandler = async (req, res) => {
  try {
    const { message, lat, lon, lang = "en" } = req.body as {
      message?: string;
      lat?: number;
      lon?: number;
      lang?: string;
    };
    if (!message) return res.status(400).json({ error: "message required" });

    // Normalize language code (e.g. "hi-IN" -> "hi")
    const shortLang = lang.split("-")[0];
    const isHi = shortLang === "hi";
    const isOr = shortLang === "or";

    const m = message.toLowerCase();
    const replies: string[] = [];

    // Translation Dictionary
    const t = {
      weather: {
        en: (desc: string, temp: number, hum: number) => `Weather: ${desc}, Temp ${temp}°C, Humidity ${hum}%`,
        hi: (desc: string, temp: number, hum: number) => `मौसम: ${desc}, तापमान ${temp}°C, नमी ${hum}%`,
        or: (desc: string, temp: number, hum: number) => `ପାଣିପାଗ: ${desc}, ତାପମାତ୍ରା ${temp}°C, ଆର୍ଦ୍ରତା ${hum}%`,
      },
      market: {
        en: "For live mandi prices, please check the 'Market' tab. I can tell you that Wheat is currently trending up in Punjab markets.",
        hi: "लाइव मंडी भाव के लिए, कृपया 'मंडी भाव' टैब देखें। पंजाब की मंडियों में गेहूं के दाम बढ़ रहे हैं।",
        or: "ଲାଇଭ ମଣ୍ଡି ମୂଲ୍ୟ ପାଇଁ, ଦୟାକରି 'ବଜାର' ଟ୍ୟାବ୍ ଦେଖନ୍ତୁ | ପଞ୍ଜାବ ବଜାରରେ ଗହମ ମୂଲ୍ୟ ବୃଦ୍ଧି ପାଉଛି |",
      },
      yield: {
        en: "To improve yield: 1. Ensure soil testing. 2. Use certified seeds. 3. Follow timely irrigation. 4. Manage pests early with bio-pesticides.",
        hi: "पैदावार बढ़ाने के लिए: 1. मिट्टी की जांच कराएं। 2. प्रमाणित बीजों का उपयोग करें। 3. समय पर सिंचाई करें। 4. जैव-कीटनाशकों के साथ कीटों का प्रबंधन करें।",
        or: "ଅମଳ ବୃଦ୍ଧି ପାଇଁ: 1. ମାଟି ପରୀକ୍ଷା ନିଶ୍ଚିତ କରନ୍ତୁ | 2. ପ୍ରମାଣିତ ବିହନ ବ୍ୟବହାର କରନ୍ତୁ | 3. ଠିକ୍ ସମୟରେ ଜଳସେଚନ କରନ୍ତୁ | 4. ଜୈବ କୀଟନାଶକ ସହିତ ଶୀଘ୍ର ପୋକ ପରିଚାଳନା କରନ୍ତୁ |",
      },
      irrigation: {
        en: "Irrigation tip: Water early morning or late evening to reduce evaporation. For paddy, maintain standing water only at critical stages.",
        hi: "सिंचाई टिप: वाष्पीकरण कम करने के लिए सुबह जल्दी या देर शाम को पानी दें। धान के लिए, केवल महत्वपूर्ण चरणों में खड़ा पानी रखें।",
        or: "ଜଳସେଚନ ଟିପ୍ପଣୀ: ବାଷ୍ପୀକରଣ ହ୍ରାସ କରିବାକୁ ଭୋର କିମ୍ବା ବିଳମ୍ବିତ ସନ୍ଧ୍ୟାରେ ପାଣି ଦିଅନ୍ତୁ | ଧାନ ପାଇଁ, କେବଳ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ପର୍ଯ୍ୟାୟରେ ଛିଡା ହୋଇଥିବା ପାଣି ରଖନ୍ତୁ |",
      },
      wheat: {
        en: "Wheat Advisory: Sowing time is Nov 1-15. Use NPK 120:60:40. Irrigate at CRI stage (21 days after sowing).",
        hi: "गेहूं सलाह: बुवाई का समय 1-15 नवंबर है। NPK 120:60:40 का प्रयोग करें। CRI अवस्था (बुवाई के 21 दिन बाद) पर सिंचाई करें।",
        or: "ଗହମ ପରାମର୍ଶ: ବୁଣିବା ସମୟ ନଭେମ୍ବର 1-15 ଅଟେ | NPK 120:60:40 ବ୍ୟବହାର କରନ୍ତୁ | CRI ପର୍ଯ୍ୟାୟରେ ଜଳସେଚନ (ବୁଣିବାର 21 ଦିନ ପରେ) |",
      },
      rice: {
        en: "Rice Advisory: Maintain 2-5cm water level. Apply Urea in splits. Watch out for Stem Borer and Blast disease.",
        hi: "धान सलाह: 2-5 सेमी जल स्तर बनाए रखें। यूरिया को टुकड़ों में डालें। तना छेदक और ब्लास्ट रोग से सावधान रहें।",
        or: "ଧାନ ପରାମର୍ଶ: 2-5 ସେମି ଜଳ ସ୍ତର ବଜାୟ ରଖନ୍ତୁ | ୟୁରିଆକୁ ଭାଗ ଭାଗ କରି ପ୍ରୟୋଗ କରନ୍ତୁ | ଷ୍ଟେମ୍ ବୋରର୍ ଏବଂ ବ୍ଲାଷ୍ଟ ରୋଗ ପ୍ରତି ସାବଧାନ ରୁହନ୍ତୁ |",
      },
      general: {
        en: "General advisory: choose crops based on local climate and soil test. Maintain balanced NPK and use compost. Monitor pests weekly and irrigate based on soil moisture.",
        hi: "सामान्य सलाह: स्थानीय जलवायु और मिट्टी परीक्षण के आधार पर फसल चुनें। संतुलित NPK बनाए रखें और खाद का उपयोग करें। साप्ताहिक कीटों की निगरानी करें।",
        or: "ସାଧାରଣ ପରାମର୍ଶ: ସ୍ଥାନୀୟ ଜଳବାୟୁ ଏବଂ ମୃତ୍ତିକା ପରୀକ୍ଷା ଉପରେ ଆଧାର କରି ଫସଲ ବାଛନ୍ତୁ | ସନ୍ତୁଳିତ NPK ବଜାୟ ରଖନ୍ତୁ ଏବଂ କମ୍ପୋଷ୍ଟ ବ୍ୟବହାର କରନ୍ତୁ | ସାପ୍ତାହିକ ପୋକ ଉପରେ ନଜର ରଖନ୍ତୁ |",
      },
      fallback: {
        en: "I can help with weather, market prices, and crop advisory. Ask me about any of these.",
        hi: "मैं मौसम, मंडी भाव और फसल सलाह में मदद कर सकता हूं। मुझसे इनमें से किसी के बारे में भी पूछें।",
        or: "ମୁଁ ପାଣିପାଗ, ବଜାର ମୂଲ୍ୟ ଏବଂ ଫସଲ ପରାମର୍ଶରେ ସାହାଯ୍ୟ କରିପାରିବି | ଏଗୁଡିକ ବିଷୟରେ ମୋତେ ପଚାରନ୍ତୁ |",
      }
    };

    // Helper to get text based on lang
    const getText = (key: keyof typeof t) => {
      const entry = t[key] as any;
      if (isHi) return entry.hi;
      if (isOr) return entry.or;
      return entry.en;
    }

    if (/(weather|temp|rain|mausam|paanipaag)/.test(m) && lat != null && lon != null) {
      const key = process.env.OPENWEATHER_API_KEY;
      if (key) {
        const r = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`,
        );
        if (r.ok) {
          const w = await r.json();
          const getWText = t.weather[isHi ? 'hi' : isOr ? 'or' : 'en'];
          replies.push(getWText(w.weather?.[0]?.description || "", w.main?.temp ?? "?", w.main?.humidity ?? "?"));
        }
      }
    }

    if (/(price|mandi|market|bhav|daam|dar)/.test(m)) {
      replies.push(getText('market'));
    }

    if (/(yield|production|harvest|pedavar|amal)/.test(m)) {
      replies.push(getText('yield'));
    }

    if (/(irrigation|water|sinchai|pani|sechan)/.test(m)) {
      replies.push(getText('irrigation'));
    }

    if (/(crop|fertilizer|advice|advisory|wheat|rice|corn|gehu|dhan|fasal)/.test(m)) {
      if (m.includes("wheat") || m.includes("gehu")) {
        replies.push(getText('wheat'));
      } else if (m.includes("rice") || m.includes("paddy") || m.includes("dhan")) {
        replies.push(getText('rice'));
      } else {
        replies.push(getText('general'));
      }
    }

    if (!replies.length)
      replies.push(getText('fallback'));

    res.json({ reply: replies.join("\n") });
  } catch (e) {
    res.status(500).json({ error: "chat error" });
  }
};
