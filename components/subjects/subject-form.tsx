"use client";

import { useRef, useState, type FormEvent } from "react";
import { Check, ArrowRight } from "lucide-react";
import { StudyBook } from "@/components/study-book";
import { normaliseSubjectName, subjectColours, type Subject, type SubjectColour } from "./subject-data";

type Values = Omit<Subject, "id">;
export function SubjectForm({ subject, names, onSubmit, onCancel }: { subject?: Subject; names: string[]; onSubmit: (values: Values) => void; onCancel: () => void }) {
  const [name, setName] = useState(subject?.name ?? "");
  const [description, setDescription] = useState(subject?.description ?? "");
  const [colour, setColour] = useState<SubjectColour>(subject?.colour ?? "sage");
  const [goal, setGoal] = useState(subject?.goal?.toString() ?? "");
  const [errors, setErrors] = useState<{ name?: string; goal?: string }>({});
  const nameRef = useRef<HTMLInputElement>(null);
  const goalRef = useRef<HTMLInputElement>(null);
  function submit(event: FormEvent) {
    event.preventDefault();
    const cleanName = normaliseSubjectName(name);
    const problems: typeof errors = {};
    if (!cleanName || cleanName.length > 60) problems.name = "Give your subject a name between 1 and 60 characters.";
    else if (names.some(other => normaliseSubjectName(other).toLocaleLowerCase() === cleanName.toLocaleLowerCase())) problems.name = "There’s already a subject with that name. Try another.";
    const minutes = goal.trim() ? Number(goal) : null;
    if (minutes !== null && (!Number.isInteger(minutes) || minutes < 15 || minutes > 480)) problems.goal = "Choose 15–480 whole minutes, or leave it blank.";
    setErrors(problems);
    if (problems.name || problems.goal) { requestAnimationFrame(() => (problems.name ? nameRef : goalRef).current?.focus()); return; }
    onSubmit({ name: cleanName, description: description.trim(), colour, goal: minutes });
  }
  return <form className="subject-form" onSubmit={submit} noValidate>
    <div className={`subject-form-cover subject-colour-${colour}`} aria-hidden="true"><StudyBook size={43} /><span>{normaliseSubjectName(name) || "Your next chapter"}</span></div>
    <div className="subject-form-field"><label htmlFor="subject-name">Subject name <span>Required</span></label><input ref={nameRef} id="subject-name" value={name} maxLength={60} onChange={event => { setName(event.target.value); setErrors(current => ({ ...current, name: undefined })); }} autoComplete="off" placeholder="e.g. Mathematics" aria-invalid={!!errors.name} aria-describedby="subject-name-error" required /><p id="subject-name-error" className="field-error" role="status">{errors.name}</p></div>
    <div className="subject-form-field"><label htmlFor="subject-description">A little description <span>Optional</span></label><textarea id="subject-description" value={description} maxLength={160} onChange={event => setDescription(event.target.value)} rows={2} placeholder="What are you making room to learn?" /><span className="subject-form-counter">{description.length}/160</span></div>
    <fieldset className="subject-colour-field"><legend>Make it yours</legend><div className="subject-colour-options">{subjectColours.map(option => <label key={option.id} className={`subject-colour-option subject-colour-${option.id}`}><input type="radio" name="subject-colour" value={option.id} checked={colour === option.id} onChange={() => setColour(option.id)} /><span className="subject-colour-swatch">{colour === option.id && <Check size={16} aria-hidden="true" />}</span><span>{option.name}</span></label>)}</div></fieldset>
    <div className="subject-form-field"><label htmlFor="subject-goal">Daily time for this subject <span>Optional</span></label><div className="subject-goal-input"><input ref={goalRef} id="subject-goal" type="number" inputMode="numeric" value={goal} min={15} max={480} step={1} onChange={event => { setGoal(event.target.value); setErrors(current => ({ ...current, goal: undefined })); }} placeholder="e.g. 45" aria-invalid={!!errors.goal} aria-describedby="subject-goal-help subject-goal-error" /><span>minutes</span></div><p id="subject-goal-help" className="subject-field-help">A gentle intention, separate from your overall daily goal.</p><p id="subject-goal-error" className="field-error" role="status">{errors.goal}</p></div>
    <p className="subject-form-disclosure">Preview only. This subject won’t be saved to your account and resets when you leave or reload.</p>
    <div className="subject-form-actions"><button type="button" className="desk-outline-button" onClick={onCancel}>Cancel</button><button type="submit" className="desk-primary">{subject ? "Update preview" : "Add preview"}<ArrowRight size={17} /></button></div>
  </form>;
}
