// --- Library ---
export type LibraryMemberStatus = 'Active' | 'Suspended' | 'Inactive';
export interface LibraryMember {
    id: string;
    siteId: string;
    userId: string; // Can be student or teacher ID
    memberType: 'Student' | 'Teacher';
    libraryCardNo: string;
    status: LibraryMemberStatus;
}
export interface Book {
    id: string;
    siteId: string;
    title: string;
    author: string;
    isbn: string;
    publisher?: string;
    year?: number;
    edition?: string;
    category?: string;
    language?: string;
    quantity: number;
    available: number;
    shelf?: string;
    coverUrl?: string;
}
export interface BookIssue {
    id: string;
    siteId: string;
    bookId: string;
    memberId: string;
    issueDate: string;
    dueDate: string;
    returnDate?: string;
    status: 'Issued' | 'Returned' | 'Lost';
}
export type DigitalKind = 'EBOOK' | 'AUDIO' | 'VIDEO';
export interface DigitalAsset {
    id: string;
    siteId: string;
    title: string;
    kind: DigitalKind;
    subject: string;
    classId: string;
    storageKey: string;
    coverUrl?: string;
}
export type VideoHost = 'YOUTUBE' | 'VIMEO' | 'SELF';
export interface CatchupClass {
    id: string;
    siteId: string;
    title: string;
    description?: string;
    classId: string;
    subjectId: string;
    date: string;
    host: VideoHost;
    sourceKey: string;
    durationSec: number;
    status: 'DRAFT' | 'PUBLISHED';
}
export interface CatchupPrompt {
    id: string;
    catchupId: string;
    atSec: number;
    text: string;
}
export interface CatchupQuizQuestion {
    q: string;
    options: string[];
    correct: number;
}
export interface CatchupQuiz {
    minPassPct: number;
    questions: { items: CatchupQuizQuestion[] };
}
export interface CatchupPlaybackToken {
    jwt: string;
    src: string;
    host: VideoHost;
    rules: { minPct: number; allowFwdWindowSec: number };
    prompts: CatchupPrompt[];
    quiz?: CatchupQuiz;
    watermark: { userId: string; name: string; ts: string };
}
