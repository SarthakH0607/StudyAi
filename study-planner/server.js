import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Set up file upload handling using multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// ----------------------------------------------------
// MAHARASHTRA BOARD SYLLABUS DATA (Std 5–12)
// ----------------------------------------------------
const MAHARASHTRA_SYLLABUS = {
  "5th Standard": {
    "Mathematics": ["Large Numbers", "Addition", "Subtraction", "Multiplication & Division", "Fractions", "Decimal Numbers", "Geometry Basics", "Measurement", "Data Handling"],
    "Science / EVS": ["Plants", "Animals", "Human Body", "Food & Nutrition", "Water", "Earth & Space"],
    "Social Studies": ["Maps", "Early Civilizations", "Environment", "Community"]
  },
  "6th Standard": {
    "Mathematics": ["Integers", "Fractions", "Decimals", "Algebra Introduction", "Geometry", "Symmetry"],
    "Science": ["Components of Food", "Motion", "Light", "Electricity", "Living Organisms"],
    "Social Science": ["Ancient History", "Globe & Maps", "Government"]
  },
  "7th Standard": {
    "Mathematics": ["Rational Numbers", "Percentage", "Algebraic Expressions", "Geometry", "Mensuration", "Statistics"],
    "Science": ["Heat", "Acids & Bases", "Nutrition", "Respiration", "Forests"],
    "Social Science": ["Medieval India", "Democracy", "Geography"]
  },
  "8th Standard": {
    "Mathematics": ["Linear Equations", "Squares & Roots", "Graphs", "Probability"],
    "Science": ["Force", "Pressure", "Metals", "Cell Structure", "Reproduction"],
    "Social Science": ["Modern India", "Constitution", "Resources"]
  },
  "9th Standard": {
    "Mathematics": ["Sets", "Polynomials", "Coordinate Geometry", "Linear Equations", "Statistics"],
    "Science": [
      "Physics: Motion", "Physics: Force", "Physics: Work & Energy",
      "Chemistry: Matter", "Chemistry: Atomic Structure",
      "Biology: Cells", "Biology: Tissues", "Biology: Health"
    ],
    "Social Science": ["History", "Geography", "Economics", "Political Science"]
  },
  "10th Standard": {
    "Mathematics": ["Trigonometry", "Geometry", "Probability", "Coordinate Geometry"],
    "Science": [
      "Physics: Electricity", "Physics: Light",
      "Chemistry: Carbon Compounds", "Chemistry: Chemical Reactions",
      "Biology: Life Processes", "Biology: Genetics"
    ],
    "Social Science": ["Nationalism", "Resources", "Economy"]
  },
  "11th Standard (Science)": {
    "Physics": ["Units", "Motion", "Laws of Motion", "Gravitation"],
    "Chemistry": ["Mole Concept", "Structure of Atom", "Chemical Bonding"],
    "Mathematics": ["Trigonometry", "Functions", "Probability"],
    "Biology": ["Diversity", "Plant Physiology", "Human Physiology"]
  },
  "12th Standard (Science)": {
    "Physics": ["Electrostatics", "Current Electricity", "Optics"],
    "Chemistry": ["Solutions", "Electrochemistry", "Organic Chemistry"],
    "Mathematics": ["Differentiation", "Integration", "Vectors", "Probability"],
    "Biology": ["Genetics", "Evolution", "Biotechnology", "Ecology"]
  },
  "11th Standard (Commerce)": {
    "Accounts": ["Accounting Principles", "Final Accounts"],
    "Economics": ["Microeconomics", "Macroeconomics"],
    "Business Studies": ["Business Environment", "Management"]
  },
  "12th Standard (Commerce)": {
    "Accounts": ["Accounting Principles", "Final Accounts"],
    "Economics": ["Microeconomics", "Macroeconomics"],
    "Business Studies": ["Business Environment", "Management"]
  },
  "11th Standard (Arts)": {
    "History": ["Ancient to Modern India"],
    "Geography": ["Human Geography"],
    "Political Science": ["Constitution", "Democracy"],
    "Sociology": ["Society", "Social Institutions"]
  },
  "12th Standard (Arts)": {
    "History": ["Ancient to Modern India"],
    "Geography": ["Human Geography"],
    "Political Science": ["Constitution", "Democracy"],
    "Sociology": ["Society", "Social Institutions"]
  }
};;

// Helper to make Gemini API calls
async function callGemini(messages, apiKey, model, jsonMode = false) {
  const activeKey = apiKey || process.env.AI_API_KEY;
  const activeModel = model || process.env.AI_MODEL || "gemini-2.5-flash";

  if (!activeKey) {
    throw new Error("Connect your AI API key in Settings to activate StudyAI.");
  }

  // Extract system instruction if present
  const systemMsgObj = messages.find(m => m.role === "system");
  const systemInstructionText = systemMsgObj ? systemMsgObj.content : "";

  // Map messages to Gemini's content format
  const contents = messages
    .filter(m => m.role !== "system")
    .map(m => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

  const payload = {
    contents,
    generationConfig: {
      temperature: 0.7,
    }
  };

  if (systemInstructionText) {
    payload.systemInstruction = {
      parts: [{ text: systemInstructionText }]
    };
  }

  if (jsonMode) {
    payload.generationConfig.responseMimeType = "application/json";
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${activeKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errMsg = errorData.error?.message || `API returned status ${response.status}`;
    throw new Error(`Gemini API Error: ${errMsg}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini API returned an empty response.");
  }
  return text;
}

// Helper to test if an API Key is connected and working
async function testConnection(apiKey, model) {
  if (process.env.SIMULATED_MODE === "true") {
    return { status: "Connected (Simulated Mode)", error: null };
  }
  try {
    await callGemini(
      [{ role: "user", content: "Respond with the word 'OK'." }],
      apiKey,
      model
    );
    return { status: "Connected", error: null };
  } catch (error) {
    return { status: "Not Connected", error: error.message };
  }
}

// ----------------------------------------------------
// LOCAL SIMULATION FALLBACKS (Free Mode)
// ----------------------------------------------------

function generateMockChatResponse(promptText, type) {
  const text = promptText.toLowerCase();
  let responseText = "";
  
  if (type === "definition") {
    if (text.includes("mitochondria")) {
      responseText = "**Mitochondria** are double-membrane-bound organelles found in most eukaryotic organisms. Often termed the **'powerhouses of the cell'**, their primary function is to generate adenosine triphosphate (ATP), which is used as a source of chemical energy for cellular processes.";
    } else if (text.includes("covalent")) {
      responseText = "A **Covalent Bond** is a chemical link between two atoms or ions in which the electron pairs are shared between them. This occurs when the electronegativity difference between the two atoms is too small for an electron transfer to take place to form ions.";
    } else {
      responseText = `**Definition**: Your query about "${promptText}" has been analyzed. A definition is a statement of the exact meaning of a word, term, or concept. In academic studies, definitions form the foundation of conceptual frameworks.`;
    }
  } else if (type === "coding" || text.includes("code") || text.includes("sort")) {
    responseText = `Here is an explanation and code for your computer science topic:

### Merge Sort Algorithm
Merge Sort is a Divide and Conquer algorithm. It divides the input array into two halves, calls itself for the two halves, and then merges the two sorted halves.

**Time Complexity**: O(N log N) in all 3 cases (worst, average, and best) because merge sort always divides the array into two halves and takes linear time to merge two halves.
**Space Complexity**: O(N) auxiliary space.

\`\`\`javascript
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);
  
  return merge(mergeSort(left), mergeSort(right));
}

function merge(left, right) {
  let result = [], l = 0, r = 0;
  while (l < left.length && r < right.length) {
    if (left[l] < right[r]) {
      result.push(left[l++]);
    } else {
      result.push(right[r++]);
    }
  }
  return result.concat(left.slice(l)).concat(right.slice(r));
}
\`\`\``;
  } else if (type === "math" || text.includes("solve") || text.includes("derivative")) {
    responseText = `Here are the solution steps for your mathematics question:

### Problem: Find the derivative of $f(x) = x^2 \\sin(x)$

We will use the **Product Rule** for differentiation:
$$\\frac{d}{dx}[u \\cdot v] = u'v + uv'$$

Let:
- $u = x^2 \\implies u' = 2x$
- $v = \\sin(x) \\implies v' = \\cos(x)$

Apply the formula:
$$f'(x) = (2x)(\\sin(x)) + (x^2)(\\cos(x))$$
$$f'(x) = 2x\\sin(x) + x^2\\cos(x)$$

**Final Answer:**
$$f'(x) = x(2\\sin(x) + x\\cos(x))$$`;
  } else if (type === "complex" || text.includes("photosynthesis") || text.includes("quantum")) {
    responseText = `Let's break down this complex topic using an easy-to-understand analogy:

### Understanding Photosynthesis

Imagine a plant leaf is a **solar-powered food factory**. 
- **Solar Panels (Chlorophyll)**: The leaf has microscopic green solar panels that catch sunlight.
- **Raw Materials**: The factory takes in Water from the soil (delivered through pipe roots) and Carbon Dioxide from the air (sucked in through tiny leaf windows called stomata).
- **The Process**: Using the sun's light energy, the factory mixes the water and carbon dioxide together.
- **The Output**: It creates Glucose (sugar/food for the plant) and releases Oxygen into the air as a waste product.

**Why it matters**: Without this solar-powered food factory, plants wouldn't grow, and there would be no oxygen for humans to breathe!`;
  } else {
    responseText = `### StudyAI Analysis: ${promptText}

Here is a summary based on your prompt:
- **Core Concept**: Analyzing key academic properties of the query.
- **Study Tip**: Try breaking this topic into three sub-points and testing yourself using active recall.
- **Examples**: Analysing patterns, applying formulas, or translating logic into clean segments will strengthen your comprehension.`;
  }

  return responseText + `\n\n*🤖 Note: This response is generated in **Simulated AI Mode** because your Gemini API key is missing, invalid, or has exceeded its free-tier rate limits. You can configure/verify your key on the Settings page.*`;
}

function generateDynamicMockNotes(noteType, sourceText) {
  const cleanText = sourceText.replace(/Manual User Notes:/i, "").trim();
  const sentences = cleanText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 8);
  const title = sentences[0] ? sentences[0].slice(0, 60) : "User Notes Outline";
  
  if (noteType === "Flashcards") {
    const cards = [];
    const maxCards = Math.min(4, Math.max(2, sentences.length));
    
    for (let i = 0; i < maxCards; i++) {
      const sentence = sentences[i];
      if (sentence) {
        cards.push({
          question: `Recall detail: "${sentence.slice(0, 45)}..."?`,
          answer: sentence
        });
      }
    }
    
    if (cards.length === 0) {
      cards.push({
        question: "What is the primary topic of the pasted study material?",
        answer: sourceText.slice(0, 100) + "..."
      });
    }
    
    return cards.map(c => `**Question**: ${c.question}\n**Answer**: ${c.answer}`).join("\n\n");
  }

  if (noteType === "Important Keywords") {
    const words = cleanText.match(/\b[A-Z][a-z]{3,}\b/g) || ["Key Concept", "Recall", "Comprehension"];
    const uniqueWords = [...new Set(words)].slice(0, 5);
    
    return `### Important Keywords & Terminology\n\n` + 
      uniqueWords.map((word, idx) => `- **${word}**: An important concept highlighted in the study material. Refer to paragraph ${idx+1} for application details.`).join("\n");
  }

  const summaryPoints = sentences.slice(0, Math.min(5, sentences.length)).map(s => `- ${s}.`).join("\n");
  
  return `### AI Generated ${noteType}: ${title}

#### ⚡ Quick Overview
${sentences[0] || "Pasted notes outline study parameters."}

#### 📄 Key Highlights
${summaryPoints || "- Practice active reading."}

#### 📋 Study Recommendation
Review these notes using the **Progress Tracker** to isolate weak subjects and target your next focus sprint.

*Note: Generated dynamically under Simulated AI Mode.*`;
}

function findSyllabusSubjectKey(userSubject, syllabus) {
  const cleanUserSub = userSubject.trim().toLowerCase();
  const syllabusKeys = Object.keys(syllabus);

  // 1. Exact match (case insensitive)
  for (const key of syllabusKeys) {
    if (key.toLowerCase() === cleanUserSub) {
      return key;
    }
  }

  // 2. Contains match (e.g. "math" -> "Mathematics", "evs" -> "Science / EVS")
  for (const key of syllabusKeys) {
    const keyLower = key.toLowerCase();
    if (keyLower.includes(cleanUserSub) || cleanUserSub.includes(keyLower)) {
      return key;
    }
  }

  // 3. Common abbreviations
  const abbreviations = {
    "math": "mathematics",
    "maths": "mathematics",
    "evs": "science / evs",
    "science": "science",
    "social": "social science",
    "soc sci": "social science",
    "history": "history",
    "geo": "geography",
    "pol sci": "political science",
    "accounts": "accounts",
    "eco": "economics",
    "bst": "business studies"
  };

  if (abbreviations[cleanUserSub]) {
    const mappedAbbr = abbreviations[cleanUserSub];
    for (const key of syllabusKeys) {
      if (key.toLowerCase().includes(mappedAbbr)) {
        return key;
      }
    }
  }

  return null;
}

function generateMockSchedule(subjects, hoursPerDay, priority, standard, examDate) {
  let stdKey = standard || "10th Standard";
  if (!MAHARASHTRA_SYLLABUS[stdKey]) {
    const found = Object.keys(MAHARASHTRA_SYLLABUS).find(k => k.toLowerCase().includes(stdKey.toLowerCase()));
    stdKey = found ? found : "10th Standard";
  }

  const syllabus = MAHARASHTRA_SYLLABUS[stdKey];
  const syllabusSubjects = Object.keys(syllabus);

  // Parse user subjects, default to syllabus subjects if empty
  const subs = subjects.split(",").map(s => s.trim()).filter(Boolean);
  
  const activeSubs = [];
  const activeSubKeys = [];
  
  if (subs.length > 0) {
    subs.forEach(s => {
      const matchKey = findSyllabusSubjectKey(s, syllabus);
      if (matchKey) {
        activeSubs.push(s); // Keep user's written format for UI
        activeSubKeys.push(matchKey); // Store official syllabus key
      } else {
        activeSubs.push(s);
        activeSubKeys.push(s); // Fallback
      }
    });
  } else {
    syllabusSubjects.forEach(s => {
      activeSubs.push(s);
      activeSubKeys.push(s);
    });
  }

  // Calculate days remaining until the exam
  let daysLeft = 30; // Default fallback if date not set or invalid
  if (examDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exam = new Date(examDate);
    exam.setHours(0, 0, 0, 0);
    const diffTime = exam - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (!isNaN(diffDays)) {
      daysLeft = diffDays;
    }
  }

  let scheduleMode = "deep"; // "cram", "prep", or "deep"
  if (daysLeft < 3) {
    scheduleMode = "cram";
  } else if (daysLeft <= 14) {
    scheduleMode = "prep";
  }

  const todayIndex = (new Date().getDay() + 6) % 7;
  let examDayIndex = -1;
  if (examDate) {
    examDayIndex = (new Date(examDate).getDay() + 6) % 7;
  }

  const dailyPlan = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, dIdx) => {
    // If the exam is within the current week (daysLeft < 7)
    if (daysLeft >= 0 && daysLeft < 7) {
      if (dIdx === examDayIndex) {
        return {
          day,
          tasks: [
            { title: "🎓 EXAM DAY! Good luck!", duration: "Full Day" }
          ]
        };
      }
      if (dIdx > examDayIndex) {
        return {
          day,
          tasks: [
            { title: "🎉 Free Day — Post-Exam Rest & Recovery", duration: "Enjoy your rest!" }
          ]
        };
      }
    }

    // Pick subjects sequentially
    const sIdx1 = dIdx % activeSubs.length;
    const sIdx2 = (dIdx + 1) % activeSubs.length;

    const s1 = activeSubs[sIdx1];
    const s2 = activeSubs[sIdx2];
    
    const key1 = activeSubKeys[sIdx1];
    const key2 = activeSubKeys[sIdx2];

    // Pick topic for subject from syllabus
    const topics1 = syllabus[key1] || ["Core Chapters", "Practice Sets"];
    const topics2 = syllabus[key2] || ["Core Chapters", "Practice Sets"];

    // Offset topic index dynamically by day index to avoid same-topic repeats
    let t1 = topics1[(dIdx + sIdx1) % topics1.length];
    let t2 = topics2[(dIdx + sIdx2 + 1) % topics2.length];
    
    if (t1 === t2 && topics2.length > 1) {
      t2 = topics2[(dIdx + sIdx2 + 2) % topics2.length];
    }

    if (scheduleMode === "cram") {
      return {
        day,
        tasks: [
          { title: `${s1}: ${t1} — Cram & Formula Practice`, duration: `${Math.round(hoursPerDay * 0.5 * 60)} min revision` },
          { title: `${s2}: ${t2} — High-Yield Exam Review`, duration: `${Math.round(hoursPerDay * 0.5 * 60)} min drill` }
        ]
      };
    } else if (scheduleMode === "prep") {
      return {
        day,
        tasks: [
          { title: `${s1}: ${t1} — Board Practice Questions`, duration: `${Math.round(hoursPerDay * 0.6 * 60)} min paper` },
          { title: `${s2}: ${t2} — Speed Drill Practice`, duration: `${Math.round(hoursPerDay * 0.4 * 60)} min sprint` }
        ]
      };
    } else {
      return {
        day,
        tasks: [
          { title: `${s1}: ${t1} — Deep Conceptual Study`, duration: `${Math.round(hoursPerDay * 0.6 * 60)} min study` },
          { title: `${s2}: ${t2} — Textbook Exercise Review`, duration: `${Math.round(hoursPerDay * 0.4 * 60)} min exercises` }
        ]
      };
    }
  });

  let weeklyPlan = "";
  let targets = [];
  let revisionSchedule = "";

  if (scheduleMode === "cram") {
    weeklyPlan = `⚠️ EXAM IS IMMINENT (${daysLeft} day(s) left)! Focus 100% on high-yield formulas, active recall cheat sheets, and diagnostic practice questions for ${activeSubs.join(", ")}. Do not read new chapters.`;
    targets = activeSubs.map((sub, idx) => {
      const key = activeSubKeys[idx];
      const topics = syllabus[key] || ["Revision"];
      return {
        subject: sub,
        target: `Rapid review of key topics: ${topics.slice(0, 3).join(", ")} before the exam.`
      };
    });
    revisionSchedule = "Conduct non-stop flashcard drills every day. Make sure you rest and get at least 8 hours of sleep on the night before the exam.";
  } else if (scheduleMode === "prep") {
    weeklyPlan = `📅 Exam is approaching soon (${daysLeft} days left). Prioritize past years' Maharashtra Board exam questions and time-bounded practice drills for ${activeSubs.join(", ")}.`;
    targets = activeSubs.map((sub, idx) => {
      const key = activeSubKeys[idx];
      const topics = syllabus[key] || ["Revision"];
      return {
        subject: sub,
        target: `Solve past board questions for: ${topics.slice(0, 3).join(", ")} under timed conditions.`
      };
    });
    revisionSchedule = "Attempt full-length self-tests on Wednesday and Friday. Review weaker sections on Sunday.";
  } else {
    weeklyPlan = `📚 Exam is in ${daysLeft} days. Take a structured approach to build deep conceptual foundations for ${activeSubs.join(", ")} based on the official Maharashtra Board curriculum.`;
    targets = activeSubs.map((sub, idx) => {
      const key = activeSubKeys[idx];
      const topics = syllabus[key] || ["Revision"];
      return {
        subject: sub,
        target: `Master fundamental topics: ${topics.slice(0, 3).join(", ")} including textbook exercises.`
      };
    });
    revisionSchedule = "Summarize core definitions into flashcards on Friday, and complete a spaced-repetition active recall review on Sunday.";
  }

  return {
    dailyPlan,
    weeklyPlan,
    studyTargets: targets,
    revisionSchedule
  };
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Get current configuration status (Connection Status)
app.get("/api/config", async (req, res) => {
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || "gemini-2.5-flash";
  const simulated = process.env.SIMULATED_MODE === "true";

  if (simulated) {
    return res.json({
      hasApiKey: false,
      maskedKey: "SIMULATED_ACTIVE",
      model,
      status: "Connected (Simulated)",
      error: null,
    });
  }

  if (!apiKey) {
    return res.json({
      hasApiKey: false,
      model,
      status: "Not Connected",
      error: "No API Key configured.",
    });
  }

  const maskedKey = apiKey.length > 15 
    ? `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}`
    : "••••••••••••";

  // Test the connection
  const conn = await testConnection(apiKey, model);

  return res.json({
    hasApiKey: true,
    maskedKey,
    model,
    status: conn.status,
    error: conn.error,
  });
});

// 2. Save settings and verify connection
app.post("/api/config", async (req, res) => {
  const { apiKey, model, simulatedMode } = req.body;

  try {
    const envPath = path.join(__dirname, ".env");
    let simulatedFlag = simulatedMode === true;
    
    if (simulatedFlag) {
      process.env.SIMULATED_MODE = "true";
      process.env.AI_API_KEY = "";
      process.env.AI_MODEL = model || "gemini-2.5-flash";
      
      const envContent = `AI_API_KEY=\nAI_MODEL=${model || "gemini-2.5-flash"}\nSIMULATED_MODE=true\n`;
      fs.writeFileSync(envPath, envContent, "utf8");
      
      return res.json({
        success: true,
        status: "Connected (Simulated)",
        error: null,
        model: model,
      });
    }

    if (!apiKey) {
      return res.status(400).json({ error: "API Key is required for live mode." });
    }

    process.env.SIMULATED_MODE = "false";
    const conn = await testConnection(apiKey, model);

    if (conn.status === "Connected") {
      const envContent = `AI_API_KEY=${apiKey}\nAI_MODEL=${model || "gemini-2.5-flash"}\nSIMULATED_MODE=false\n`;
      fs.writeFileSync(envPath, envContent, "utf8");

      process.env.AI_API_KEY = apiKey;
      process.env.AI_MODEL = model;
    }

    return res.json({
      success: conn.status === "Connected",
      status: conn.status,
      error: conn.error,
      model: model,
    });
  } catch (e) {
    console.error("Failed to save configuration:", e);
    return res.status(500).json({ error: `Internal Server Error: ${e.message}` });
  }
});

// 3. Doubt Solver Chat
app.post("/api/chat", async (req, res) => {
  const { messages, type } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid conversation history." });
  }

  const lastUserMsg = messages[messages.length - 1]?.content || "";

  if (process.env.SIMULATED_MODE === "true" || !process.env.AI_API_KEY) {
    const responseText = generateMockChatResponse(lastUserMsg, type);
    return res.json({ response: responseText });
  }

  let systemMessage = "You are StudyAI, an exceptionally helpful, supportive, and brilliant AI study tutor. " +
    "Give natural, human-like answers. Do not use generic templates or repeat yourself. " +
    "Adjust your answer length automatically based on context. Ask for clarification only if necessary.";

  switch (type) {
    case "definition":
      systemMessage += " The user is asking a definition question. Provide a short, precise, and clear explanation of the term.";
      break;
    case "concept":
      systemMessage += " The user is asking a concept question. Provide a thorough, step-by-step explanation building from basic concepts to advanced logic.";
      break;
    case "exam_prep":
      systemMessage += " The user is preparing for an exam. Generate concise, exam-focused study notes, listing key equations, formulas, or facts in bullet points.";
      break;
    case "coding":
      systemMessage += " The user is asking a coding question. Provide a brief explanation of the logic, followed by well-structured code blocks with helpful comments, and a short explanation of the runtime complexity.";
      break;
    case "math":
      systemMessage += " The user is asking a math problem. Solve it step-by-step. Break down every calculation and state the formula you are using clearly.";
      break;
    case "revision":
      systemMessage += " The user wants a quick revision. Provide a short, highly scannable, memory-friendly bulleted summary of the core concepts, highlighting key terms in bold.";
      break;
    case "complex":
      systemMessage += " The user is asking about a complex topic. Break it down using engaging, simple analogies and rich, real-world examples.";
      break;
  }

  const fullMessages = [{ role: "system", content: systemMessage }, ...messages];

  try {
    const text = await callGemini(fullMessages);
    return res.json({ response: text });
  } catch (error) {
    console.error("Gemini Live Error:", error);
    if (error.message.includes("quota") || error.message.includes("billing") || error.message.includes("key") || error.message.includes("invalid")) {
      console.warn("API quota exceeded or key issue. Falling back to local simulator.");
      const responseText = generateMockChatResponse(lastUserMsg, type);
      return res.json({ response: responseText, error: error.message, isSimulated: true });
    }
    return res.status(500).json({ error: error.message });
  }
});

// 4. Notes Generator
app.post("/api/generate-notes", upload.single("file"), async (req, res) => {
  const { content, noteType, manualNotes } = req.body;
  let textToProcess = content || "";

  if (req.file) {
    const buffer = req.file.buffer;
    const filename = req.file.originalname;
    
    if (filename.endsWith(".txt") || filename.endsWith(".md")) {
      textToProcess = buffer.toString("utf8");
    } else {
      const rawText = buffer.toString("ascii").replace(/[^\x20-\x7E\n\r\t]/g, " ");
      const cleanedText = rawText.replace(/\s+/g, " ").trim();
      if (cleanedText.length > 100) {
        textToProcess = `File name: ${filename}\n\nextracted text: ${cleanedText.slice(0, 15000)}`;
      } else {
        textToProcess = `Document uploaded: ${filename} (Size: ${buffer.length} bytes).`;
      }
    }
  }

  if (manualNotes) {
    textToProcess += `\n\nManual User Notes:\n${manualNotes}`;
  }

  if (process.env.SIMULATED_MODE === "true" || !process.env.AI_API_KEY) {
    const notesText = generateDynamicMockNotes(noteType, textToProcess);
    return res.json({ notes: notesText });
  }

  if (!textToProcess.trim()) {
    return res.status(400).json({ error: "Please provide some text, upload a file, or write manual notes." });
  }

  const systemMessage = "You are StudyAI, an advanced automated academic summarization engine. " +
    "You take reading assignments, textbook sections, or lecture transcripts and compile them into study materials. " +
    "Provide clear headings, bullet points, and clean Markdown formatting. Ensure the output is readable, accurate, and completely structured.";

  const userPrompt = `Please compile the following material into the format: "${noteType}".
Here is the input text:
---
${textToProcess}
---

Remember:
- For 'Flashcards', format as multiple cards, like:
  **Question**: [question text]
  **Answer**: [answer text]
- For 'Important Keywords', list each term in bold with its definition.
- For 'Short Notes', write a summary.
- For 'Detailed Notes', do a deep dive with subheadings.
- For 'One-page Summary', synthesize everything into a single, cohesive, highly dense page.
- Generate high-quality outputs with zero filler.`;

  try {
    const text = await callGemini([
      { role: "system", content: systemMessage },
      { role: "user", content: userPrompt }
    ]);
    return res.json({ notes: text });
  } catch (error) {
    console.error("Gemini Live Error:", error);
    if (error.message.includes("quota") || error.message.includes("billing") || error.message.includes("key") || error.message.includes("invalid")) {
      console.warn("API quota exceeded or key issue. Falling back to local simulator.");
      const notesText = generateDynamicMockNotes(noteType, textToProcess);
      return res.json({ notes: notesText, error: error.message, isSimulated: true });
    }
    return res.status(500).json({ error: error.message });
  }
});

// 5. Smart Study Planner
app.post("/api/generate-schedule", async (req, res) => {
  const { examDate, subjects, hoursPerDay, priority, standard } = req.body;

  if (!examDate || !subjects || !hoursPerDay) {
    return res.status(400).json({ error: "Missing required fields: examDate, subjects, or hoursPerDay." });
  }

  if (process.env.SIMULATED_MODE === "true" || !process.env.AI_API_KEY) {
    const scheduleData = generateMockSchedule(subjects, hoursPerDay, priority, standard, examDate);
    return res.json({ ...scheduleData, isSimulated: true });
  }

  const systemMessage = "You are StudyAI, a smart scheduler for academic tasks. " +
    "You balance workloads, prioritize tough subjects, and format output strictly as JSON. " +
    "Ensure you output ONLY a valid JSON object. No Markdown code fence (like ```json ... ```).";

  const standardSyllabus = MAHARASHTRA_SYLLABUS[standard] || MAHARASHTRA_SYLLABUS["10th Standard"];

  // Parse and map user subjects to official syllabus keys
  const subs = subjects.split(",").map(s => s.trim()).filter(Boolean);
  const mappedSubs = subs.map(s => {
    const matchKey = findSyllabusSubjectKey(s, standardSyllabus);
    return matchKey || s;
  });
  const mappedSubjectsStr = mappedSubs.join(", ");

  const userPrompt = `Create a custom study schedule leading up to my exam on ${examDate} for a student in ${standard || "10th Standard"}.
Subjects requested: ${subjects}
Mapped to official syllabus subjects: ${mappedSubjectsStr}
Study hours per day: ${hoursPerDay} hours
Priority level: ${priority || "Medium"}
Syllabus Standard Level: ${standard || "10th Standard"}

Here is the official syllabus topics guidelines for this standard level:
${JSON.stringify(standardSyllabus)}

Requirements:
  - Note the relation between today's date and the exam date (${examDate}). If the exam date falls within the current week (Monday-Sunday), do NOT schedule regular study sessions for days after the exam. Instead, mark the tasks for the exam day as "🎓 EXAM DAY! Good luck!" and days after it as "🎉 Free Day — Post-Exam Rest & Recovery".
  - Make sure to schedule tasks directly matching the topics specified in the syllabus guidelines for the selected subjects!
  - Ensure that tasks on a single day schedule DIFFERENT topics (do not repeat the same topic on the same day).
  - Balance subjects: allocate more time or earlier study days to difficult subjects.
  - Output a strict JSON object with this exact structure:
  {
    "dailyPlan": [
      { "day": "Mon", "tasks": [ { "title": "Subject — Specific Topic Name from Syllabus", "duration": "45 min" } ] }
    ],
    "weeklyPlan": "Summary of weekly goals and strategies suited for this standard level...",
    "studyTargets": [
      { "subject": "Subject Name", "target": "Specific milestone to achieve before the exam using syllabus topics" }
    ],
    "revisionSchedule": "Overview of when to revise and self-test..."
  }

  Ensure the "dailyPlan" has exactly 7 entries mapping to Mon, Tue, Wed, Thu, Fri, Sat, Sun.
  Put 1 to 3 distinct tasks per day, each with a duration (e.g. "45 min block", "60 min block", "30 min sprint").`;

  try {
    const jsonText = await callGemini([
      { role: "system", content: systemMessage },
      { role: "user", content: userPrompt }
    ], null, null, true);
    
    let cleaned = jsonText.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }
    
    const parsedData = JSON.parse(cleaned);
    return res.json(parsedData);
  } catch (error) {
    console.error("Gemini Live Error:", error);
    if (error.message.includes("quota") || error.message.includes("billing") || error.message.includes("key") || error.message.includes("invalid")) {
      console.warn("API quota exceeded or key issue. Falling back to local simulator.");
      const scheduleData = generateMockSchedule(subjects, hoursPerDay, priority, standard, examDate);
      return res.json({ ...scheduleData, error: error.message, isSimulated: true });
    }
    console.error("AI scheduling error:", error);
    return res.status(500).json({ error: `Failed to compile AI planner: ${error.message}` });
  }
});

// 6. Real-time resource generation ("Get Help" button support)
app.post("/api/task-resources", async (req, res) => {
  const { taskTitle, type } = req.body;

  if (!taskTitle) {
    return res.status(400).json({ error: "taskTitle is required." });
  }

  const simulated = process.env.SIMULATED_MODE === "true" || !process.env.AI_API_KEY;

  if (type === "notes") {
    if (simulated) {
      const mockNotes = `### Revision outline — ${taskTitle}

#### 💡 Core Concepts
- Define the 2–3 fundamental principles of ${taskTitle} that are most likely to appear on exam sheets.
- Anchor each theory with a practical application or coding logic.
- Identify the most common pitfalls or logic blocks where students lose marks.

#### 📈 Dynamic Practice Plan
- **15 Minutes**: Attempt active recall of the main formulas or definitions without notes.
- **20 Minutes**: Solve 2–3 practice prompts or outline a brief essay.
- **10 Minutes**: Review correct solutions, noting where logic branched.

#### 📋 Self-Testing Checklist
- Create a single visual chart or mindmap connecting this topic to neighboring chapters.
- Ensure that definitions of key terms are memorized word-for-word.
- Log your session progress in the tracker to update weak subjects.`;
      return res.json({ notes: mockNotes });
    }

    try {
      const systemMessage = "You are StudyAI. Provide a concise, structured study notes page for the topic requested. Use Markdown headers and bullet points.";
      const prompt = `Generate a revision outline, core concepts, practice plan, and study checklist for the topic: "${taskTitle}". Make it highly practical.`;
      const text = await callGemini([
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ]);
      return res.json({ notes: text });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (type === "quiz") {
    if (simulated) {
      const mockQuiz = [
        {
          q: `Which of the following is the most effective way to study "${taskTitle}"?`,
          options: [
            "Re-reading the textbook chapter repeatedly",
            "Testing yourself to actively retrieve ideas from memory",
            "Highlighting text in multiple colors",
            "Cramming the definitions only minutes before"
          ],
          correct: 1
        },
        {
          q: `When starting a study sprint on "${taskTitle}", how should you begin?`,
          options: [
            "With the easiest, most familiar concept",
            "With the most complex or weak concept to maximize focus energy",
            "By browsing study files",
            "By taking a break immediately"
          ],
          correct: 1
        },
        {
          q: `To ensure long-term retention of "${taskTitle}", you should:`,
          options: [
            "Study it once for 8 hours and never review it",
            "Review it at increasing intervals over time (Spaced Repetition)",
            "Avoid practice tests entirely",
            "Only study it with background music on"
          ],
          correct: 1
        }
      ];
      return res.json(mockQuiz);
    }

    try {
      const systemMessage = "You are StudyAI. Generate a multiple-choice practice quiz with exactly 3 questions. Return ONLY a valid JSON array, no Markdown wrappers.";
      const prompt = `Create a 3-question multiple-choice quiz about: "${taskTitle}". Each question must have:
      "q": Question text,
      "options": Array of 4 options,
      "correct": Index of the correct option (0-3).
      Format as a strict JSON array:
      [
        { "q": "...", "options": ["...", "...", "...", "..."], "correct": 0 }
      ]`;
      const text = await callGemini([
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ], null, null, true);
      
      let cleaned = text.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }
      return res.json(JSON.parse(cleaned));
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: "Invalid resource type." });
});

// Serve static assets from Vite's build in production
const distPath = path.join(__dirname, "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("/*splat", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`StudyAI backend running on http://localhost:${PORT}`);
});
