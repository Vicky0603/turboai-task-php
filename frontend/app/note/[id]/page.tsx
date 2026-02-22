"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Category, NoteDetail } from "@/types";
import { Phone, Mic, PhoneOff, Mic2 } from "lucide-react";

/** Note editor page: create/edit note, category, and voice input support */
export default function NotePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;
  const isNew = noteId === "new";

  const [title, setTitle] = useState("Note Title");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    document.title = isNew ? "New Note | Notes App" : "Edit Note | Notes App";
  }, [isNew]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      loadData();
    }
  }, [user, authLoading, router]);

  /** Load categories and note detail (if editing) */
  const loadData = async () => {
    try {
      const categoriesRes = await api.get<Category[]>("/categories/");
      setCategories(categoriesRes.data);

      if (!isNew) {
        const noteRes = await api.get<NoteDetail>(`/notes/${noteId}/`);
        setTitle(noteRes.data.title);
        setContent(noteRes.data.content);
        setSelectedCategory(noteRes.data.category);
        setLastSaved(new Date(noteRes.data.updated_at).toLocaleString());
      } else if (categoriesRes.data.length > 0) {
        setSelectedCategory(categoriesRes.data[0].id);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  /** Persist the note (create or update). */
  const handleSave = async () => {
    if (!selectedCategory) {
      alert("Please select a category");
      return;
    }

    setSaving(true);
    try {
      const data = {
        title,
        content,
        category: selectedCategory,
      };

      if (isNew) {
        const response = await api.post("/notes/", data);
        router.push(`/note/${response.data.id}`);
      } else {
        await api.put(`/notes/${noteId}/`, data);
        setLastSaved(new Date().toLocaleString());
      }
    } catch (error) {
      console.error("Failed to save note:", error);
      alert("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  /** Delete the current note or exit if new. */
  const handleDelete = async () => {
    if (isNew) {
      router.push("/dashboard");
      return;
    }

    if (confirm("Are you sure you want to delete this note?")) {
      try {
        await api.delete(`/notes/${noteId}/`);
        router.push("/dashboard");
      } catch (error) {
        console.error("Failed to delete note:", error);
        alert("Failed to delete note");
      }
    }
  };

  /** Map category color key to Tailwind background class. */
  const getCategoryColor = (color: string) => {
    const colors: Record<string, string> = {
      peach: "bg-[#EF9C66]",
      yellow: "bg-[#FCDC94]",
      mint: "bg-[#C8CFA0]",
      turquoise: "bg-[#78ABA8]",
    };
    return colors[color] || colors.yellow;
  };

  /** Map category color key to an emoji. */
  const getCategoryEmoji = (color: string) => {
    const emojis: Record<string, string> = {
      peach: "🟠",
      yellow: "🟡",
      mint: "🟢",
      turquoise: "🔵",
    };
    return emojis[color] || "🟡";
  };

  /** Get background class for currently selected category. */
  const getSelectedCategoryColor = () => {
    const category = categories.find((c) => c.id === selectedCategory);
    return category ? getCategoryColor(category.color) : "bg-[#FCDC94]";
  };

  /** Toggle speech recognition to append dictated text to note content. */
  const toggleRecording = async () => {
    if (!isRecording) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert(
          "Speech recognition is not supported in this browser. Please use Chrome or Edge."
        );
        return;
      }

      try {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.lang = "en-US";
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;

        let finalTranscript = "";

        recognitionInstance.onresult = (event: any) => {
          let interimTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            } else {
              interimTranscript += transcript;
            }
          }

          const currentContent = content.split("<<RECORDING>>")[0];
          setContent(
            currentContent +
              (finalTranscript ? "\n\n" + finalTranscript : "") +
              (interimTranscript ? "<<RECORDING>>" + interimTranscript : "")
          );
        };

        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === "no-speech") {
            alert("No speech detected. Please try again speaking louder.");
          } else if (event.error === "not-allowed") {
            alert(
              "Microphone permission denied. Please allow microphone access in browser settings."
            );
          } else if (event.error === "network") {
            alert(
              "Network error! Voice recognition requires internet connection.\n\n" +
                "Check:\n" +
                "1. Your internet connection\n" +
                "2. If using HTTPS (required for microphone)\n" +
                "3. Firewall or antivirus blocking the connection\n\n" +
                "You can still type your note manually."
            );
          } else if (event.error === "aborted") {
            console.log("Speech recognition aborted by user");
          } else {
            alert(
              "Voice recognition error: " +
                event.error +
                "\n\nTry:\n" +
                "1. Reload the page\n" +
                "2. Check your connection\n" +
                "3. Use Chrome or Edge"
            );
          }
          setIsRecording(false);
          setRecognition(null);
        };

        recognitionInstance.onend = () => {
          setContent((prev) => prev.replace("<<RECORDING>>", ""));
          setIsRecording(false);
        };

        recognitionInstance.start();
        setRecognition(recognitionInstance);
        setIsRecording(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        alert("Could not start speech recognition. Please try again.");
      }
    } else {
      if (recognition) {
        recognition.stop();
        setRecognition(null);
        setIsRecording(false);
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#FAF1E3]">
      
      <div className="max-w-5xl mx-auto mb-4 md:mb-6">
        
        <div className="flex md:hidden flex-col gap-3 mb-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="btn btn-circle btn-ghost btn-sm"
            >
              ✕
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="btn btn-ghost btn-error btn-sm"
              >
                Delete
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-sm rounded-full border-2 border-[#88642A] bg-transparent text-[#88642A] hover:bg-[#88642A] hover:text-white transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(Number(e.target.value))}
            aria-label="Select category"
            className={`select select-bordered select-sm rounded-full ${getSelectedCategoryColor()} w-full`}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {getCategoryEmoji(category.color)} {category.name}
              </option>
            ))}
          </select>
          {isRecording && (
            <span className="text-xs text-red-500 font-semibold animate-pulse flex items-center gap-2 justify-center">
              🎤 Listening...
            </span>
          )}
          {!isRecording && lastSaved && (
            <span className="text-xs opacity-60 text-center">
              Last Edited: {lastSaved}
            </span>
          )}
        </div>

        
        <div className="hidden md:flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="btn btn-circle btn-ghost"
            >
              ✕
            </button>
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(Number(e.target.value))}
              aria-label="Select category"
              className={`select select-bordered rounded-full ${getSelectedCategoryColor()}`}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {getCategoryEmoji(category.color)} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            {isRecording && (
              <span className="text-sm text-red-500 font-semibold animate-pulse flex items-center gap-2">
                🎤 Listening...
              </span>
            )}
            {!isRecording && lastSaved && (
              <span className="text-sm opacity-60">
                Last Edited: {lastSaved}
              </span>
            )}
            <button onClick={handleDelete} className="btn btn-ghost btn-error">
              Delete
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn rounded-full border-2 border-[#88642A] bg-transparent text-[#88642A] hover:bg-[#88642A] hover:text-white transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      
      <div
        className={`max-w-5xl mx-auto ${getSelectedCategoryColor()} p-6 md:p-12 rounded-3xl border-2 border-gray-200 min-h-[70vh] md:min-h-[80vh] shadow-lg relative`}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input input-ghost w-full text-2xl md:text-3xl font-bold bg-transparent border-none outline-none mb-4 md:mb-6 px-0"
          placeholder="Note Title"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="textarea textarea-ghost w-full h-[50vh] md:h-[55vh] bg-transparent border-none outline-none resize-none text-base md:text-lg px-0"
          placeholder="Pour your heart out...&#10;&#10;Create lists with:&#10;- Item 1&#10;- Item 2&#10;&#10;Or numbered:&#10;1. First&#10;2. Second"
        />

        <div className="mt-4 text-xs md:text-sm opacity-60">
          💡 <strong>Tip:</strong> Use{" "}
          <code className="bg-base-200 px-1 md:px-2 py-1 rounded text-xs">
            -
          </code>{" "}
          or{" "}
          <code className="bg-base-200 px-1 md:px-2 py-1 rounded text-xs">
            *
          </code>{" "}
          for bullet lists,{" "}
          <code className="bg-base-200 px-1 md:px-2 py-1 rounded text-xs">
            1.
          </code>{" "}
          for numbered lists
        </div>

        
        <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8">
          {!isRecording ? (
            <button
              onClick={toggleRecording}
              className="btn btn-circle btn-md md:btn-lg bg-base-content text-base-100 hover:bg-base-content/80 shadow-xl border-2 border-base-300"
              aria-label="Start audio recording"
            >
              <Phone size={20} className="md:w-6 md:h-6" />
            </button>
          ) : (
            <div
              className={`flex items-center gap-2 md:gap-3 ${getSelectedCategoryColor()} px-4 md:px-6 py-2 md:py-3 rounded-full shadow-xl border-2 border-base-300`}
            >
              <button
                className="btn btn-circle btn-xs md:btn-sm bg-base-content text-base-100 hover:bg-base-content/80 border-2 border-base-300"
                aria-label="Microphone"
              >
                <Mic size={14} className="md:w-[18px] md:h-[18px]" />
              </button>
              <button
                onClick={toggleRecording}
                className="btn btn-circle btn-xs md:btn-sm bg-red-500 text-white hover:bg-red-600 border-2 border-base-300"
                aria-label="End call"
              >
                <PhoneOff size={14} className="md:w-[18px] md:h-[18px]" />
              </button>
              <button
                className="btn btn-circle btn-xs md:btn-sm bg-base-content text-base-100 hover:bg-base-content/80 border-2 border-base-300"
                aria-label="Audio waves"
              >
                <Mic2 size={14} className="md:w-[18px] md:h-[18px]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
