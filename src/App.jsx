import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Settings, RotateCcw, Trophy, Star, Heart,
  Circle, Square, Triangle, Hexagon, Cloud, Sun,
  CheckCircle, XCircle, ArrowRight, Home, Brain,
  Calculator, Palette, Shapes, Ruler, Zap, BookOpen, Tag, Languages,
  Type, Wand2, GraduationCap, Baby, School, Backpack, Feather, Grid3X3,
  MonitorPlay, X, Clock
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

// --- CHART REGISTRATION ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// --- FIREBASE SETUP ---
// TODO: PASTE YOUR FIREBASE CONFIGURATION HERE
// 1. Go to Firebase Console (console.firebase.google.com)
// 2. Select your project -> Project Settings (Gear icon) -> General
// 3. Scroll down to "Your apps" -> Select "Web" (</>)
// 4. Copy the values from the `firebaseConfig` object provided there.
const manualFirebaseConfig = {
  apiKey: "AIzaSyBOxW7jSfP5kfdYh_JJ8aRkXoe1vh0ZQBI",
  authDomain: "royalheritagegame.firebaseapp.com",
  projectId: "royalheritagegame",
  storageBucket: "royalheritagegame.firebasestorage.app",
  messagingSenderId: "553037442840",
  appId: "1:553037442840:web:e171b1ca4d2005cb31786d",
  measurementId: "G-9TNB4DWSQB"
};

// Logic to use the environment's auto-config OR your manual config above
// (This safely handles running both in this preview and on your own hosting)
const firebaseConfig = (typeof __firebase_config !== 'undefined' && __firebase_config)
  ? JSON.parse(__firebase_config)
  : manualFirebaseConfig;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'math-master-v1';

// --- GEMINI API SETUP ---
const apiKey = "AIzaSyD1Qk4qAf3rQXeBT72S-d7wV-IyJUtsN0I"; // Injected by environment
const GEMINI_MODEL = "gemini-1.5-flash-8b";

// --- VIDEO LIBRARY CONFIGURATION ---
// INSTRUCTIONS:
// 1. Upload video to Google Drive.
// 2. Right Click -> Share -> General Access -> "Anyone with the link" -> "Viewer".
// 3. Copy Link. It looks like: https://drive.google.com/file/d/123456789ABC/view?usp=sharing
// 4. The ID is the part between /d/ and /view. (e.g., 123456789ABC)
// 5. Add it below.
const VIDEO_LIBRARY = [
  { id: '1', title: 'Learn Counting 1-10', driveId: '1kBi1_ElLfo6ZAObzCE1txi819dIaYH5Z', grade: 'pg-lkg', subject: 'math' },
  { id: '2', title: 'Shapes Song', driveId: '1kBi1_ElLfo6ZAObzCE1txi819dIaYH5Z', grade: 'pg-lkg', subject: 'math' },
  { id: '3', title: 'Addition Tricks', driveId: '1kBi1_ElLfo6ZAObzCE1txi819dIaYH5Z', grade: '1-3', subject: 'math' },
  { id: '4', title: 'Nouns & Verbs', driveId: '1kBi1_ElLfo6ZAObzCE1txi819dIaYH5Z', grade: '1-3', subject: 'english' },
  { id: '5', title: 'Multiplication Tables', driveId: '1kBi1_ElLfo6ZAObzCE1txi819dIaYH5Z', grade: '4-5', subject: 'math' },
];

// --- ALGORITHMIC GENERATORS & DATABASES ---
const TENSE_VOCAB = {
  subjects: ["He", "She", "Rahul", "Priya", "The boy", "The girl", "My friend", "The teacher", "The dog", "My mother", "The player", "John"],
  verbs: [
    { obj: "cricket", forms: { "Simple Present": "plays", "Simple Past": "played", "Simple Future": "will play", "Present Continuous": "is playing", "Past Continuous": "was playing" } },
    { obj: "an apple", forms: { "Simple Present": "eats", "Simple Past": "ate", "Simple Future": "will eat", "Present Continuous": "is eating", "Past Continuous": "was eating" } },
    { obj: "a song", forms: { "Simple Present": "sings", "Simple Past": "sang", "Simple Future": "will sing", "Present Continuous": "is singing", "Past Continuous": "was singing" } },
    { obj: "to school", forms: { "Simple Present": "goes", "Simple Past": "went", "Simple Future": "will go", "Present Continuous": "is going", "Past Continuous": "was going" } },
    { obj: "a letter", forms: { "Simple Present": "writes", "Simple Past": "wrote", "Simple Future": "will write", "Present Continuous": "is writing", "Past Continuous": "was writing" } },
    { obj: "fast", forms: { "Simple Present": "runs", "Simple Past": "ran", "Simple Future": "will run", "Present Continuous": "is running", "Past Continuous": "was running" } },
    { obj: "in the pool", forms: { "Simple Present": "swims", "Simple Past": "swam", "Simple Future": "will swim", "Present Continuous": "is swimming", "Past Continuous": "was swimming" } },
    { obj: "hard", forms: { "Simple Present": "works", "Simple Past": "worked", "Simple Future": "will work", "Present Continuous": "is working", "Past Continuous": "was working" } },
    { obj: "a book", forms: { "Simple Present": "reads", "Simple Past": "read", "Simple Future": "will read", "Present Continuous": "is reading", "Past Continuous": "was reading" } },
    { obj: "dinner", forms: { "Simple Present": "cooks", "Simple Past": "cooked", "Simple Future": "will cook", "Present Continuous": "is cooking", "Past Continuous": "was cooking" } },
    { obj: "milk", forms: { "Simple Present": "drinks", "Simple Past": "drank", "Simple Future": "will drink", "Present Continuous": "is drinking", "Past Continuous": "was drinking" } },
    { obj: "a car", forms: { "Simple Present": "drives", "Simple Past": "drove", "Simple Future": "will drive", "Present Continuous": "is driving", "Past Continuous": "was driving" } },
    { obj: "a picture", forms: { "Simple Present": "paints", "Simple Past": "painted", "Simple Future": "will paint", "Present Continuous": "is painting", "Past Continuous": "was painting" } },
    { obj: "english", forms: { "Simple Present": "speaks", "Simple Past": "spoke", "Simple Future": "will speak", "Present Continuous": "is speaking", "Past Continuous": "was speaking" } },
    { obj: "a bird", forms: { "Simple Present": "sees", "Simple Past": "saw", "Simple Future": "will see", "Present Continuous": "is seeing", "Past Continuous": "was seeing" } },
  ]
};

const ALGO_DB = {
  vocab: [
    { w: "Big", s: "Huge", a: "Small" }, { w: "Small", s: "Tiny", a: "Big" },
    { w: "Happy", s: "Joyful", a: "Sad" }, { w: "Sad", s: "Unhappy", a: "Happy" },
    { w: "Fast", s: "Quick", a: "Slow" }, { w: "Slow", s: "Sluggish", a: "Fast" },
    { w: "Rich", s: "Wealthy", a: "Poor" }, { w: "Poor", s: "Needy", a: "Rich" },
    { w: "Hard", s: "Difficult", a: "Easy" }, { w: "Easy", s: "Simple", a: "Hard" },
    { w: "Start", s: "Begin", a: "End" }, { w: "End", s: "Finish", a: "Start" },
    { w: "Beautiful", s: "Pretty", a: "Ugly" }, { w: "Brave", s: "Courageous", a: "Cowardly" },
    { w: "Calm", s: "Peaceful", a: "Noisy" }, { w: "Create", s: "Make", a: "Destroy" },
    { w: "Dangerous", s: "Risky", a: "Safe" }, { w: "Dark", s: "Dim", a: "Bright" },
    { w: "True", s: "Correct", a: "False" }, { w: "Clean", s: "Tidy", a: "Dirty" },
    { w: "Love", s: "Adore", a: "Hate" }, { w: "Win", s: "Succeed", a: "Lose" },
    { w: "Old", s: "Ancient", a: "New" }, { w: "Young", s: "Youthful", a: "Old" },
    { w: "Wet", s: "Damp", a: "Dry" }, { w: "High", s: "Tall", a: "Low" },
    { w: "Full", s: "Complete", a: "Empty" }, { w: "Buy", s: "Purchase", a: "Sell" },
    { w: "Strong", s: "Powerful", a: "Weak" }, { w: "Wise", s: "Smart", a: "Foolish" },
    { w: "Kind", s: "Gentle", a: "Cruel" }, { w: "Wide", s: "Broad", a: "Narrow" },
    { w: "Thick", s: "Dense", a: "Thin" }, { w: "Top", s: "Peak", a: "Bottom" },
    { w: "Near", s: "Close", a: "Far" }, { w: "Always", s: "Forever", a: "Never" },
    { w: "Remember", s: "Recall", a: "Forget" }, { w: "Build", s: "Construct", a: "Demolish" },
    { w: "Laugh", s: "Giggle", a: "Cry" }, { w: "Friend", s: "Pal", a: "Enemy" },
    { w: "Give", s: "Offer", a: "Take" }, { w: "Push", s: "Shove", a: "Pull" },
    { w: "Throw", s: "Toss", a: "Catch" }, { w: "Sick", s: "Ill", a: "Healthy" },
    { w: "Quiet", s: "Silent", a: "Loud" }, { w: "Cheap", s: "Inexpensive", a: "Expensive" },
    { w: "Deep", s: "Profound", a: "Shallow" }, { w: "Heavy", s: "Weighty", a: "Light" },
    { w: "Sharp", s: "Keen", a: "Blunt" }, { w: "Sweet", s: "Sugary", a: "Bitter" }
  ],
  pos: [
    { s: "The *cat* sleeps.", t: "Noun" }, { s: "She *runs* fast.", t: "Verb" },
    { s: "It is *big*.", t: "Adjective" }, { s: "He ran *quickly*.", t: "Adverb" },
    { s: "*She* is nice.", t: "Pronoun" }, { s: "The book is *on* the table.", t: "Preposition" },
    { s: "I like tea *and* coffee.", t: "Conjunction" }, { s: "*Wow*! That's great.", t: "Interjection" },
    { s: "The *sun* shines.", t: "Noun" }, { s: "Birds *fly* high.", t: "Verb" },
    { s: "He is a *smart* boy.", t: "Adjective" }, { s: "Please speak *softly*.", t: "Adverb" },
    { s: "Go *to* school.", t: "Preposition" }, { s: "*He* plays cricket.", t: "Pronoun" },
    { s: "*Alas*! He failed.", t: "Interjection" }, { s: "Do it *now*.", t: "Adverb" },
    { s: "London is a big *city*.", t: "Noun" }, { s: "I *love* ice cream.", t: "Verb" },
    { s: "The sky is *blue*.", t: "Adjective" }, { s: "He works *hard*.", t: "Adverb" },
    { s: "Sit *under* the tree.", t: "Preposition" }, { s: "*They* are coming.", t: "Pronoun" },
    { s: "Bread *and* butter.", t: "Conjunction" }, { s: "*Ouch*! It hurts.", t: "Interjection" },
    { s: "A *herd* of cows.", t: "Noun" }, { s: "She *is* happy.", t: "Verb" },
    { s: "A *red* rose.", t: "Adjective" }, { s: "He speaks *fluently*.", t: "Adverb" },
    { s: "Jump *over* the wall.", t: "Preposition" }, { s: "*Who* is there?", t: "Pronoun" },
  ],
  spelling: [
    "Apple", "Ball", "Cat", "Dog", "Elephant", "Fish", "Grape", "House", "Ice", "Joker",
    "Kite", "Lion", "Monkey", "Nest", "Orange", "Parrot", "Queen", "Rabbit", "Sun", "Tiger",
    "Umbrella", "Van", "Watch", "Xylophone", "Yacht", "Zebra", "School", "Teacher", "Student",
    "Friend", "Family", "Garden", "Flower", "Water", "River", "Mountain", "Computer", "Bottle",
    "Chair", "Table", "Window", "Door", "Pencil", "Paper", "Book", "Light", "Phone", "Clock",
    "Doctor", "Nurse", "Police", "Driver", "Pilot", "Artist", "Singer", "Dancer", "Farmer", "Chef",
    "Bread", "Butter", "Cheese", "Pizza", "Burger", "Sandwich", "Salad", "Fruit", "Vegetable", "Juice",
    "Happy", "Sad", "Angry", "Funny", "Brave", "Scared", "Sleepy", "Hungry", "Thirsty", "Tired",
    "Circle", "Square", "Triangle", "Rectangle", "Star", "Heart", "Diamond", "Oval", "Cross", "Arrow",
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Month", "Year", "Week",
    "Summer", "Winter", "Spring", "Autumn", "Rain", "Snow", "Wind", "Storm", "Cloud", "Sky",
    "Head", "Eye", "Nose", "Mouth", "Ear", "Hand", "Leg", "Foot", "Arm", "Finger",
    "Car", "Bus", "Train", "Plane", "Ship", "Boat", "Bike", "Cycle", "Truck", "Jeep"
  ],
  articles: {
    a: ["boy", "cat", "dog", "pen", "book", "car", "house", "tree", "bird", "man", "woman", "teacher", "school", "ball", "bat", "cup", "fan", "hat", "king", "lion", "monkey", "nest", "pig", "rat", "star", "toy", "van", "watch", "yak", "zebra", "table", "chair", "spoon", "fork", "plate", "bag", "cap", "desk", "flag", "game", "horse", "kite", "lamp", "map", "net", "pet", "quilt", "ring", "ship", "tent", "vase", "wall", "box", "yard", "zoo", "banana", "mango", "peach", "pear", "plum"],
    an: ["apple", "ant", "egg", "elephant", "igloo", "ink", "octopus", "orange", "umbrella", "urn", "ice", "owl", "ear", "eye", "arm", "angel", "actor", "aunt", "uncle", "eagle", "insect", "island", "onion", "oven", "ox", "hour", "honest", "heir", "honor", "idea", "answer", "animal", "artist", "engine", "arrow", "axe", "anchor", "apron", "army", "ocean"]
  }
};

// --- STATIC BACKUP DATA (Fallback for Grammar/Word Problems) ---
const ENGLISH_STATIC = {
  grammar: [
    // UKG - 1
    { q: "___ apple", ans: "An", opts: ["A", "The"], level: 'ukg-pp' },
    { q: "___ boy", ans: "A", opts: ["An", "Two"], level: 'ukg-pp' },
    { q: "___ sun", ans: "The", opts: ["A", "An"], level: 'ukg-pp' },
    { q: "I ___ a girl.", ans: "am", opts: ["is", "are"], level: 'ukg-pp' },
    { q: "He ___ a boy.", ans: "is", opts: ["am", "are"], level: 'ukg-pp' },
    // 1-3
    { q: "Plural of 'Cat'", ans: "Cats", opts: ["Cates", "Catss"], level: '1-3' },
    { q: "Plural of 'Bus'", ans: "Buses", opts: ["Buss", "Buse"], level: '1-3' },
    { q: "Opposite gender of 'Boy'", ans: "Girl", opts: ["Man", "Woman"], level: '1-3' },
    { q: "She ___ playing.", ans: "is", opts: ["am", "are"], level: '1-3' },
    { q: "They ___ eating.", ans: "are", opts: ["is", "am"], level: '1-3' },
    // 4-5
    { q: "She ___ to school yesterday.", ans: "went", opts: ["go", "gone"], level: '4-5' },
    { q: "He is ___ tallest boy.", ans: "the", opts: ["a", "an"], level: '4-5' },
    { q: "The book is ___ the table.", ans: "on", opts: ["in", "at"], level: '4-5' },
    { q: "We ___ happy.", ans: "are", opts: ["is", "am"], level: '4-5' },
    // 6-8
    { q: "I have been waiting ___ 2 hours.", ans: "for", opts: ["since", "from"], level: '6-8' },
    { q: "The train ___ already left.", ans: "has", opts: ["have", "had"], level: '6-8' },
    { q: "If it rains, I ___ stay home.", ans: "will", opts: ["would", "should"], level: '6-8' },
    { q: "She is good ___ Math.", ans: "at", opts: ["in", "on"], level: '6-8' },
  ],
};

const STATIC_STORIES = [
  { q: "Rohan has 5 cricket bats. He buys 3 more. How many bats does he have now?", ans: 8, opts: [6, 8, 9, 10] },
  { q: "Priya made 12 Ladoos. Her mom made 8. How many Ladoos in total?", ans: 20, opts: [18, 20, 22, 15] },
  { q: "Rahul scored 25 runs. Virat scored 10 runs more than Rahul. How many runs did Virat score?", ans: 35, opts: [30, 35, 40, 25] },
  { q: "A shopkeeper sold 5 pens in the morning and 7 in the evening. Total pens?", ans: 12, opts: [10, 12, 14, 11] },
  { q: "Tina had 20 rupees. She bought a chocolate for 5 rupees. How much money is left?", ans: 15, opts: [10, 15, 12, 18] },
  { q: "There are 2 rows of trees. Each row has 6 trees. Total trees?", ans: 12, opts: [10, 12, 14, 18] },
  { q: "Share 10 mangoes equally among 2 friends. How many each?", ans: 5, opts: [4, 5, 6, 2] }
];

// --- GAME CONSTANTS & MAPPING ---
const GRADE_GROUPS = [
  { id: 'pg-lkg', label: 'PG - LKG', icon: <Baby className="w-6 h-6" />, color: 'bg-pink-100 text-pink-600 border-pink-200' },
  { id: 'ukg-pp', label: 'UKG - PP', icon: <Star className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600 border-yellow-200' },
  { id: '1-3', label: 'Class 1 - 3', icon: <Backpack className="w-6 h-6" />, color: 'bg-green-100 text-green-600 border-green-200' },
  { id: '4-5', label: 'Class 4 - 5', icon: <School className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600 border-blue-200' },
  { id: '6-8', label: 'Class 6 - 8', icon: <GraduationCap className="w-6 h-6" />, color: 'bg-purple-100 text-purple-600 border-purple-200' },
];

const MODES = {
  // VISUAL / BASIC
  COUNTING: { id: 'counting', name: 'Counting', icon: <Star className="w-6 h-6" /> },
  SHAPES: { id: 'shapes', name: 'Shapes', icon: <Shapes className="w-6 h-6" /> },
  COLORS: { id: 'colors', name: 'Colors', icon: <Palette className="w-6 h-6" /> },
  COMPARE: { id: 'compare', name: 'Compare', icon: <Ruler className="w-6 h-6" /> },
 
  // MATH OPS
  ADD: { id: 'add', name: 'Addition', icon: <Calculator className="w-6 h-6" /> },
  SUB: { id: 'sub', name: 'Subtraction', icon: <Calculator className="w-6 h-6" /> },
  MUL: { id: 'mul', name: 'Multiply', icon: <XCircle className="w-6 h-6" /> },
  DIV: { id: 'div', name: 'Division', icon: <RotateCcw className="w-6 h-6" /> },
  TABLES: { id: 'tables', name: 'Tables (1-20)', icon: <Grid3X3 className="w-6 h-6" /> },
  PATTERN: { id: 'pattern', name: 'Patterns', icon: <Brain className="w-6 h-6" /> },
  WORD_PROBLEMS: { id: 'word_problems', name: 'Word Problems', icon: <Feather className="w-6 h-6" /> },
 
  // ENGLISH
  SPELLING: { id: 'spelling', name: 'Spelling', icon: <Type className="w-6 h-6" /> },
  GRAMMAR: { id: 'grammar', name: 'Grammar', icon: <BookOpen className="w-6 h-6" /> },
  VOCAB: { id: 'vocab', name: 'Vocabulary', icon: <Wand2 className="w-6 h-6" /> },
  TENSES: { id: 'tenses', name: 'Tenses', icon: <Clock className="w-6 h-6" /> },
  POS: { id: 'pos', name: 'Parts of Speech', icon: <Tag className="w-6 h-6" /> },
};

const GRADE_CONTENT_MAP = {
  'pg-lkg': { math: ['COUNTING', 'SHAPES', 'COLORS'], english: [] },
  'ukg-pp': { math: ['COUNTING', 'COMPARE', 'PATTERN', 'ADD'], english: ['SPELLING', 'VOCAB', 'GRAMMAR'] },
  '1-3': { math: ['ADD', 'SUB', 'MUL', 'TABLES', 'PATTERN', 'WORD_PROBLEMS'], english: ['SPELLING', 'GRAMMAR', 'VOCAB'] },
  '4-5': { math: ['ADD', 'SUB', 'MUL', 'DIV', 'TABLES', 'WORD_PROBLEMS'], english: ['GRAMMAR', 'VOCAB', 'TENSES', 'POS', 'SPELLING'] },
  '6-8': { math: ['ADD', 'SUB', 'MUL', 'DIV', 'TABLES', 'PATTERN', 'WORD_PROBLEMS'], english: ['TENSES', 'POS', 'VOCAB', 'GRAMMAR', 'SPELLING'] }
};

const COLORS_MAP = {
  'Red': 'bg-red-500', 'Blue': 'bg-blue-500', 'Green': 'bg-green-500',
  'Yellow': 'bg-yellow-400', 'Purple': 'bg-purple-500', 'Orange': 'bg-orange-500'
};

const SHAPES_MAP = {
  'Circle': <Circle className="w-24 h-24 text-blue-500 fill-current" />,
  'Square': <Square className="w-24 h-24 text-green-500 fill-current" />,
  'Triangle': <Triangle className="w-24 h-24 text-red-500 fill-current" />,
  'Hexagon': <Hexagon className="w-24 h-24 text-yellow-500 fill-current" />,
  'Star': <Star className="w-24 h-24 text-purple-500 fill-current" />
};

export default function App() {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [playerName, setPlayerName] = useState(localStorage.getItem('mm_name') || '');
  const [gameState, setGameState] = useState('welcome');
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedTable, setSelectedTable] = useState(2); // Default table 2
  const [activeVideo, setActiveVideo] = useState(null);
 
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [performanceData, setPerformanceData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCoachMsg, setAiCoachMsg] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [aiBackgroundUpdate, setAiBackgroundUpdate] = useState(false);

  // --- REFS ---
  const timerRef = useRef(null);

  // --- AUTH & FIRESTORE SETUP ---
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Fetch Leaderboard
  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'math_master_leaderboard');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => b.score - a.score || a.totalTime - b.totalTime);
      setLeaderboard(data.slice(0, 10));
    }, (err) => console.error("Leaderboard error:", err));
    return () => unsubscribe();
  }, [user]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // --- GEMINI HELPERS ---
  const callGemini = async (prompt, isJson = false) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: isJson ? { responseMimeType: "application/json" } : {}
    };

    const delays = [1000, 2000, 4000, 8000, 16000];
   
    for (let i = 0; i < delays.length; i++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          if (response.status === 429 || response.status >= 500) {
            throw new Error(`Retryable error: ${response.status}`);
          }
          return null;
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
      } catch (error) {
        if (i === delays.length - 1) {
          console.error("Gemini API failed after retries:", error);
          return null;
        }
        await new Promise(resolve => setTimeout(resolve, delays[i]));
      }
    }
  };

  // --- HELPER: ALGORITHMIC GENERATORS ---
  const createAlgorithmicQuestion = (mode, count) => {
    const qs = [];
    const rand = (limit) => Math.floor(Math.random() * limit);

    for (let i = 0; i < count; i++) {
      if (mode === 'tenses') {
        const subj = TENSE_VOCAB.subjects[rand(TENSE_VOCAB.subjects.length)];
        const verbData = TENSE_VOCAB.verbs[rand(TENSE_VOCAB.verbs.length)];
        const forms = Object.keys(verbData.forms);
        const correctTense = forms[rand(forms.length)];
        const verbText = verbData.forms[correctTense];
        const sentence = `${subj} *${verbText}* ${verbData.obj}.`;
        const distractors = forms.filter(t => t !== correctTense).slice(0, 3);
        qs.push({ q: sentence, ans: correctTense, opts: [...distractors, correctTense].sort(() => Math.random() - 0.5), type: 'english' });
      }
      else if (mode === 'vocab') {
        const item = ALGO_DB.vocab[rand(ALGO_DB.vocab.length)];
        const isSynonym = Math.random() > 0.5;
        const question = isSynonym ? `Synonym of '${item.w}'?` : `Antonym of '${item.w}'?`;
        const ans = isSynonym ? item.s : item.a;
       
        const distractors = [];
        while(distractors.length < 3) {
          const other = ALGO_DB.vocab[rand(ALGO_DB.vocab.length)];
          const wrong = Math.random() > 0.5 ? other.s : other.a;
          if (wrong !== ans && !distractors.includes(wrong)) distractors.push(wrong);
        }
        qs.push({ q: question, ans: ans, opts: [...distractors, ans].sort(() => Math.random() - 0.5), type: 'english' });
      }
      else if (mode === 'pos') {
        const item = ALGO_DB.pos[rand(ALGO_DB.pos.length)];
        const distractors = ["Noun", "Verb", "Adjective", "Adverb", "Pronoun", "Preposition"].filter(t => t !== item.t).slice(0, 3);
        qs.push({ q: item.s, ans: item.t, opts: [...distractors, item.t].sort(() => Math.random() - 0.5), type: 'english' });
      }
      else if (mode === 'spelling') {
        const word = ALGO_DB.spelling[rand(ALGO_DB.spelling.length)];
        const distractors = new Set();
        
        const makeWrong = (original) => {
           let w = original.toLowerCase();
           const r = Math.random();
           // Strategy 1: Vowel swap (most common spelling error)
           if (r < 0.4) {
              const vowels = ['a','e','i','o','u'];
              const chars = w.split('');
              let swapped = false;
              for(let i=0; i<chars.length; i++) {
                 if (vowels.includes(chars[i])) {
                    // Replace with different random vowel
                    const v = vowels.filter(v => v !== chars[i]);
                    chars[i] = v[Math.floor(Math.random() * v.length)];
                    swapped = true;
                    break;
                 }
              }
              if (swapped) w = chars.join('');
              else w = w + 'e'; // No vowels? add 'e'
           } 
           // Strategy 2: Double consonant
           else if (r < 0.7) {
              const idx = Math.floor(Math.random() * w.length);
              w = w.slice(0, idx) + w[idx] + w.slice(idx);
           }
           // Strategy 3: Drop char
           else {
              if(w.length > 3) {
                 const idx = Math.floor(Math.random() * w.length);
                 w = w.slice(0, idx) + w.slice(idx+1);
              } else {
                 w = w + 'z';
              }
           }
           // Restore Capitalization
           return w.charAt(0).toUpperCase() + w.slice(1);
        };

        let attempts = 0;
        while(distractors.size < 3 && attempts < 50) {
           const wrong = makeWrong(word);
           if(wrong !== word) distractors.add(wrong);
           attempts++;
        }
        // Fallbacks if generation fails to be unique
        if (!distractors.has(word + 'z')) distractors.add(word + 'z');
        if (!distractors.has('e' + word)) distractors.add('e' + word);
        if (!distractors.has(word.split('').reverse().join(''))) distractors.add(word.split('').reverse().join(''));
        
        const finalOpts = [...Array.from(distractors).slice(0,3), word].sort(() => Math.random() - 0.5);
        qs.push({ q: "Which is correct?", ans: word, opts: finalOpts, type: 'english' });
      }
      else if (mode === 'grammar') {
        const isAn = Math.random() > 0.5;
        const noun = isAn
          ? ALGO_DB.articles.an[rand(ALGO_DB.articles.an.length)]
          : ALGO_DB.articles.a[rand(ALGO_DB.articles.a.length)];
        const q = `___ ${noun}`;
        const ans = isAn ? "An" : "A";
        qs.push({ q: q, ans: ans, opts: ["A", "An", "The"].sort(() => Math.random() - 0.5), type: 'english' });
      }
    }
    return qs;
  };

  // --- QUESTION GENERATION ENGINE ---
  const generateQuestions = async (modeId, specificTable = null) => {
    setAiLoading(false);
    const newQuestions = [];
    const count = 10;
   
    const tableToUse = specificTable || selectedTable;

    try {
      if (['tenses', 'vocab', 'pos', 'spelling', 'grammar'].includes(modeId)) {
         if (modeId === 'grammar') {
            const algoQs = createAlgorithmicQuestion('grammar', 5);
            const pool = ENGLISH_STATIC[modeId] || [];
            const staticQs = [...pool].sort(() => Math.random() - 0.5).slice(0, 5)
                .map(q => ({...q, type: 'english', opts: q.opts.sort(() => Math.random() - 0.5)}));
            setQuestions([...algoQs, ...staticQs].sort(() => Math.random() - 0.5));
         } else {
            setQuestions(createAlgorithmicQuestion(modeId, count));
         }
      }
      else if (modeId === 'word_problems') {
         const pool = STATIC_STORIES;
         const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
         setQuestions(shuffled.map(q => ({...q, type: 'english', opts: q.opts.sort(() => Math.random() - 0.5)})));
      }
      else {
         for(let i=0; i<count; i++) {
            newQuestions.push(createInstantQuestion(modeId, selectedGrade, tableToUse));
         }
         setQuestions(newQuestions);
      }
     
      startGameSession();

      // Background AI Fetch
      const needsAI = modeId === 'word_problems';

      if (needsAI) {
        setAiBackgroundUpdate(true);
        const prompt = buildAIPrompt(modeId, selectedGrade);
       
        callGemini(prompt, true).then(aiResponse => {
          setAiBackgroundUpdate(false);
          if (aiResponse) {
            const parsed = JSON.parse(aiResponse);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const aiQs = parsed.map(item => {
                const distractors = Array.isArray(item.options) ? item.options.slice(0, 3) : [];
                return {
                  q: item.question,
                  ans: item.answer,
                  opts: [...distractors, item.answer].sort(() => Math.random() - 0.5),
                  type: 'english'
                };
              });
             
              setQuestions(prev => {
                const updated = [...prev];
                for(let i=0; i<aiQs.length; i++) {
                  if(i+3 < updated.length) updated[i+3] = aiQs[i];
                }
                return updated;
              });
            }
          }
        }).catch(err => {
          console.log("Background AI Fetch Failed", err);
          setAiBackgroundUpdate(false);
        });
      }

    } catch (e) {
      console.error("Generation Error", e);
    }
  };

  // --- LOGIC: STATIC QUESTION GENERATOR ---
  const createInstantQuestion = (mode, grade, tableNum = 2) => {
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
   
    let maxNum = 9;
    if (grade === 'ukg-pp') maxNum = 15;
    if (grade === '1-3') maxNum = 50;
    if (grade === '4-5') maxNum = 99;
    if (grade === '6-8') maxNum = 999;

    let q = "", ans = 0, opts = [], type = "text";
    let icon = null;

    if (mode === 'tables') {
      let b = rand(1, 10);
      ans = tableNum * b;
      q = `${tableNum} × ${b} = ?`;
      opts = generateOptions(ans, 0, tableNum * 12);
    }
    else if (mode === 'counting') {
      const limit = grade === 'pg-lkg' ? 5 : 9;
      ans = rand(1, limit);
      type = 'count';
      icon = ['star', 'heart', 'sun'][rand(0,2)];
      q = "Count items";
      opts = generateOptions(ans, 1, 10);
    }
    else if (mode === 'shapes') {
      const keys = Object.keys(SHAPES_MAP);
      ans = keys[rand(0, keys.length-1)];
      q = `Find: ${ans}`;
      type = 'shape';
      opts = [ans, ...keys.filter(k => k !== ans).slice(0,3)].sort(() => Math.random() - 0.5);
    }
    else if (mode === 'colors') {
      const keys = Object.keys(COLORS_MAP);
      ans = keys[rand(0, keys.length-1)];
      q = `Tap ${ans}`;
      type = 'color';
      opts = [ans, ...keys.filter(k => k !== ans).slice(0,3)].sort(() => Math.random() - 0.5);
    }
    else if (mode === 'compare') {
      let a = rand(1, maxNum), b = rand(1, maxNum);
      if (a === b) b++;
      q = `${a} _ ${b}`;
      ans = a > b ? '>' : '<';
      opts = ['>', '<', '='];
    }
    else if (['add', 'sub', 'mul', 'div'].includes(mode)) {
      let a = rand(1, maxNum), b = rand(1, maxNum);
      if (mode === 'add') { ans = a + b; q = `${a} + ${b} = ?`; }
      if (mode === 'sub') {
        if (a < b) [a, b] = [b, a];
        ans = a - b; q = `${a} - ${b} = ?`;
      }
      if (mode === 'mul') {
        b = rand(1, grade === '1-3' ? 5 : 12); // Smaller multiplier
        ans = a * b; q = `${a} × ${b} = ?`;
      }
      if (mode === 'div') {
        b = rand(2, 10);
        a = b * rand(1, 10);
        ans = a / b; q = `${a} ÷ ${b} = ?`;
      }
      opts = generateOptions(ans, 0, ans*2 + 10);
    }
    else if (mode === 'pattern') {
      const start = rand(1, 10);
      const step = rand(2, 5);
      const seq = [start, start+step, start+step*2, start+step*3];
      const hidden = rand(0, 3);
      ans = seq[hidden];
      seq[hidden] = '?';
      q = seq.join(', ');
      opts = generateOptions(ans, 0, 100);
    }
   
    return { q, ans, opts, type, icon };
  };

  const generateOptions = (correct, min, max) => {
    const set = new Set([correct]);
    let attempts = 0;
    while(set.size < 4 && attempts < 20) {
      let val = correct + (Math.floor(Math.random() * 10) - 5);
      if (val >= min && val <= max && val !== correct && val >= 0) set.add(val);
      else {
        const randomVal = Math.floor(Math.random() * (max - min)) + min;
        if (randomVal >= 0) set.add(randomVal);
      }
      attempts++;
    }
    while(set.size < 4) {
       set.add(Math.floor(Math.random() * 100));
    }
    return Array.from(set).sort(() => Math.random() - 0.5);
  };

  // --- AI PROMPT BUILDER ---
  const buildAIPrompt = (mode, grade) => {
    const gradeLabel = GRADE_GROUPS.find(g => g.id === grade)?.label || "Grade 4";
    const context = "CBSE English Medium School standard. Context: Indian culture/Daily life.";
   
    if (mode === 'word_problems') {
       return `Generate 7 unique math word problems for ${gradeLabel} student. ${context}. Operations: Add/Sub/Mul/Div. Keep numbers appropriate for grade. Format JSON: [{question: "text", answer: number, options: [num1, num2, num3]}]`;
    }

    return null;
  };

  // --- GAMEPLAY HANDLERS ---
  const startGameSession = () => {
    setCurrentQIndex(0); setScore(0); setPerformanceData([]); setGameState('playing'); startTimer();
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(20); setQuestionStartTime(Date.now());
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
           return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Watch for timer hitting 0
  useEffect(() => {
    if (timer === 0 && gameState === 'playing' && questionStartTime > 0) {
       handleAnswer(null, true);
    }
  }, [timer, gameState]);


  const handleAnswer = (selected, isTimeout = false) => {
    // FIX: Prevent double clicks during feedback animation
    if (feedback) return;

    clearInterval(timerRef.current);
    const currentQ = questions[currentQIndex];
    if (!currentQ) return;

    const isCorrect = !isTimeout && selected === currentQ.ans;
    const timeTaken = (Date.now() - questionStartTime) / 1000;
   
    setPerformanceData(prev => [...prev, { q: currentQIndex + 1, time: Math.min(timeTaken, 20), isCorrect }]);

    if (isCorrect) { setScore(prev => prev + 1); setFeedback('correct'); }
    else { setFeedback('wrong'); }

    setTimeout(() => {
      setFeedback(null);
      if (currentQIndex < questions.length - 1) {
          setCurrentQIndex(prev => prev + 1);
          startTimer();
      }
      else {
          finishGame();
      }
    }, 1000);
  };

  const finishGame = async () => {
    setGameState('result');
  };
 
  // Effect to handle Game Over saving
  useEffect(() => {
      if (gameState === 'result') {
        const saveResult = async () => {
            // FIX: rely on performanceData to calculate score, ensuring no stale closures or double counts
            const calculatedScore = performanceData.filter(d => d.isCorrect).length;
            const totalTime = performanceData.reduce((acc, curr) => acc + curr.time, 0);
           
            setScore(calculatedScore);

            if (user) {
                try {
                    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'math_master_leaderboard'), {
                    name: playerName,
                    score: calculatedScore,
                    mode: selectedMode,
                    grade: selectedGrade,
                    totalTime: Math.round(totalTime * 10) / 10,
                    timestamp: serverTimestamp()
                    });
                } catch (e) { console.error("Save failed", e); }
            }

            const messages = [
              "Great job!", "Super Star!", "Keep it up!", "Math Wizard!",
              "Awesome!", "Fantastic work!", "You are doing great!", "Way to go!",
              "Excellent!", "Brilliant!"
            ];
            setAiCoachMsg(messages[Math.floor(Math.random() * messages.length)]);
        };
        saveResult();
      }
  // FIX: Added performanceData to dependencies to ensure accurate score calculation
  }, [gameState, performanceData, user, playerName, selectedMode, selectedGrade]);


  // --- RENDER HELPERS ---
  const renderIcon = (type, count) => {
    const icons = [];
    const IconTag = type === 'star' ? Star : (type === 'heart' ? Heart : Sun);
    for (let i = 0; i < count; i++) {
      icons.push(<IconTag key={i} className="w-8 h-8 md:w-12 md:h-12 text-yellow-500 fill-current" />);
    }
    return <div className="flex flex-wrap gap-2 justify-center max-w-[300px]">{icons}</div>;
  };

  const renderEnglishText = (text) => {
    if (text && typeof text === 'string' && text.includes('*')) {
      const parts = text.split('*');
      return <span>{parts[0]}<span className="text-blue-500 font-extrabold underline decoration-blue-300 decoration-4 mx-1">{parts[1]}</span>{parts[2]}</span>;
    }
    return text;
  };

  // --- SCREENS ---
 
  // 1. WELCOME
  if (gameState === 'welcome') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 to-indigo-600 p-4 text-white font-sans">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-white/20">
          <Brain className="w-20 h-20 mx-auto mb-4 text-yellow-300" />
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">Royal Heritage</h1>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Online Learning Platform</h2>
          <p className="mb-8 text-blue-100">Educational Games for Students</p>
          <input type="text" placeholder="Enter Your Name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full px-6 py-4 rounded-xl text-gray-800 text-xl font-bold mb-6 focus:ring-4 focus:ring-yellow-400 outline-none" autoFocus />
          <button onClick={() => { if(playerName.trim()){ localStorage.setItem('mm_name', playerName); setGameState('grade_select'); }}} disabled={!playerName.trim()} className="w-full bg-yellow-400 hover:bg-yellow-300 text-indigo-900 text-xl font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">START <ArrowRight /></button>
        </div>
      </div>
    );
  }

  // 2. GRADE SELECTION
  if (gameState === 'grade_select') {
    return (
      <div className="min-h-screen bg-indigo-50 p-4 flex flex-col items-center justify-center font-sans">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-indigo-900">Select Your Class</h2>
            <p className="text-indigo-600">Choose your grade level to start playing</p>
          </div>
          <div className="grid gap-4">
            {GRADE_GROUPS.map(group => (
              <button key={group.id} onClick={() => { setSelectedGrade(group.id); setGameState('menu'); }} className={`flex items-center p-6 rounded-2xl shadow-sm hover:shadow-md border-b-4 active:border-b-0 active:translate-y-1 transition-all ${group.color} bg-white`}>
                <div className="mr-4 p-3 rounded-full bg-white/50">{group.icon}</div>
                <span className="text-2xl font-bold">{group.label}</span>
                <ArrowRight className="ml-auto w-6 h-6 opacity-50" />
              </button>
            ))}
          </div>
          <button onClick={() => setGameState('welcome')} className="mt-8 text-indigo-400 font-bold mx-auto block hover:text-indigo-600">Back</button>
        </div>
      </div>
    );
  }

  // 2.5 TABLE SELECTION SCREEN
  if (gameState === 'table_select') {
    return (
      <div className="min-h-screen bg-indigo-50 p-4 flex items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-lg">
          <h2 className="text-2xl font-bold text-center mb-2 text-indigo-900">Select Table</h2>
          <p className="text-center text-gray-500 mb-6">Choose a number to practice tables (1 to 20)</p>
         
          <div className="grid grid-cols-5 gap-3">
            {Array.from({length: 20}, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => {
                  setSelectedTable(num);
                  setSelectedMode('tables');
                  generateQuestions('tables', num); // Pass selected number directly
                }}
                className="bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold py-3 rounded-xl transition-all shadow-sm active:scale-95 text-lg"
              >
                {num}
              </button>
            ))}
          </div>
          <button
            onClick={() => setGameState('menu')}
            className="mt-8 w-full text-indigo-400 font-bold hover:text-indigo-600"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // 3. MENU (SUBJECT & GAME SELECTION)
  if (gameState === 'menu') {
    const config = GRADE_CONTENT_MAP[selectedGrade] || GRADE_CONTENT_MAP['pg-lkg'];
    const availableModes = config[selectedSubject].map(key => MODES[key]).filter(Boolean);
   
    return (
      <div className="min-h-screen bg-indigo-50 p-4 md:p-8 font-sans">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 border-b-2 border-indigo-100 pb-4">
             <h1 className="text-2xl font-extrabold text-indigo-800">Royal Heritage Online Learning Platform</h1>
             <p className="text-indigo-500 font-semibold">{GRADE_GROUPS.find(g=>g.id===selectedGrade)?.label} Zone</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-indigo-900">Hi, {playerName}!</h2>
           
            {/* SUBJECT TOGGLE (Hide English for PG-LKG if empty) */}
            {config.english.length > 0 && (
              <div className="flex bg-white rounded-xl p-1 shadow-sm border border-indigo-100">
                 <button onClick={() => setSelectedSubject('math')} className={`px-6 py-2 rounded-lg font-bold transition-all ${selectedSubject === 'math' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                   <Calculator className="w-4 h-4 inline mr-2" />Math
                 </button>
                 <button onClick={() => setSelectedSubject('english')} className={`px-6 py-2 rounded-lg font-bold transition-all ${selectedSubject === 'english' ? 'bg-pink-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                   <BookOpen className="w-4 h-4 inline mr-2" />English
                 </button>
              </div>
            )}
            <button onClick={() => setGameState('grade_select')} className="text-indigo-500 hover:text-indigo-700 font-medium">Change Class</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
            {availableModes.map(m => (
              <button
                key={m.id}
                onClick={() => {
                  if (m.id === 'tables') {
                    setGameState('table_select');
                  } else {
                    setSelectedMode(m.id);
                    generateQuestions(m.id);
                  }
                }}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border-b-4 border-indigo-100 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center gap-3"
              >
                <div className={`p-4 rounded-full ${selectedSubject === 'math' ? 'bg-indigo-50 text-indigo-600' : 'bg-pink-50 text-pink-600'}`}>{m.icon}</div>
                <span className="font-bold text-gray-700">{m.name}</span>
              </button>
            ))}

            {/* NEW: VIDEO GALLERY BUTTON */}
             <button
                onClick={() => setGameState('video_gallery')}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border-b-4 border-indigo-100 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center gap-3 col-span-2 md:col-span-1"
              >
                <div className="p-4 rounded-full bg-orange-50 text-orange-600"><MonitorPlay className="w-6 h-6" /></div>
                <span className="font-bold text-gray-700">Video Classes</span>
              </button>

          </div>
        </div>
      </div>
    );
  }

    // 3.5 VIDEO GALLERY SCREEN
  if (gameState === 'video_gallery') {
    // Optional: Filter videos by current grade or show all? Let's show all but highlight/sort?
    // Simple approach: Show all videos for now, maybe grouped.
    // Let's filter by the selected Grade to be context aware, or show all if nothing matches.
    const relevantVideos = VIDEO_LIBRARY.filter(v => v.grade === selectedGrade || v.grade === 'all');
    const displayVideos = relevantVideos.length > 0 ? relevantVideos : VIDEO_LIBRARY;

    return (
      <div className="min-h-screen bg-indigo-50 p-4 font-sans">
        <div className="max-w-4xl mx-auto">
           <div className="flex items-center mb-6">
             <button onClick={() => setGameState('menu')} className="bg-white p-3 rounded-full shadow-sm hover:bg-indigo-50 mr-4">
               <ArrowRight className="w-6 h-6 rotate-180 text-indigo-600" />
             </button>
             <div>
               <h1 className="text-2xl font-extrabold text-indigo-900">Video Gallery</h1>
               <p className="text-indigo-500">Watch and Learn</p>
             </div>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             {displayVideos.map(video => (
               <button
                 key={video.id}
                 onClick={() => setActiveVideo(video)}
                 className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden group text-left border border-indigo-100"
               >
                 <div className="h-40 bg-gray-900 relative flex items-center justify-center group-hover:bg-indigo-900 transition-colors">
                    {/* Placeholder Thumbnail */}
                    <MonitorPlay className="w-16 h-16 text-white/50 group-hover:text-white group-hover:scale-110 transition-all" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent" />
                 </div>
                 <div className="p-4">
                   <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${video.subject === 'math' ? 'bg-indigo-100 text-indigo-600' : 'bg-pink-100 text-pink-600'}`}>{video.subject}</span>
                      <span className="text-xs font-bold px-2 py-1 rounded-full uppercase bg-gray-100 text-gray-500">{GRADE_GROUPS.find(g => g.id === video.grade)?.label || video.grade}</span>
                   </div>
                   <h3 className="font-bold text-lg text-gray-800 leading-tight">{video.title}</h3>
                 </div>
               </button>
             ))}
           </div>
           
           {/* Video Modal Player */}
           {activeVideo && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
               <div className="w-full max-w-4xl bg-black rounded-2xl overflow-hidden relative shadow-2xl">
                 <button
                   onClick={() => setActiveVideo(null)}
                   className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md"
                 >
                   <X className="w-6 h-6" />
                 </button>
                 <div className="relative pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
                   <iframe
                     src={`https://drive.google.com/file/d/${activeVideo.driveId}/preview`}
                     className="absolute inset-0 w-full h-full border-0"
                     allow="autoplay; encrypted-media"
                     allowFullScreen
                     title={activeVideo.title}
                   ></iframe>
                 </div>
                 <div className="p-4 bg-gray-900 text-white">
                   <h3 className="text-xl font-bold">{activeVideo.title}</h3>
                 </div>
               </div>
             </div>
           )}

        </div>
      </div>
    );
  }

  // 4. GAME SCREEN
  if (gameState === 'playing' && questions[currentQIndex]) {
    const q = questions[currentQIndex];
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-between py-6 px-4 relative overflow-hidden font-sans">
        <div className="w-full max-w-2xl h-2 bg-slate-700 rounded-full mb-6 relative">
          <div className="h-full bg-yellow-400 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${(timer / 20) * 100}%` }} />
           {aiBackgroundUpdate && <div className="absolute top-4 right-0 text-[10px] text-purple-400 animate-pulse">Updating...</div>}
        </div>
        <div key={currentQIndex} className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl animate-in fade-in zoom-in duration-300">
          <div className="text-slate-400 font-bold mb-8">Q{currentQIndex + 1} / 10</div>
          <div className="bg-white text-slate-900 p-8 rounded-3xl shadow-2xl w-full text-center min-h-[200px] flex flex-col items-center justify-center relative">
            {q.type === 'count' && renderIcon(q.icon, q.ans)}
            <h2 className={`font-black mt-4 ${q.q.length > 50 ? 'text-2xl' : 'text-4xl md:text-5xl'}`}>{q.type === 'english' ? renderEnglishText(q.q) : q.q}</h2>
          </div>
        </div>
        <div className={`grid ${q.opts.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-4 w-full max-w-2xl mt-8`}>
          {q.opts.map((opt, idx) => (
            <button key={idx} onClick={() => handleAnswer(opt)} className="bg-slate-800 hover:bg-slate-700 text-white p-6 rounded-2xl shadow-lg active:scale-95 transition-all border-b-4 border-slate-950 flex items-center justify-center">
              {q.type === 'shape' ? <div className="transform scale-75 pointer-events-none">{SHAPES_MAP[opt]}</div> :
               q.type === 'color' ? <div className={`w-12 h-12 rounded-full border-2 border-white pointer-events-none ${COLORS_MAP[opt]}`} /> :
               <span className={`font-bold ${String(opt).length > 10 ? 'text-lg' : 'text-2xl'}`}>{opt}</span>}
            </button>
          ))}
        </div>
        {feedback && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            {feedback === 'correct' ? <CheckCircle className="w-40 h-40 text-green-500 animate-bounce" /> : <XCircle className="w-40 h-40 text-red-500 animate-pulse" />}
          </div>
        )}
        <button onClick={() => setGameState('menu')} className="mt-6 text-slate-500 flex items-center gap-2 hover:text-white"><Home className="w-5 h-5" /> Quit</button>
      </div>
    );
  }

  // 5. RESULT SCREEN
  if (gameState === 'result') {
    return (
      <div className="min-h-screen bg-indigo-50 p-4 overflow-y-auto font-sans">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-indigo-100 text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-indigo-900 mb-2">Score: {score}/10</h2>
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3 text-left mt-4">
              <Brain className="w-6 h-6 text-indigo-600 shrink-0" />
              <p className="text-indigo-900 font-medium italic">{aiCoachMsg}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-indigo-100 h-[300px]">
              <Bar
                data={{
                  labels: performanceData.map(d => `Q${d.q}`),
                  datasets: [{
                    label: 'Time',
                    data: performanceData.map(d => d.time),
                    backgroundColor: performanceData.map(d => d.isCorrect ? '#22c55e' : '#ef4444'),
                    borderRadius: 4
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }}
              />
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-indigo-100 h-[300px] flex flex-col">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Leaderboard</h3>
              <div className="overflow-y-auto flex-1 space-y-2 custom-scrollbar">
                {leaderboard.length === 0 && <p className="text-gray-400 text-sm text-center italic mt-10">No scores yet. Be the first!</p>}
                {leaderboard.map((entry, idx) => (
                  <div key={idx} className={`flex justify-between p-3 rounded-xl ${entry.name === playerName ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                    <span className="font-bold text-gray-700">#{idx+1} {entry.name}</span>
                    <span className="font-bold text-indigo-600">{entry.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pb-8">
            <button onClick={() => setGameState('menu')} className="bg-white text-indigo-600 font-bold py-4 rounded-xl shadow-sm border border-indigo-100">Main Menu</button>
            <button onClick={() => generateQuestions(selectedMode)} className="bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg">Play Again</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}