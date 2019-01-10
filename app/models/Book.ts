export interface Book {
    name: string,
    filename: string,
    thumbPath?: string,
    modified: number  // millis UTC
}