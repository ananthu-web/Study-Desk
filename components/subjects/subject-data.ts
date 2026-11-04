export const subjectColours = [
  { id: "sage", name: "Sage" }, { id: "sand", name: "Sand" },
  { id: "clay", name: "Clay" }, { id: "slate", name: "Slate" },
  { id: "olive", name: "Olive" }, { id: "rose", name: "Rose" },
] as const;
export type SubjectColour = typeof subjectColours[number]["id"];
export type Subject = { id: string; name: string; description: string; colour: SubjectColour; goal: number | null };
export const exampleSubjects: Subject[] = [
  { id: "sample-mathematics", name: "Mathematics", description: "A little closer to understanding.", colour: "sage", goal: 45 },
  { id: "sample-physics", name: "Physics", description: "Make sense of the everyday.", colour: "sand", goal: 30 },
  { id: "sample-chemistry", name: "Chemistry", description: "Small things. Big discoveries.", colour: "clay", goal: null },
];
export function normaliseSubjectName(name: string) { return name.trim().replace(/\s+/g, " "); }
export function goalLabel(goal: number) { return goal >= 60 ? `${Math.floor(goal / 60)}h${goal % 60 ? ` ${goal % 60}m` : ""}` : `${goal} min`; }
export function exampleMaterials(subject: Subject) {
  const topic = subject.id === "sample-mathematics" ? "Integration" : subject.id === "sample-physics" ? "Waves & oscillations" : "Organic chemistry";
  return [
    { id: "chapter", name: topic, description: "Class notes & practice", resources: [{ title: `${topic} — class notes`, type: "PDF", description: "An example of a saved class handout." }, { title: "Practice questions", type: "PDF", description: "An example of a question sheet." }] },
    { id: "revision", name: "Revision corner", description: "A little practice, a little progress", resources: [{ title: "Previous-year questions", type: "PDF", description: "An example of a previous-year question paper." }, { title: "Recorded class", type: "LINK", description: "An example of a saved class recording link." }] },
  ];
}
