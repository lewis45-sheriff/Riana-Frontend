"use client";

import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { useState } from "react";
import { SmileyRating } from "@/components/SmileyRating";
import { ThankYou } from "@/components/ThankYou";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/Progress";
import { api, type FeedbackResult } from "@/lib/api";

const QUESTIONS = [
  { key: "q1", title: "Rate your experience with our product" },
  { key: "q2", title: "Rate our customer care" },
  { key: "q3", title: "Are you happy with the product?" },
] as const;

type Ratings = { q1: number | null; q2: number | null; q3: number | null };

// Steps: 0..2 = questions, 3 = details, 4 = submitting/done
export function Questionnaire() {
  const [step, setStep] = useState(0);
  const [ratings, setRatings] = useState<Ratings>({ q1: null, q2: null, q3: null });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FeedbackResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = QUESTIONS.length + 1; // questions + details
  const progress = Math.round((Math.min(step, totalSteps) / totalSteps) * 100);

  const isQuestion = step < QUESTIONS.length;
  const currentQuestion = QUESTIONS[step];
  const currentValue = isQuestion
    ? ratings[currentQuestion.key as keyof Ratings]
    : null;

  const setRating = (value: number) => {
    setRatings((r) => ({ ...r, [currentQuestion.key]: value }));
  };

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  const canSubmit = name.trim().length > 0;

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.submitFeedback({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        q1: ratings.q1!,
        q2: ratings.q2!,
        q3: ratings.q3!,
        comment: comment.trim() || undefined,
      });
      setResult(res);
      setStep(totalSteps);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setStep(0);
    setRatings({ q1: null, q2: null, q3: null });
    setName("");
    setEmail("");
    setPhone("");
    setComment("");
    setResult(null);
    setError(null);
  };

  if (result) {
    return <ThankYou message={result.message} onRestart={restart} />;
  }

  return (
    <div>
      {/* Progress header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-text-secondary">
            {isQuestion ? `Question ${step + 1} of ${QUESTIONS.length}` : "Almost done"}
          </span>
          <span className="tabular-nums text-muted">{progress}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      {isQuestion ? (
        <div key={step} className="animate-slide-up">
          <h2 className="mb-6 font-display text-2xl font-bold text-foreground">
            {currentQuestion.title}
          </h2>
          <SmileyRating value={currentValue} onChange={setRating} />

          <div className="mt-8 flex items-center justify-between gap-3">
            {step > 0 ? (
              <Button variant="ghost" icon={ArrowLeft} onClick={back}>
                Back
              </Button>
            ) : (
              <span />
            )}
            <Button
              variant="primary"
              iconRight={ArrowRight}
              disabled={currentValue == null}
              onClick={next}
            >
              {step === QUESTIONS.length - 1 ? "Continue" : "Next question"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="animate-slide-up">
          <h2 className="mb-1 font-display text-2xl font-bold text-foreground">
            Almost there
          </h2>
          <p className="mb-6 text-sm text-text-secondary">
            Tell us who you are so we can follow up if needed.
          </p>

          <div className="space-y-4">
            <Input
              label="Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              autoComplete="email"
            />
            <Input
              label="Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254700000000"
              autoComplete="tel"
            />
            <div>
              <label
                htmlFor="comment"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Anything else? <span className="text-muted">(optional)</span>
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Tell us more about your experience…"
                className="w-full rounded-(--r-input) border border-border bg-surface px-3 py-2 text-[15px] text-foreground placeholder:text-muted focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button variant="ghost" icon={ArrowLeft} onClick={back}>
              Back
            </Button>
            <Button
              variant="accent"
              icon={Send}
              loading={submitting}
              disabled={!canSubmit}
              onClick={submit}
            >
              Submit feedback
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
