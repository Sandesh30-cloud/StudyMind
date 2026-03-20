export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export type Subject =
  | "General"
  | "Data Structures & Algorithms"
  | "Artificial Intelligence & Machine Learning"
  | "Database Management Systems"
  | "Operating Systems"
  | "Computer Networks"
  | "Mathematics"
  | "Object Oriented Programming"
  | "Web Development"
  | "System Design";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface ChatState {
  messages: Message[];
  subject: Subject;
  difficulty: Difficulty;
}

export interface SuggestionCard {
  label: string;
  labelColor: string;
  text: string;
}

export const SUBJECTS: Array<{
  value: Subject;
  short: string;
  color: string;
  dotColor: string;
}> = [
  { value: "General", short: "General", color: "#2A6348", dotColor: "#7FBF9F" },
  { value: "Data Structures & Algorithms", short: "DSA", color: "#3A6A9A", dotColor: "#5B9BD5" },
  { value: "Artificial Intelligence & Machine Learning", short: "AI / ML", color: "#7A3A8A", dotColor: "#B07FBF" },
  { value: "Database Management Systems", short: "DBMS", color: "#8A6A2A", dotColor: "#C4A055" },
  { value: "Operating Systems", short: "OS", color: "#6A3A2A", dotColor: "#BF7F5B" },
  { value: "Computer Networks", short: "Networks", color: "#2A5A7A", dotColor: "#5B9BBF" },
  { value: "Mathematics", short: "Math", color: "#7A2A4A", dotColor: "#BF5B7F" },
  { value: "Object Oriented Programming", short: "OOP", color: "#2A6A5A", dotColor: "#5BBF9F" },
  { value: "Web Development", short: "Web Dev", color: "#5A4A2A", dotColor: "#BFA05B" },
  { value: "System Design", short: "System Design", color: "#2A4A6A", dotColor: "#5B7FBF" },
];

export const SUGGESTIONS: SuggestionCard[] = [
  {
    label: "Explain Concept",
    labelColor: "#2A6348",
    text: "Explain Binary Search Trees with examples",
  },
  {
    label: "Step-by-Step",
    labelColor: "#5B4FA8",
    text: "Solve this: Find the time complexity of merge sort",
  },
  {
    label: "Summarize",
    labelColor: "#9A6020",
    text: "Summarize the key concepts of Normalization in DBMS",
  },
  {
    label: "Quick Quiz",
    labelColor: "#8A2040",
    text: "Give me 5 interview questions on Operating Systems",
  },
  {
    label: "Compare",
    labelColor: "#2A5A7A",
    text: "Compare TCP vs UDP with a comparison table",
  },
  {
    label: "Code Example",
    labelColor: "#2A6A5A",
    text: "Write a Python implementation of Dijkstra's algorithm",
  },
];
