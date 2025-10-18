import { setCachedResponse } from './cache-manager';

/**
 * Wrapper to cache streaming responses
 * Collects streamed chunks and caches the complete response
 */
export async function cacheStreamingResponse(
  stream: ReadableStream,
  question: string,
  simplicityLevel: string,
  model: string,
  provider: string
): Promise<ReadableStream> {
  let fullResponse = '';
  
  const transformStream = new TransformStream({
    transform(chunk, controller) {
      // Collect chunks for caching
      const text = new TextDecoder().decode(chunk);
      fullResponse += text;
      
      // Pass through to client
      controller.enqueue(chunk);
    },
    
    flush() {
      // After stream completes, cache the full response
      if (fullResponse && question) {
        setCachedResponse(
          question,
          simplicityLevel,
          fullResponse,
          model,
          provider
        ).catch(error => {
          console.error('[CACHE] Error caching streamed response:', error);
        });
      }
    }
  });
  
  return stream.pipeThrough(transformStream);
}

/**
 * Create a simulated streaming response from cached text
 * This makes cached responses feel consistent with non-cached ones
 */
export function createStreamFromCachedText(text: string): ReadableStream {
  const encoder = new TextEncoder();
  
  // Split text into chunks (simulate streaming)
  const chunkSize = 50; // characters per chunk
  const chunks: string[] = [];
  
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, i + chunkSize));
  }
  
  const index = 0;
  
  return new ReadableStream({
    async start(controller) {
      // Stream chunks with small delays
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
        
        // Small delay to simulate streaming (10ms per chunk)
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      controller.close();
    }
  });
}