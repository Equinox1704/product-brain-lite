export type Chunk = {
  id: string; // e.g. DOC-007#2
  docId: string;
  type: "doc" | "ticket" | "chat";
  title: string;
  date: string;
  text: string;
  embedding?: number[];
};