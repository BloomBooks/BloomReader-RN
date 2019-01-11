export interface Book {
  name: string;
  filename: string;
  thumbPath?: string;
  modifiedAt: number; // millis UTC
}
