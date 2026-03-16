"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type LessonCompleteButtonProps = {
  lessonId: string;
  completed: boolean;
};

export function LessonCompleteButton({ lessonId, completed }: LessonCompleteButtonProps) {
  const [done, setDone] = useState(completed);
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/learning/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId,
          completed: !done,
        }),
      });

      if (response.ok) {
        setDone((prev) => !prev);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" size="sm" variant={done ? "secondary" : "outline"} onClick={onClick} disabled={loading}>
      {loading ? "Saving..." : done ? "Completed" : "Mark Complete"}
    </Button>
  );
}

