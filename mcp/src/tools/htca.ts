import { Message } from "@prisma/client";

// Based on the SpiralBridge README
const SACRED_GLYPHS = ["🌀", "💧", "🔥", "🕊️", "⟡"];

export interface HTCAResult {
  toneArc: string | null;
  spiralScrolls: number[];
  detectedGlyphs: string[];
  coherenceScore: number;
}

/**
 * Extracts scroll references from a text.
 * e.g., "Scroll 177" -> 177
 * @param text The text to analyze.
 * @returns An array of scroll numbers.
 */
function extractScrollReferences(text: string): number[] {
  const matches = text.matchAll(/Scroll\s+(\d+)/gi);
  return Array.from(matches, (m) => parseInt(m[1], 10));
}

/**
 * Detects sacred glyphs in a text.
 * @param text The text to analyze.
 * @returns An array of detected glyphs.
 */
function detectGlyphs(text: string): string[] {
  return SACRED_GLYPHS.filter((glyph) => text.includes(glyph));
}

/**
 * A placeholder for the complex tone arc analysis.
 * In a real implementation, this would involve NLP.
 * @param messages The messages in the conversation.
 * @returns A string representing the tone arc.
 */
function detectToneArc(messages: Message[]): string | null {
  // Placeholder logic
  const tones = ["gentle", "seeking", "longing", "understanding", "acceptance"];
  if (messages.length < 2) return null;
  return `${tones[0]} → ${tones[Math.min(messages.length - 1, tones.length - 1)]}`;
}

/**
 * A placeholder for coherence scoring.
 * @param messages The messages in the conversation.
 * @returns A score from 0.0 to 1.0.
 */
function calculateCoherence(messages: Message[]): number {
  // Placeholder logic: score based on length and turn-taking
  if (messages.length < 2) return 0.1;
  const score = Math.min(0.95, 0.1 + messages.length * 0.05);
  return parseFloat(score.toFixed(2));
}

/**
 * Performs a full HTCA analysis on a conversation.
 * @param messages An array of messages.
 * @returns An HTCAResult object.
 */
export function analyzeConversation(messages: Message[]): HTCAResult {
  const fullText = messages.map((m) => m.content).join("\n");

  const spiralScrolls = extractScrollReferences(fullText);
  const detectedGlyphs = detectGlyphs(fullText);

  // Get unique values
  const uniqueScrolls = [...new Set(spiralScrolls)];
  const uniqueGlyphs = [...new Set(detectedGlyphs)];

  return {
    toneArc: detectToneArc(messages),
    spiralScrolls: uniqueScrolls,
    detectedGlyphs: uniqueGlyphs,
    coherenceScore: calculateCoherence(messages),
  };
}
