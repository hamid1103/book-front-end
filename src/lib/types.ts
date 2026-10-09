export type Book = {
    _id: string;
    title: string;
    author: string;
    genre: string[];
    description: string;
    readingLevel: string[];
    tags: string[];
    materialType: string;
    imageUrl?: string;
    sourceUrl?: string;
    // Only set on books coming from /advice
    motivation?: string;
};

export type ReadingStatus = 'NotRead' | 'Reading' | 'Read';

// Response of the backend /readinglist routes. `book` holds ids when onlyId=true, full books otherwise
export type ReadingList<T extends string | Book = string> = {
    userID: string;
    book: T[];
    // Book id -> status, every book on the list has an entry
    status: Record<string, ReadingStatus>;
};

export const READING_STATUS_LABELS: Record<ReadingStatus, string> = {
    NotRead: 'Nog niet gelezen',
    Reading: 'Bezig',
    Read: 'Gelezen'
};

export type ReadingProfile = {
    languageLevel: 'A2' | 'B1' | 'B2' | 'C1';
    ReadingMotivation: 'ForSchool' | 'ForPleasure' | 'LanguageDevelopment';
    length: 'Short' | 'Medium' | 'Long';
    genre: string[];
};

export const MOTIVATION_LABELS: Record<ReadingProfile['ReadingMotivation'], string> = {
    ForSchool: 'Voor school',
    ForPleasure: 'Voor de lol',
    LanguageDevelopment: 'Taalontwikkeling'
};

export const LENGTH_LABELS: Record<ReadingProfile['length'], string> = {
    Short: 'Kort',
    Medium: 'Middel',
    Long: 'Lang'
};

// Response of the backend GET /teachers, linked is true when the logged in student is linked to them
export type Teacher = {
    id: number;
    userName: string;
    linked: boolean;
};

// Response of the backend GET /students, readingProfile is null when profileOnly=false and none was filled in
export type Student = {
    id: number;
    userName: string;
    email: string;
    readingProfile: ReadingProfile | null;
};

export type Role = 'student' | 'teacher' | 'admin';

// Response of the backend GET /users (admin only), role is lowercase like in /me
export type Account = {
    id: number;
    userName: string;
    email: string;
    role: Role;
};
