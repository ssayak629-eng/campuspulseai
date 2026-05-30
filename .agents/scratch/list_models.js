const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../../.env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

async function testModel(genAI, modelName) {
  try {
    console.log(`Testing ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say hello");
    console.log(`✅ ${modelName} works! Response:`, result.response.text().trim());
    return true;
  } catch (error) {
    console.log(`❌ ${modelName} failed:`, error.message);
    return false;
  }
}

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in .env.local");
    return;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const modelsToTest = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-2.5-flash",
    "gemini-2.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-2.5-pro"
  ];
  
  for (const m of modelsToTest) {
    const success = await testModel(genAI, m);
    if (success) {
      console.log(`Found working model: ${m}`);
    }
  }
}

run();
