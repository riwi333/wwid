import * as monaco from 'monaco-editor';

export type ModelWrapper = {
    id: number;
    model: monaco.editor.ITextModel | null;
};

export const Fixed = {
    MaxPreviewLength: 5,
}

// get a short preview of the given graph description to display on its tab
export function previewModelText(model: monaco.editor.ITextModel | null)
    : string {

    if (model == null) return "...";

    const text = model.getValue();

    if (text.length < Fixed.MaxPreviewLength) {
        return text + "...";
    }

    const index0 = 0; // Math.random() * (text.length - Fixed.MaxPreviewLength);
    const preview = text.substring(index0, index0 + Fixed.MaxPreviewLength);
    
    return preview + "...";
}