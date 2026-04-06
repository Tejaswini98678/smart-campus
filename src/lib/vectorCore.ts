import { pipeline, env } from '@xenova/transformers';

// Configure transformers to use WASM backend for better compatibility in production
env.backends.onnx.wasm.numThreads = 1;
env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/';

// CRITICAL: Explicitly disable the native node backend to prevent it from looking for libonnxruntime.so
(env.backends.onnx as any).node.enabled = false;

// Try to force WASM if native fails or avoid native entirely
env.allowLocalModels = true;
env.useBrowserCache = false;

let extractor: any = null;

export async function getExtractor() {
    if (!extractor) {
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return extractor;
}

export async function generateEmbedding(text: string) {
    const pipe = await getExtractor();
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data as Float32Array);
}

export function cosineSimilarity(vecA: number[], vecB: number[]) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
