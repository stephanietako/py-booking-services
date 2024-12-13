"use client";

import { useEffect, useState } from "react";
import styles from "./styles.module.scss";

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const response = await fetch("/api/notes");
    const data = await response.json();
    setNotes(data);
  };

  const handleAddNote = async () => {
    if (!title || !content) return;

    const response = await fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    });

    if (response.ok) {
      fetchNotes();
      setTitle("");
      setContent("");
    }
  };

  const handleUpdateNote = async (id: number) => {
    const newTitle = prompt("Enter new title");
    const newContent = prompt("Enter new content");
    if (!newTitle || !newContent) return;

    await fetch("/api/notes", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, title: newTitle, content: newContent }),
    });

    fetchNotes();
  };

  const handleDeleteNote = async (id: number) => {
    await fetch(`/api/notes/${id}`, {
      method: "DELETE",
    });

    fetchNotes();
  };

  return (
    <div className={styles.container}>
      <h1>Notes</h1>
      <div className={styles.form}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={handleAddNote}>Add Note</button>
      </div>
      <ul className={styles.notes}>
        {notes.map((note) => (
          <li key={note.id} className={styles.note}>
            <h2>{note.title}</h2>
            <p>{note.content}</p>
            <button onClick={() => handleUpdateNote(note.id)}>Update</button>
            <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotesPage;
