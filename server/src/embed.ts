import { pipeline } from "@xenova/transformers";

let extractor: any;

export async function embed(text: string): Promise<number[]> {
  extractor ??= await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  const out = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(out.data as Float32Array);
}