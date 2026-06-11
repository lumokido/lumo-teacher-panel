"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useClassesList, useSectionsByClassId, useMyAssignedClasses } from "@/hooks/useAdminClasses";
import { useCreateAssignmentsBulk } from "@/hooks/useAssignments";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles, Upload, Calendar, ArrowLeft, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type HomeworkItem = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  imageUrl: string;
};

function AddHomeworkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createMut = useCreateAssignmentsBulk();

  const { data: classes = [], isLoading: classesLoading } = useClassesList();
  const { data: assignedData, isLoading: assignedLoading } = useMyAssignedClasses();
  
  const [selectedClassId, setSelectedClassId] = useState<number | "">("");
  const [selectedSectionId, setSelectedSectionId] = useState<number | "">("");

  const [homeworkItems, setHomeworkItems] = useState<HomeworkItem[]>([
    { id: "1", title: "", description: "", dueDate: "", imageUrl: "" }
  ]);

  const filteredClasses = useMemo(() => {
    const isAdmin = typeof window !== "undefined" && sessionStorage.getItem("type") === "principal";
    if (isAdmin) return classes;

    if (!assignedData || !assignedData.homeroomClass) return [];
    const homeroom = assignedData.homeroomClass.trim().toLowerCase();
    return classes.filter((cls) => cls.name.trim().toLowerCase() === homeroom);
  }, [classes, assignedData]);

  // Pre-select homeroom class if exactly one matches
  useEffect(() => {
    if (filteredClasses.length === 1 && !selectedClassId) {
      setSelectedClassId(filteredClasses[0].id);
    }
  }, [filteredClasses, selectedClassId]);

  const { data: sections = [], isLoading: sectionsLoading } = useSectionsByClassId(
    selectedClassId ? (selectedClassId as number) : undefined
  );

  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  function updateItem(index: number, fields: Partial<HomeworkItem>) {
    setHomeworkItems(items => items.map((item, idx) => idx === index ? { ...item, ...fields } : item));
  }

  function addItem() {
    const defaultDueDate = homeworkItems[0]?.dueDate || "";
    setHomeworkItems(items => [
      ...items,
      { id: Math.random().toString(), title: "", description: "", dueDate: defaultDueDate, imageUrl: "" }
    ]);
  }

  function removeItem(index: number) {
    if (homeworkItems.length <= 1) return;
    setHomeworkItems(items => items.filter((_, idx) => idx !== index));
  }

  // Mock AI scanner logic
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanStep(1);

    // Simulate AI extraction steps
    setTimeout(() => {
      setScanStep(2);
      setTimeout(() => {
        setScanStep(3);
        setTimeout(() => {
          const threeDaysLater = new Date();
          threeDaysLater.setDate(threeDaysLater.getDate() + 3);
          const yyyy = threeDaysLater.getFullYear();
          const mm = String(threeDaysLater.getMonth() + 1).padStart(2, '0');
          const dd = String(threeDaysLater.getDate()).padStart(2, '0');
          const dateStr = `${yyyy}-${mm}-${dd}`;

          const scannedItem = {
            id: Math.random().toString(),
            title: "Math Fractions and Decimals Worksheet",
            description: "Solve all problem sets on page 56 of the homework booklet. Write down steps for simplifying improper fractions to mixed numbers.",
            dueDate: dateStr,
            imageUrl: "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=800&auto=format&fit=crop&q=60"
          };

          setHomeworkItems(items => {
            // If the first item is blank, replace it
            if (items.length === 1 && !items[0].title && !items[0].description) {
              return [scannedItem];
            }
            return [...items, scannedItem];
          });

          setIsScanning(false);
          setScanStep(0);
          toast.success("AI extraction completed! Scanned homework appended.");
        }, 1200);
      }, 1000);
    }, 800);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClassId) {
      toast.error("Please select a target class");
      return;
    }

    // Validate all items
    for (let i = 0; i < homeworkItems.length; i++) {
      const item = homeworkItems[i];
      if (!item.title.trim() || !item.description.trim() || !item.dueDate) {
        toast.error(`Please fill in all required fields for assignment #${i + 1}`);
        return;
      }
    }

    const payload = homeworkItems.map(item => ({
      classId: selectedClassId as number,
      sectionId: selectedSectionId ? (selectedSectionId as number) : null,
      type: "HOMEWORK",
      title: item.title.trim(),
      description: item.description.trim(),
      imageUrl: item.imageUrl.trim() || null,
      dueDate: item.dueDate
    }));

    createMut.mutate(payload, {
      onSuccess: () => {
        router.push("/assignments");
      }
    });
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push("/assignments")}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 transition hover:text-sky-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assignments
        </button>
        <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
          Publish Daily Homework
        </h2>
        <p className="mt-2 text-slate-600">
          Publish one or multiple homework tasks at once. Scan a worksheet to instantly extract coordinates and details using AI.
        </p>
      </div>

      {/* AI Scanner Card */}
      <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50/50 to-indigo-50/30 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="h-24 w-24 text-sky-600 animate-pulse" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="space-y-1">
            <h3 className="font-montserrat text-lg font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-sky-600" />
              AI Worksheet Scanner
            </h3>
            <p className="text-sm text-slate-600 max-w-md">
              Upload a picture of a worksheet, written board, or book page to instantly extract the homework details and append a card.
            </p>
          </div>
          <div>
            <label className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-sky-700 active:scale-[0.98] transition-all cursor-pointer">
              <Upload className="h-4.5 w-4.5" />
              Scan & Extract Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isScanning || createMut.isPending}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Scan Status Modal overlay inside container */}
        {isScanning && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 transition-all duration-300">
            <div className="relative mb-4">
              <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-indigo-500 animate-bounce" />
            </div>
            <p className="font-bold text-slate-800 text-lg">AI Homework Extractor</p>
            <p className="text-sm text-slate-500 mt-1">
              {scanStep === 1 && "Uploading and reading image elements..."}
              {scanStep === 2 && "Performing OCR text layout extraction..."}
              {scanStep === 3 && "Structuring task instructions and deadlines..."}
            </p>
            <div className="w-48 bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div 
                className="bg-sky-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(scanStep / 3) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Manual Upload Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm space-y-6">
        <h3 className="font-montserrat text-lg font-bold text-slate-800 border-b pb-3">
          Assignment Target
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Class Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Class *</label>
            {!assignedLoading && filteredClasses.length === 0 ? (
              <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3">
                No homeroom class assigned. You can only assign homework to your homeroom class.
              </div>
            ) : (
              <Select
                disabled={classesLoading || assignedLoading || createMut.isPending}
                value={selectedClassId ? String(selectedClassId) : ""}
                onValueChange={(val) => {
                  setSelectedClassId(val ? parseInt(val, 10) : "");
                  setSelectedSectionId("");
                }}
              >
                <SelectTrigger className="w-full rounded-xl border-sky-200 bg-white h-[42px] text-sm">
                  <SelectValue placeholder={assignedLoading ? "Loading homeroom class..." : "Select target class"}>
                    {(val) => val ? filteredClasses.find((c) => String(c.id) === String(val))?.name : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {filteredClasses.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Section Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Section (Optional)</label>
            <Select
              disabled={!selectedClassId || sectionsLoading || createMut.isPending}
              value={selectedSectionId ? String(selectedSectionId) : ""}
              onValueChange={(val) => setSelectedSectionId(val ? parseInt(val, 10) : "")}
            >
              <SelectTrigger className="w-full rounded-xl border-sky-200 bg-white h-[42px] text-sm">
                <SelectValue placeholder="Select section (or leave empty)">
                  {(val) => val ? sections.find((s) => String(s.id) === String(val))?.name : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sections.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    Section {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <h3 className="font-montserrat text-lg font-bold text-slate-800 border-b pb-3 pt-4">
          Homework Tasks List
        </h3>

        {/* Dynamic Items List */}
        <div className="space-y-6">
          {homeworkItems.map((item, idx) => (
            <div key={item.id} className="relative p-5 rounded-2xl border border-sky-100 bg-slate-50/20 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="font-bold text-sm text-sky-700">Homework Task #{idx + 1}</span>
                {homeworkItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                )}
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Homework Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Fractions Worksheet"
                  disabled={createMut.isPending}
                  value={item.title}
                  onChange={(e) => updateItem(idx, { title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Instructions / Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide clear homework instructions for the students..."
                  disabled={createMut.isPending}
                  value={item.description}
                  onChange={(e) => updateItem(idx, { description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Due Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Due Date *</label>
                  <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 transition-all">
                    <Calendar className="h-4.5 w-4.5 text-slate-400 mr-2" />
                    <input
                      required
                      type="date"
                      disabled={createMut.isPending}
                      value={item.dueDate}
                      onChange={(e) => updateItem(idx, { dueDate: e.target.value })}
                      className="bg-transparent text-slate-900 outline-none w-full cursor-pointer font-medium"
                    />
                  </div>
                </div>

                {/* Reference Image URL (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Reference Image URL (Optional)</label>
                  <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 transition-all">
                    <ImageIcon className="h-4.5 w-4.5 text-slate-400 mr-2" />
                    <input
                      type="url"
                      placeholder="e.g. https://s3.amazonaws.com/your-bucket/homework-image.jpg"
                      disabled={createMut.isPending}
                      value={item.imageUrl}
                      onChange={(e) => updateItem(idx, { imageUrl: e.target.value })}
                      className="bg-transparent text-slate-900 outline-none w-full"
                    />
                  </div>
                </div>
              </div>

              {item.imageUrl && (
                <div className="mt-2 relative rounded-lg overflow-hidden border border-slate-200 w-32 h-20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt="Reference Preview" className="object-cover w-full h-full" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add item button */}
        <button
          type="button"
          onClick={addItem}
          disabled={createMut.isPending}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-sky-300 bg-sky-50/20 py-3 text-sm font-semibold text-sky-700 hover:bg-sky-50 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Another Homework Task
        </button>

        {/* Footer Actions */}
        <div className="border-t pt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/assignments")}
            disabled={createMut.isPending}
            className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMut.isPending}
            className="rounded-xl bg-sky-600 px-8 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-sky-700 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
          >
            {createMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {createMut.isPending ? "Publishing..." : `Publish ${homeworkItems.length} Homework${homeworkItems.length > 1 ? "s" : ""}`}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AddHomeworkPage() {
  return (
    <Suspense fallback={
      <div className="flex h-96 items-center justify-center rounded-2xl border border-sky-100 bg-white">
        <div className="flex flex-col items-center text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-sky-500" />
          Loading publisher form...
        </div>
      </div>
    }>
      <AddHomeworkContent />
    </Suspense>
  );
}
