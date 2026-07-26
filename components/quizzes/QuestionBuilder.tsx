"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type QuizQuestion, emptyQuestion } from "@/lib/api/quizzes";
import { useGenerateQuestions } from "@/hooks/useQuizzes";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type QuestionBuilderProps = {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
  topic: string;
};

export function QuestionBuilder({ questions, onChange, topic }: QuestionBuilderProps) {
  const genMut = useGenerateQuestions();
  const [generateCount, setGenerateCount] = useState(3);

  function updateQuestion(index: number, next: QuizQuestion) {
    const nextQ = [...questions];
    nextQ[index] = next;
    onChange(nextQ);
  }

  function addQuestion() {
    onChange([...questions, emptyQuestion()]);
  }

  function removeQuestion(index: number) {
    if (questions.length <= 1) return;
    onChange(questions.filter((_, i) => i !== index));
  }

  async function handleGenerateAI() {
    if (!topic) {
      toast.error("Please enter a topic in the draft first.");
      return;
    }
    try {
      const generated = await genMut.mutateAsync({ topic, count: generateCount });
      if (generated && generated.length > 0) {
        onChange([...questions, ...generated]);
        toast.success(`Generated ${generated.length} questions`);
      }
    } catch (e) {
      // Error handled by mutation
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
        <div>
          <h3 className="font-semibold text-indigo-900">AI Question Generator</h3>
          <p className="text-sm text-indigo-700">
            Generate multiple-choice questions based on the topic: <span className="font-medium">{topic || "No topic set"}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input 
            type="number" 
            min="1" 
            max="10" 
            className="w-20 bg-white" 
            value={generateCount} 
            onChange={(e) => setGenerateCount(parseInt(e.target.value, 10) || 1)} 
          />
          <Button 
            type="button" 
            onClick={handleGenerateAI} 
            disabled={genMut.isPending || !topic}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {genMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Questions</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addQuestion}
        >
          Add blank question
        </Button>
      </div>

      <div className="space-y-4">
        {questions.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">No questions added yet.</p>
        )}
        {questions.map((q, index) => (
          <QuestionBlock
            key={index}
            index={index}
            question={q}
            canRemove={questions.length > 1}
            onChange={(next) => updateQuestion(index, next)}
            onRemove={() => removeQuestion(index)}
          />
        ))}
      </div>
    </div>
  );
}

function QuestionBlock({
  index,
  question,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number;
  question: QuizQuestion;
  canRemove: boolean;
  onChange: (q: QuizQuestion) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-sky-100 bg-sky-50/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-800">
          Question {index + 1}
        </span>
        {canRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:text-rose-700"
            onClick={onRemove}
          >
            Remove
          </Button>
        ) : null}
      </div>

      <Field label="Question text" className="mb-3">
        <Input
          required
          value={question.questionText}
          onChange={(e) => onChange({ ...question, questionText: e.target.value })}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Option A">
          <Input required value={question.optionA} onChange={(e) => onChange({ ...question, optionA: e.target.value })} />
        </Field>
        <Field label="Option B">
          <Input required value={question.optionB} onChange={(e) => onChange({ ...question, optionB: e.target.value })} />
        </Field>
        <Field label="Option C">
          <Input required value={question.optionC} onChange={(e) => onChange({ ...question, optionC: e.target.value })} />
        </Field>
        <Field label="Option D">
          <Input required value={question.optionD} onChange={(e) => onChange({ ...question, optionD: e.target.value })} />
        </Field>
      </div>

      <Field label="Correct answer" className="mt-3">
        <select
          required
          className={cn(
            "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
          )}
          value={question.correctAnswer}
          onChange={(e) =>
            onChange({ ...question, correctAnswer: e.target.value })
          }
        >
          <option value="A">Option A</option>
          <option value="B">Option B</option>
          <option value="C">Option C</option>
          <option value="D">Option D</option>
        </select>
      </Field>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
