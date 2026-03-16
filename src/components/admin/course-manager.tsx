"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Lesson = {
  title: string;
  description: string;
  lessonOrder: number;
  videoUrl: string;
  isPreview: boolean;
};

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  pricePaise: number;
  thumbnailUrl: string | null;
  isPublished: boolean;
  lessons: Lesson[];
};

const initialLesson = (): Lesson => ({
  title: "",
  description: "",
  lessonOrder: 1,
  videoUrl: "",
  isPreview: false,
});

const initialForm = {
  title: "",
  slug: "",
  description: "",
  pricePaise: 499900,
  thumbnailUrl: "",
  isPublished: false,
  lessons: [initialLesson()],
};

export function CourseManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedId, setSelectedId] = useState<string>("new");
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingLessonIndex, setUploadingLessonIndex] = useState<number | null>(null);

  const loadCourses = async () => {
    const response = await fetch("/api/admin/courses");
    const data = (await response.json()) as { ok: boolean; courses: Course[] };
    if (data.ok) {
      setCourses(data.courses);
    }
  };

  useEffect(() => {
    void loadCourses();
  }, []);

  useEffect(() => {
    if (selectedId === "new") {
      setForm(initialForm);
      return;
    }

    const selected = courses.find((course) => course.id === selectedId);
    if (selected) {
      setForm({
        title: selected.title,
        slug: selected.slug,
        description: selected.description,
        pricePaise: selected.pricePaise,
        thumbnailUrl: selected.thumbnailUrl || "",
        isPublished: selected.isPublished,
        lessons: selected.lessons.length ? selected.lessons : [initialLesson()],
      });
    }
  }, [selectedId, courses]);

  const onSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const endpoint = selectedId === "new" ? "/api/admin/courses" : `/api/admin/courses/${selectedId}`;
      const method = selectedId === "new" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setMessage(data.error ?? "Unable to save course");
        return;
      }

      setMessage("Course saved");
      setSelectedId("new");
      await loadCourses();
    } catch {
      setMessage("Unable to save course");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (selectedId === "new") {
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/courses/${selectedId}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setMessage(data.error ?? "Unable to delete course");
        return;
      }

      setMessage("Course deleted");
      setSelectedId("new");
      await loadCourses();
    } catch {
      setMessage("Unable to delete course");
    } finally {
      setLoading(false);
    }
  };

  const uploadLessonVideo = async (lessonIndex: number, file: File | null) => {
    if (!file) {
      return;
    }

    setUploadingLessonIndex(lessonIndex);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("title", `${form.title || "Course"} - Lesson ${lessonIndex + 1}`);

      const response = await fetch("/api/admin/bunny/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { ok: boolean; error?: string; videoUrl?: string };
      if (!response.ok || !data.ok || !data.videoUrl) {
        setMessage(data.error ?? "Unable to upload video");
        return;
      }
      const uploadedUrl = data.videoUrl;

      setForm((prev) => ({
        ...prev,
        lessons: prev.lessons.map((item, index) => (index === lessonIndex ? { ...item, videoUrl: uploadedUrl } : item)),
      }));
      setMessage("Video uploaded to Bunny Stream and lesson URL updated.");
    } catch {
      setMessage("Unable to upload video");
    } finally {
      setUploadingLessonIndex(null);
    }
  };

  const removeLesson = (lessonIndex: number) => {
    if (form.lessons.length <= 1) {
      setMessage("At least one lesson is required.");
      return;
    }

    setMessage(null);
    setForm((prev) => ({
      ...prev,
      lessons: prev.lessons
        .filter((_, index) => index !== lessonIndex)
        .map((item, index) => ({
          ...item,
          lessonOrder: index + 1,
        })),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[260px_1fr]">
        <div className="space-y-2">
          <Label>Choose Course</Label>
          <Select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
            <option value="new">+ New Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input value={form.slug} onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Price (Paise)</Label>
          <Input
            type="number"
            value={form.pricePaise}
            onChange={(event) => setForm((prev) => ({ ...prev, pricePaise: Number(event.target.value) || 0 }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Thumbnail URL</Label>
          <Input value={form.thumbnailUrl} onChange={(event) => setForm((prev) => ({ ...prev, thumbnailUrl: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Published</Label>
          <Select
            value={form.isPublished ? "yes" : "no"}
            onChange={(event) => setForm((prev) => ({ ...prev, isPublished: event.target.value === "yes" }))}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </Select>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-slate-200 p-4">
        <p className="font-medium text-slate-800">Lessons</p>
        {form.lessons.map((lesson, index) => (
          <div key={`${lesson.lessonOrder}-${index}`} className="grid gap-3 rounded-md border border-slate-200 p-3 sm:grid-cols-2">
            <div className="sm:col-span-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-700">Lesson {index + 1}</p>
              <Button type="button" variant="destructive" size="sm" onClick={() => removeLesson(index)}>
                Delete Lesson
              </Button>
            </div>
            <Input
              placeholder="Lesson title"
              value={lesson.title}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  lessons: prev.lessons.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, title: event.target.value } : item,
                  ),
                }))
              }
            />
            <Input
              placeholder="Video URL"
              value={lesson.videoUrl}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  lessons: prev.lessons.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, videoUrl: event.target.value } : item,
                  ),
                }))
              }
            />
            <div className="sm:col-span-2 space-y-2">
              <p className="text-xs text-slate-500">Paste YouTube/Vimeo/Bunny embed URL; system auto-converts when needed.</p>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="file"
                  accept="video/*"
                  className="max-w-sm"
                  disabled={uploadingLessonIndex !== null}
                  onChange={(event) => {
                    const selectedFile = event.currentTarget.files?.[0] ?? null;
                    void uploadLessonVideo(index, selectedFile);
                    event.currentTarget.value = "";
                  }}
                />
                <p className="text-xs text-slate-500">
                  {uploadingLessonIndex === index ? "Uploading to Bunny Stream..." : "Or upload directly to Bunny Stream"}
                </p>
              </div>
            </div>
            <Input
              placeholder="Description"
              value={lesson.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  lessons: prev.lessons.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, description: event.target.value } : item,
                  ),
                }))
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                min={1}
                value={lesson.lessonOrder}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    lessons: prev.lessons.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, lessonOrder: Number(event.target.value) || 1 } : item,
                    ),
                  }))
                }
              />
              <Select
                value={lesson.isPreview ? "yes" : "no"}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    lessons: prev.lessons.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, isPreview: event.target.value === "yes" } : item,
                    ),
                  }))
                }
              >
                <option value="no">Premium</option>
                <option value="yes">Preview</option>
              </Select>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              lessons: [
                ...prev.lessons,
                {
                  ...initialLesson(),
                  lessonOrder: prev.lessons.length + 1,
                },
              ],
            }))
          }
        >
          Add Lesson
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={onSave} disabled={loading}>
          {loading ? "Saving..." : selectedId === "new" ? "Create Course" : "Update Course"}
        </Button>
        {selectedId !== "new" ? (
          <Button type="button" variant="destructive" onClick={onDelete} disabled={loading}>
            Delete Course
          </Button>
        ) : null}
      </div>

      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </div>
  );
}

