const { GoogleGenerativeAI } = require('@google/generative-ai');

// Helper to check if a valid API key exists
const isGeminiConfigured = () => {
  const key = process.env.GEMINI_API_KEY;
  return key && key.trim() !== '' && !key.includes('YOUR_GEMINI_API_KEY');
};

const getGeminiModel = () => {
  if (!isGeminiConfigured()) return null;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Default to gemini-1.5-flash which is standard and fast
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

// Safe JSON parser for AI outputs that might be wrapped in ```json ... ```
const extractJsonFromResponse = (text) => {
  try {
    const cleaned = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (err) {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerErr) {
        console.warn('Regex JSON parse failed, returning raw text fallback');
      }
    }
    return null;
  }
};

// Pre-defined intelligent fallback questions library
const FALLBACK_QUESTIONS = {
  Technical: {
    Beginner: [
      {
        question: 'What is the difference between let, var, and const in JavaScript?',
        topic: 'JavaScript',
        expectedPoints: ['Scope differences (function vs block)', 'Hoisting behavior', 'Reassignment vs immutability']
      },
      {
        question: 'Explain the concept of responsive web design and what CSS media queries do.',
        topic: 'CSS / Web Design',
        expectedPoints: ['Viewport units & fluid grids', 'Media query breakpoints', 'Mobile-first approach']
      },
      {
        question: 'What is a RESTful API and what are the standard HTTP methods used?',
        topic: 'Web APIs / Backend',
        expectedPoints: ['Stateless architecture', 'GET, POST, PUT, DELETE semantics', 'Status codes']
      },
      {
        question: 'Explain what an array and an object are in JavaScript and when to use each.',
        topic: 'Data Structures / JS',
        expectedPoints: ['Ordered list vs key-value store', 'Lookup complexity', 'Common use cases']
      },
      {
        question: 'What is the purpose of Git and how does git commit differ from git push?',
        topic: 'Version Control / Git',
        expectedPoints: ['Version history tracking', 'Local repository commit vs remote sync', 'Staging area']
      },
      {
        question: 'What is the DOM in web development and how do you manipulate it with JavaScript?',
        topic: 'Web Fundamentals',
        expectedPoints: ['Document Object Model tree', 'querySelector and event listeners', 'Repaints and reflows']
      },
      {
        question: 'What is the difference between SQL and NoSQL databases?',
        topic: 'DBMS',
        expectedPoints: ['Relational vs Document-based', 'Schema enforcement vs flexibility', 'ACID vs BASE']
      },
      {
        question: 'Explain what asynchronous JavaScript is and how Promises solve callback hell.',
        topic: 'JavaScript',
        expectedPoints: ['Single-threaded event loop', 'Promise states (pending, resolved, rejected)', 'async/await syntax']
      },
      {
        question: 'What are React props and state, and what is the key difference between them?',
        topic: 'React',
        expectedPoints: ['Props are read-only and passed from parent', 'State is managed locally within component', 'Re-rendering triggers']
      },
      {
        question: 'What is the difference between client-side and server-side rendering?',
        topic: 'Web Architecture',
        expectedPoints: ['Initial load speed vs SEO', 'Browser execution vs server compilation', 'Hydration']
      }
    ],
    Intermediate: [
      {
        question: 'How does the JavaScript Event Loop work with Call Stack, Task Queue, and Microtask Queue?',
        topic: 'JavaScript Engine',
        expectedPoints: ['Call Stack execution', 'Microtasks (Promises, queueMicrotask)', 'Macrotasks (setTimeout, DOM events)', 'Event loop tick']
      },
      {
        question: 'Explain React useEffect hook lifecycle, dependencies array, and cleanup functions.',
        topic: 'React',
        expectedPoints: ['Component mounting and updating', 'Dependency comparison', 'Memory leak prevention via cleanup']
      },
      {
        question: 'How do indexes in MongoDB or SQL work and what are the trade-offs of adding too many indexes?',
        topic: 'Database Optimization',
        expectedPoints: ['B-Tree / Hash indexes', 'Faster read queries vs slower write/update speed', 'Storage overhead']
      },
      {
        question: 'Explain JWT (JSON Web Tokens) structure and how authentication workflow works securely.',
        topic: 'Security / Auth',
        expectedPoints: ['Header, Payload, Signature', 'Stateless verification', 'XSS & CSRF considerations with HttpOnly cookies']
      },
      {
        question: 'What is middleware in Express.js and how does the next() function work?',
        topic: 'Node.js / Express',
        expectedPoints: ['Request-response pipeline', 'Error-handling middleware (4 arguments)', 'Modifying req/res objects']
      },
      {
        question: 'What is Database Normalization and why is 3NF (Third Normal Form) commonly targeted?',
        topic: 'DBMS',
        expectedPoints: ['Data redundancy elimination', 'Functional dependencies', 'Anomalies (insert, update, delete)']
      },
      {
        question: 'Explain the difference between synchronous vs asynchronous I/O in Node.js.',
        topic: 'Node.js',
        expectedPoints: ['Libuv thread pool', 'Non-blocking I/O model', 'High concurrency capability']
      },
      {
        question: 'What are React Hooks rules and why shouldn\'t hooks be called inside loops or conditional statements?',
        topic: 'React',
        expectedPoints: ['Order of hook calls preserved in fiber array', 'Predictable state management', 'Custom hooks encapsulation']
      },
      {
        question: 'Explain CORS (Cross-Origin Resource Sharing) and preflight OPTIONS requests.',
        topic: 'Web Security',
        expectedPoints: ['Same-origin policy enforcement', 'Access-Control-Allow-Origin headers', 'Simple vs preflighted requests']
      },
      {
        question: 'What is time complexity of common sorting algorithms (QuickSort, MergeSort) and how does Big-O notation evaluate scalability?',
        topic: 'Data Structures & Algorithms',
        expectedPoints: ['O(n log n) average vs O(n^2) worst', 'Space complexity tradeoffs', 'Divide and conquer paradigm']
      }
    ],
    Advanced: [
      {
        question: 'How would you design a distributed caching layer using Redis to handle high-concurrency read spikes and prevent cache stampede?',
        topic: 'System Design / Redis',
        expectedPoints: ['Cache-aside vs write-through', 'Mutex locking / probabilistic early expiration', 'TTL strategies', 'Eviction policies']
      },
      {
        question: 'Explain how Node.js garbage collection works (V8 engine), generations (Young vs Old), and how to detect memory leaks in production.',
        topic: 'Node.js Performance',
        expectedPoints: ['Mark-and-sweep algorithm', 'Scavenge for young generation', 'Heap snapshots and profiling', 'Unclosed listeners / closures']
      },
      {
        question: 'Compare horizontal vs vertical scaling and explain how database sharding handles petabyte-scale data distribution.',
        topic: 'System Design',
        expectedPoints: ['Partition keys & consistent hashing', 'Cross-shard queries overhead', 'Replication and failover']
      },
      {
        question: 'How does React 18 Concurrent Mode, Transitions, and Server Components (RSC) optimize render performance?',
        topic: 'React Internals',
        expectedPoints: ['Fiber reconciler interruptible work', 'Selective hydration', 'Zero-bundle-size server components']
      },
      {
        question: 'Explain ACID properties in distributed transactions and the CAP theorem / PACELC theorem trade-offs.',
        topic: 'Distributed Systems',
        expectedPoints: ['Consistency vs Availability vs Partition tolerance', '2-Phase Commit (2PC) vs Saga pattern', 'Eventual consistency']
      }
    ]
  },
  HR: {
    Beginner: [
      {
        question: 'Tell me about yourself, your educational background, and why you are interested in this career.',
        topic: 'Self Introduction',
        expectedPoints: ['Concise career summary', 'Key technical passions', 'Relevance to target role']
      },
      {
        question: 'What are your greatest strengths and how do they help you succeed in team projects?',
        topic: 'Strengths & Value',
        expectedPoints: ['Concrete strengths with examples', 'Self-awareness', 'Collaborative impact']
      },
      {
        question: 'What is one area you consider a weakness or room for growth, and what steps are you taking to improve it?',
        topic: 'Self Awareness / Growth',
        expectedPoints: ['Honest reflection without being self-destructive', 'Proactive action plan', 'Progress shown']
      },
      {
        question: 'Why do you want to join our organization specifically rather than other companies?',
        topic: 'Company Alignment',
        expectedPoints: ['Company mission alignment', 'Growth opportunities', 'Culture and technology fit']
      },
      {
        question: 'Where do you see yourself professionally in the next 3 to 5 years?',
        topic: 'Career Goals',
        expectedPoints: ['Realistic ambition', 'Commitment to continuous learning', 'Growth within engineering/leadership']
      },
      {
        question: 'Describe a college or personal project that you are most proud of and your individual contribution.',
        topic: 'Project Experience',
        expectedPoints: ['Problem solved', 'Specific technologies used', 'Key achievements and learnings']
      },
      {
        question: 'How do you handle deadlines and prioritize tasks when you have multiple assignments due?',
        topic: 'Time Management',
        expectedPoints: ['Task prioritization techniques', 'Proactive communication', 'Stress management']
      },
      {
        question: 'What does teamwork mean to you, and how do you support a teammate who is struggling?',
        topic: 'Teamwork & Collaboration',
        expectedPoints: ['Empathy and active listening', 'Knowledge sharing', 'Collaborative problem solving']
      },
      {
        question: 'How do you stay updated with new technologies and industry trends?',
        topic: 'Learning Agility',
        expectedPoints: ['Documentation, courses, tech blogs', 'Open-source or side projects', 'Curiosity']
      },
      {
        question: 'Do you have any questions for us regarding the role or company culture?',
        topic: 'Engagement & Inquiry',
        expectedPoints: ['Thoughtful questions about team, tech stack, or day-to-day expectations']
      }
    ],
    Intermediate: [
      {
        question: 'Describe a situation where you had a disagreement with a team member or project lead. How did you resolve it? (STAR method)',
        topic: 'Conflict Resolution',
        expectedPoints: ['Situation and Task context', 'Action taken objectively', 'Constructive outcome and relationship preserved']
      },
      {
        question: 'Tell me about a time when a project or feature did not go as planned. What went wrong and what did you learn?',
        topic: 'Resilience & Failure',
        expectedPoints: ['Accountability without blaming others', 'Root-cause analysis', 'Post-mortem and future adjustments']
      },
      {
        question: 'How do you receive and incorporate critical feedback from code reviews or mentors?',
        topic: 'Feedback Reception',
        expectedPoints: ['Non-defensive attitude', 'Actionable implementation', 'Appreciation for code quality standards']
      },
      {
        question: 'Describe a time when you had to learn an unfamiliar programming language, framework, or tool under tight deadlines.',
        topic: 'Adaptability',
        expectedPoints: ['Rapid learning strategy', 'Resourcefulness', 'Successful execution']
      },
      {
        question: 'How do you balance writing quick code to meet sprint deadlines versus writing clean, maintainable, and tested code?',
        topic: 'Work Ethics & Quality',
        expectedPoints: ['Technical debt awareness', 'Pragmatism and prioritization', 'Refactoring strategy']
      }
    ],
    Advanced: [
      {
        question: 'Describe how you mentor junior developers and foster an inclusive, high-performing engineering culture.',
        topic: 'Leadership & Mentorship',
        expectedPoints: ['Pair programming and empathetic coaching', 'Constructive code reviews', 'Promoting psychological safety']
      },
      {
        question: 'How do you navigate ambiguous requirements and align cross-functional stakeholders (Product, Design, QA)?',
        topic: 'Stakeholder Management',
        expectedPoints: ['Clarifying questions and scoping', 'Trade-off negotiations', 'Iterative milestone delivery']
      },
      {
        question: 'Tell me about a time you had to make an unpopular technical decision for the long-term benefit of the project.',
        topic: 'Strategic Decision Making',
        expectedPoints: ['Data-driven justification', 'Stakeholder buy-in', 'Long-term payoff observed']
      }
    ]
  }
};

/**
 * Generate interview questions using Google Gemini API or intelligent curated fallback
 */
const generateQuestions = async ({
  type = 'Technical',
  difficulty = 'Intermediate',
  totalQuestions = 5,
  targetRole = 'Software Engineer',
  resumeText = '',
}) => {
  const count = parseInt(totalQuestions, 10) || 5;

  if (isGeminiConfigured()) {
    try {
      const model = getGeminiModel();
      const prompt = `You are an expert interviewer conducting a ${difficulty}-level ${type} interview for the position of "${targetRole}".
Generate exactly ${count} distinct, professional interview questions.
${resumeText ? `Candidate Resume Highlights/Context:\n"""${resumeText.slice(0, 1500)}"""\nPlease tailor relevant questions toward the candidate's background and target role.` : ''}

CRITICAL: Return ONLY valid raw JSON array of objects. Do not wrap in markdown or prose.
Format:
[
  {
    "id": 1,
    "question": "Question text here",
    "topic": "Specific Topic (e.g. JavaScript, React, DBMS, System Design, Conflict Resolution)",
    "expectedPoints": ["Key point 1", "Key point 2"]
  }
]`;

      console.log('Invoking Google Gemini to generate interview questions...');
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsed = extractJsonFromResponse(responseText);

      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`✅ Successfully generated ${parsed.length} questions with Gemini`);
        return parsed.slice(0, count).map((q, idx) => ({
          id: idx + 1,
          question: q.question || `Interview Question ${idx + 1}`,
          topic: q.topic || (type === 'Technical' ? 'Technical Concepts' : 'Behavioral'),
          expectedPoints: Array.isArray(q.expectedPoints) ? q.expectedPoints : ['Relevance and clarity', 'Depth of knowledge'],
        }));
      }
    } catch (err) {
      console.warn('⚠️ Google Gemini API call failed or rate limited:', err.message);
      console.log('🔄 Utilizing intelligent fallback question generator...');
    }
  }

  // Fallback generation
  console.log(`Generating fallback ${type} (${difficulty}) questions...`);
  const typeQuestions = FALLBACK_QUESTIONS[type] || FALLBACK_QUESTIONS.Technical;
  const pool = (typeQuestions[difficulty] && typeQuestions[difficulty].length > 0)
    ? typeQuestions[difficulty]
    : typeQuestions.Beginner;

  // Shuffle and pick required count
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  // If pool has fewer than requested, cycle
  while (selected.length < count) {
    const nextQ = pool[selected.length % pool.length];
    selected.push({
      ...nextQ,
      question: `${nextQ.question} (Follow-up application)`,
    });
  }

  return selected.map((q, idx) => ({
    id: idx + 1,
    question: q.question,
    topic: q.topic || 'General',
    expectedPoints: q.expectedPoints || ['Clear explanation', 'Practical examples'],
  }));
};

/**
 * Evaluate single question answer using Google Gemini
 */
const evaluateAnswer = async ({
  question,
  topic = 'General',
  expectedPoints = [],
  userAnswer = '',
  type = 'Technical',
  difficulty = 'Intermediate',
}) => {
  const trimmedAnswer = userAnswer.trim();

  // If answer is empty or too short
  if (!trimmedAnswer || trimmedAnswer.length < 5) {
    return {
      score: 1,
      correctness: 'Incomplete / No Answer Provided',
      strengths: 'Question attempted or noted.',
      improvements: 'Provide a structured, comprehensive answer addressing the fundamental concepts and practical examples.',
      feedback: 'The answer was too brief or left blank. In real interviews, explain your thought process even if unsure.',
      topic: topic || 'General',
    };
  }

  if (isGeminiConfigured()) {
    try {
      const model = getGeminiModel();
      const prompt = `You are a senior technical & HR interview evaluator.
Evaluate the following candidate response to an interview question:

Interview Type: ${type}
Difficulty: ${difficulty}
Topic: ${topic}
Question: "${question}"
Expected Key Points: ${JSON.stringify(expectedPoints)}
Candidate's Answer: "${trimmedAnswer}"

Evaluate strictly and constructively.
CRITICAL: Respond ONLY with a valid JSON object without markdown fences or additional commentary:
{
  "score": <integer from 1 to 10>,
  "correctness": "<Brief assessment of accuracy: e.g. Highly Accurate / Partially Correct / Needs Improvement>",
  "strengths": "<What the candidate did well in 1-2 sentences>",
  "improvements": "<Specific areas for improvement in 1-2 sentences>",
  "feedback": "<Clear constructive feedback for the candidate in 2-3 sentences>",
  "topic": "${topic}"
}`;

      console.log('Evaluating answer with Google Gemini...');
      const result = await model.generateContent(prompt);
      const parsed = extractJsonFromResponse(result.response.text());

      if (parsed && typeof parsed.score === 'number') {
        const score = Math.max(1, Math.min(10, Math.round(parsed.score)));
        return {
          score,
          correctness: parsed.correctness || (score >= 7 ? 'Accurate' : score >= 5 ? 'Partially Correct' : 'Needs Improvement'),
          strengths: parsed.strengths || 'Addressed the core intent of the question.',
          improvements: parsed.improvements || 'Incorporate more technical depth and concrete industry examples.',
          feedback: parsed.feedback || 'Good effort. Strive to structure answers using the STAR method or technical trade-offs.',
          topic: parsed.topic || topic || 'General',
        };
      }
    } catch (err) {
      console.warn('⚠️ Gemini evaluation failed:', err.message);
      console.log('🔄 Using intelligent heuristic evaluation fallback...');
    }
  }

  // Fallback heuristic evaluation
  console.log('Performing heuristic answer evaluation...');
  const wordCount = trimmedAnswer.split(/\s+/).length;
  let score = 5;

  // Simple heuristic based on answer richness and keyword presence
  if (wordCount > 60) score += 2;
  else if (wordCount > 30) score += 1;
  else if (wordCount < 10) score -= 2;

  // Check expected points overlap
  if (Array.isArray(expectedPoints) && expectedPoints.length > 0) {
    const lowerAns = trimmedAnswer.toLowerCase();
    let matches = 0;
    expectedPoints.forEach((point) => {
      const words = point.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      if (words.some(w => lowerAns.includes(w))) {
        matches++;
      }
    });
    if (matches >= 2) score += 2;
    else if (matches === 1) score += 1;
  }

  score = Math.max(2, Math.min(9, score));

  return {
    score,
    correctness: score >= 8 ? 'Strong and Comprehensive' : score >= 6 ? 'Partially Correct & Relevant' : 'Needs More Depth',
    strengths: `Demonstrated foundational familiarity with ${topic}. Clear presentation of ideas.`,
    improvements: `Include more precise technical terminology, corner cases, and real-world project context.`,
    feedback: `Your response shows good intuition for ${topic}. To achieve top scores in actual interviews, structure your response with key definitions, practical examples, and potential trade-offs.`,
    topic: topic || 'General',
  };
};

/**
 * Generate comprehensive final interview feedback & weak topics
 */
const generateOverallFeedback = async ({
  interviewType = 'Technical',
  difficulty = 'Intermediate',
  questions = [],
  totalScore = 0,
  averageScore = 0,
}) => {
  const answeredQuestions = questions.filter(q => q.answered || q.userAnswer);

  if (isGeminiConfigured()) {
    try {
      const model = getGeminiModel();
      const summaryList = answeredQuestions.map((q, i) =>
        `Q${i+1} (${q.topic}): "${q.question}" -> Score: ${q.score}/10. Answer: "${q.userAnswer.slice(0, 150)}"`
      ).join('\n');

      const prompt = `You are a principal hiring manager reviewing a completed ${difficulty}-level ${interviewType} interview.
Candidate Performance Summary:
Average Score: ${averageScore}/10 (${totalScore} total points across ${answeredQuestions.length} questions).

Questions and Candidate Scores:
${summaryList}

Analyze strengths, weaknesses, actionable suggestions, and identify specific weak topics with their estimated weakness percentages (e.g. JavaScript 45%, React 30%, System Design 60%).

CRITICAL: Return ONLY a valid JSON object matching:
{
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "weakTopics": [
    { "topic": "Topic Name", "percentage": 45 },
    { "topic": "Topic Name 2", "percentage": 30 }
  ]
}`;

      console.log('Generating final interview feedback with Google Gemini...');
      const result = await model.generateContent(prompt);
      const parsed = extractJsonFromResponse(result.response.text());

      if (parsed && Array.isArray(parsed.strengths) && Array.isArray(parsed.weakTopics)) {
        return {
          strengths: parsed.strengths.slice(0, 4),
          weaknesses: parsed.weaknesses.slice(0, 4),
          suggestions: parsed.suggestions.slice(0, 4),
          weakTopics: parsed.weakTopics.map(w => ({
            topic: w.topic || 'General',
            percentage: Math.min(100, Math.max(10, Math.round(w.percentage || 40))),
          })),
        };
      }
    } catch (err) {
      console.warn('⚠️ Gemini overall feedback generation failed:', err.message);
    }
  }

  // Fallback overall feedback calculation based on question topics and scores
  console.log('Generating algorithmic overall feedback...');
  const topicScores = {};
  const topicCounts = {};

  questions.forEach((q) => {
    const t = q.topic || 'General Concepts';
    topicScores[t] = (topicScores[t] || 0) + (q.score || 0);
    topicCounts[t] = (topicCounts[t] || 0) + 1;
  });

  const weakTopics = [];
  const strongTopics = [];

  Object.keys(topicScores).forEach((t) => {
    const avg = topicScores[t] / topicCounts[t];
    if (avg < 7) {
      // Calculate weakness percentage (lower score = higher weakness)
      const weaknessPct = Math.round((10 - avg) * 10);
      weakTopics.push({ topic: t, percentage: Math.max(20, Math.min(85, weaknessPct)) });
    } else {
      strongTopics.push(t);
    }
  });

  // Default fallback topics if all scored well or none
  if (weakTopics.length === 0) {
    weakTopics.push({ topic: interviewType === 'Technical' ? 'Edge Case Handling' : 'STAR Method Nuance', percentage: 25 });
  }

  const strengths = [
    strongTopics.length > 0
      ? `Strong foundational knowledge in ${strongTopics.slice(0, 2).join(' and ')}.`
      : 'Demonstrated clear willingness to communicate and tackle complex questions.',
    averageScore >= 7
      ? 'Consistently provided articulate answers with relevant examples.'
      : 'Good effort in articulating concepts under interview constraints.',
    'Clear structured reasoning throughout the session.',
  ];

  const weaknesses = [
    weakTopics.length > 0
      ? `Identified knowledge gaps or lack of depth in ${weakTopics.map(w => w.topic).slice(0, 2).join(', ')}.`
      : 'Could provide deeper exploration of trade-offs and performance implications.',
    'Some responses could be more concise and directly address the key question prompts.',
  ];

  const suggestions = [
    'Practice explaining fundamental concepts aloud using the STAR (Situation, Task, Action, Result) method.',
    'Review technical documentation and perform hands-on coding exercises on weaker topics.',
    'Incorporate concrete industry metrics and real-world project examples in future interview rounds.',
  ];

  return {
    strengths,
    weaknesses,
    suggestions,
    weakTopics,
  };
};

module.exports = {
  isGeminiConfigured,
  generateQuestions,
  evaluateAnswer,
  generateOverallFeedback,
};
