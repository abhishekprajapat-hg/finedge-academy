"use client";

import { FormEvent, useState } from "react";
import { MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type LeadCaptureFormProps = {
  source: string;
  defaultInterest?: string;
  hotLead?: boolean;
  title?: string;
};

export function LeadCaptureForm({
  source,
  defaultInterest = "Consultation",
  hotLead = false,
  title = "Get Expert Guidance",
}: LeadCaptureFormProps) {
  const [state, setState] = useState({
    fullName: "",
    email: "",
    phone: "",
    interestArea: defaultInterest,
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...state,
          source,
          isHot: hotLead,
        }),
      });

      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setFeedback(data.error ?? "Unable to submit. Try again.");
        return;
      }

      setFeedback("Thanks. Our team will contact you shortly.");
      setState((prev) => ({
        ...prev,
        fullName: "",
        email: "",
        phone: "",
        message: "",
      }));
    } catch {
      setFeedback("Unable to submit right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-[#c9dcec] bg-[linear-gradient(160deg,#ffffff_0%,#f6fbff_100%)] p-5 shadow-[0_24px_58px_-44px_rgba(9,30,66,0.8)]"
    >
      <div className="space-y-1">
        <p className="inline-flex items-center gap-2 rounded-full border border-[#bcd8ea] bg-[#edf6ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3f6384]">
          <MessageSquareText className="h-3.5 w-3.5 text-[#006d77]" />
          Quick Connect
        </p>
        <h3 className="text-xl font-bold text-[#0d1b2a]">{title}</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${source}-name`}>Full Name</Label>
        <Input
          id={`${source}-name`}
          value={state.fullName}
          onChange={(event) => setState((prev) => ({ ...prev, fullName: event.target.value }))}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${source}-email`}>Email</Label>
          <Input
            id={`${source}-email`}
            type="email"
            value={state.email}
            onChange={(event) => setState((prev) => ({ ...prev, email: event.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${source}-phone`}>Phone</Label>
          <Input
            id={`${source}-phone`}
            value={state.phone}
            onChange={(event) => setState((prev) => ({ ...prev, phone: event.target.value }))}
            placeholder="+91..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${source}-interest`}>Interest Area</Label>
        <Select
          id={`${source}-interest`}
          value={state.interestArea}
          onChange={(event) => setState((prev) => ({ ...prev, interestArea: event.target.value }))}
        >
          <option>Consultation</option>
          <option>Mutual Funds</option>
          <option>Insurance</option>
          <option>Course Enrollment</option>
          <option>Brokerage Support</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${source}-message`}>Message</Label>
        <Textarea
          id={`${source}-message`}
          value={state.message}
          onChange={(event) => setState((prev) => ({ ...prev, message: event.target.value }))}
          placeholder="Tell us your objective"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Submitting..." : "Request Consultation"}
      </Button>

      {feedback ? <p className="text-sm font-medium text-[#325171]">{feedback}</p> : null}
    </form>
  );
}

