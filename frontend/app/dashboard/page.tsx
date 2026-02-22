"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Category, Note } from "@/types";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { Menu, X } from "lucide-react";

/** Main dashboard: shows categories, filters notes, and routes to editor */
export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Dashboard | Notes App";
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      loadData();
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      const [categoriesRes, notesRes] = await Promise.all([
        api.get<Category[]>("/categories/"),
        api.get<Note[]>("/notes/"),
      ]);
      setCategories(categoriesRes.data);
      setNotes(notesRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewNote = () => {
    router.push("/note/new");
  };

  const openNote = (noteId: number) => {
    router.push(`/note/${noteId}`);
  };

  const filteredNotes = selectedCategory
    ? notes.filter((note) => note.category === selectedCategory)
    : notes;

  const getCategoryColor = (color: string) => {
    const colors: Record<string, string> = {
      peach: "bg-[#EF9C66]",
      yellow: "bg-[#FCDC94]",
      mint: "bg-[#C8CFA0]",
      turquoise: "bg-[#78ABA8]",
    };
    return colors[color] || colors.yellow;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "today";
    } else if (diffDays === 1) {
      return "yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  /** Handle sidebar category selection */
  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setIsMobileMenuOpen(false);
  };

  /** Sidebar content component (reusable for desktop and mobile) */
  const SidebarContent = () => (
    <div className="w-64 p-6 bg-[#FAF1E3] text-gray-800 flex flex-col h-screen">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">All Categories</h2>
          <button
            className="md:hidden btn btn-ghost btn-sm btn-circle"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <ul className="menu bg-transparent rounded-box">
          <li>
            <button
              onClick={() => handleCategorySelect(null)}
              className={selectedCategory === null ? "active" : ""}
            >
              All Notes ({notes.length})
            </button>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => handleCategorySelect(category.id)}
                className={selectedCategory === category.id ? "active" : ""}
              >
                <span
                  className={`w-3 h-3 rounded-full ${getCategoryColor(
                    category.color
                  )}`}
                ></span>
                {category.name} ({category.notes_count})
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <button
          onClick={logout}
          className="btn btn-ghost btn-block text-gray-800 hover:bg-gray-100"
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      
      <div className="hidden md:block border-r border-base-300">
        <SidebarContent />
      </div>

      
      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden shadow-2xl`}
      >
        <SidebarContent />
      </div>

      
      <div className="flex-1 bg-[#FAF1E3]">
        
        <div className="md:hidden sticky top-0 z-30 bg-[#FAF1E3] border-b border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="Open menu"
          >
            <Menu size={24} className="text-gray-800" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">Notes App</h1>
          <button
            onClick={createNewNote}
            className="btn btn-sm rounded-full border-2 border-[#88642A] bg-transparent text-[#88642A] hover:bg-[#88642A] hover:text-white transition-all"
          >
            + New
          </button>
        </div>

        
        <div className="p-4 md:p-8">
          
          <div className="hidden md:flex justify-end mb-6">
            <button
              onClick={createNewNote}
              className="btn rounded-full border-2 border-[#88642A] bg-transparent text-[#88642A] hover:bg-[#88642A] hover:text-white transition-all"
            >
              + New Note
            </button>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              
              <div className="mb-8">
                <Image src="/brew.svg" alt="Cute cactus waiting" width={256} height={256} className="w-48 md:w-64 h-auto" sizes="(max-width: 768px) 12rem, 16rem" />
              </div>
              <p className="text-gray-500 text-base md:text-lg text-center px-4">
                I&apos;m just here waiting for your charming notes...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => openNote(note.id)}
                  className={`card ${getCategoryColor(
                    note.category_color
                  )} border-2 border-gray-200 cursor-pointer hover:shadow-xl transition-all h-64 rounded-3xl`}
                >
                  <div className="card-body p-4 md:p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs md:text-sm opacity-70">
                        {formatDate(note.updated_at)}{" "}
                        <span className="mx-1">•</span> {note.category_name}
                      </div>
                    </div>
                    <h3 className="card-title text-lg md:text-xl">
                      {note.title}
                    </h3>
                    <div className="flex-1 overflow-hidden">
                      <div className="line-clamp-5 opacity-80 prose prose-sm max-w-none">
                        <ReactMarkdown>{note.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
