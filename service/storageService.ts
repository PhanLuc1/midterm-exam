import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const SUBJECTS_KEY = 'subjects';
const NOTES_PREFIX = 'notes_';

export const StorageService = {
  // Subjects management
  async getSubjects(): Promise<Subject[]> {
    try {
      const value = await AsyncStorage.getItem(SUBJECTS_KEY);
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting subjects:', error);
      return [];
    }
  },

  async saveSubjects(subjects: Subject[]): Promise<void> {
    try {
      await AsyncStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
    } catch (error) {
      console.error('Error saving subjects:', error);
    }
  },

  async initDefaultSubjects(): Promise<void> {
    const subjects = await this.getSubjects();
    if (subjects.length === 0) {
      const defaultSubjects: Subject[] = [
        { id: '1', name: 'Toán học', icon: '📐', color: '#3b82f6' },
        { id: '2', name: 'Vật lý', icon: '⚛️', color: '#8b5cf6' },
        { id: '3', name: 'Hóa học', icon: '🧪', color: '#ec4899' },
        { id: '4', name: 'Tiếng Anh', icon: '🇬🇧', color: '#10b981' },
        { id: '5', name: 'CNTT', icon: '💻', color: '#f59e0b' },
        { id: '6', name: 'Văn học', icon: '📚', color: '#06b6d4' },
      ];
      await this.saveSubjects(defaultSubjects);
    }
  },

  // Notes management
  async getNotes(subjectId: string): Promise<Note[]> {
    try {
      const value = await AsyncStorage.getItem(`${NOTES_PREFIX}${subjectId}`);
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  },

  async saveNotes(subjectId: string, notes: Note[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${NOTES_PREFIX}${subjectId}`,
        JSON.stringify(notes)
      );
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  },

  async addNote(subjectId: string, content: string): Promise<Note> {
    const notes = await this.getNotes(subjectId);
    const newNote: Note = {
      id: Date.now().toString(),
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    notes.unshift(newNote);
    await this.saveNotes(subjectId, notes);
    return newNote;
  },

  async updateNote(subjectId: string, noteId: string, content: string): Promise<void> {
    const notes = await this.getNotes(subjectId);
    const index = notes.findIndex(note => note.id === noteId);
    if (index !== -1) {
      notes[index].content = content;
      notes[index].updatedAt = new Date().toISOString();
      await this.saveNotes(subjectId, notes);
    }
  },

  async deleteNote(subjectId: string, noteId: string): Promise<void> {
    const notes = await this.getNotes(subjectId);
    const filteredNotes = notes.filter(note => note.id !== noteId);
    await this.saveNotes(subjectId, filteredNotes);
  },
};