/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OpenAI } from 'openai';

// ⭐ NEW: Import rate limiting
import {
  voiceLimiter,
  globalLimiter,
  getClientIp,
  getUserIdentifier,
  checkRateLimit,
  createRateLimitResponse,
} from '@/lib/rate-limit';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Supported audio formats for Whisper API
const SUPPORTED_FORMATS = [
  'audio/webm',
  'audio/mp4',
  'audio/mpeg',
  'audio/mpga',
  'audio/m4a',
  'audio/wav',
  'audio/flac',
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (Whisper API limit)

export async function POST(request: NextRequest) {
  try {
    // ============================================================================
    // STEP 1: GLOBAL RATE LIMITING (ANTI-ABUSE)
    // ============================================================================
    
    const ip = getClientIp(request);
    
    // Check global rate limit first
    const globalCheck = await checkRateLimit(globalLimiter, ip);
    
    if (!globalCheck.success) {
      console.warn(`⚠️ Global rate limit exceeded for IP: ${ip}`);
      return createRateLimitResponse(
        "Too many requests from your IP. Please slow down.",
        globalCheck.limit,
        globalCheck.remaining,
        globalCheck.reset
      );
    }
    
    // ============================================================================
    // STEP 2: AUTHENTICATE USER
    // ============================================================================
    
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }
    
    // ============================================================================
    // STEP 3: VOICE-SPECIFIC RATE LIMITING
    // ============================================================================
    
    // Voice transcription is expensive - limit to 50/hour per user
    const identifier = getUserIdentifier(user.id, ip);
    const voiceCheck = await checkRateLimit(voiceLimiter, identifier);
    
    if (!voiceCheck.success) {
      console.warn(`⚠️ Voice rate limit exceeded:`, {
        userId: user.id,
        limit: voiceCheck.limit,
      });
      
      return createRateLimitResponse(
        `Voice transcription limit reached (${voiceCheck.limit}/hour). Please try again later.`,
        voiceCheck.limit,
        voiceCheck.remaining,
        voiceCheck.reset
      );
    }
    
    console.log(`🎤 Voice quota:`, {
      userId: user.id,
      remaining: voiceCheck.remaining,
      limit: voiceCheck.limit,
    });
    
    // ============================================================================
    // STEP 4: PARSE REQUEST
    // ============================================================================
    
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const language = formData.get('language') as string | null;
    
    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'No audio file provided' },
        { status: 400 }
      );
    }
    
    // ============================================================================
    // STEP 5: VALIDATE FILE
    // ============================================================================
    
    // Validate file size
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          error: `File too large: ${(audioFile.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 25MB.` 
        },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!SUPPORTED_FORMATS.includes(audioFile.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Unsupported file format: ${audioFile.type}. Supported formats: ${SUPPORTED_FORMATS.join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    console.log('📝 Transcribing audio:', {
      userId: user.id,
      fileName: audioFile.name,
      fileSize: `${(audioFile.size / 1024).toFixed(2)}KB`,
      fileType: audioFile.type,
      language: language || 'auto-detect',
    });
    
    // ============================================================================
    // STEP 6: CALL WHISPER API
    // ============================================================================
    
    const startTime = Date.now();
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: language || undefined,
      response_format: 'json',
    });
    
    const duration = Date.now() - startTime;
    
    console.log('✅ Transcription complete:', {
      userId: user.id,
      transcriptLength: transcription.text.length,
      duration: `${duration}ms`,
    });
    
    // ============================================================================
    // STEP 7: TRACK USAGE (OPTIONAL - FOR ANALYTICS)
    // ============================================================================
    
    try {
      await supabase.from('voice_transcriptions').insert({
        user_id: user.id,
        method: 'whisper',
        duration_ms: duration,
        file_size: audioFile.size,
        transcript_length: transcription.text.length,
        language: language || 'auto',
      });
    } catch (trackingError) {
      // Don't fail the request if tracking fails
      console.warn('⚠️ Failed to track transcription:', trackingError);
    }
    
    // ============================================================================
    // STEP 8: RETURN TRANSCRIPT
    // ============================================================================
    
    return NextResponse.json({
      success: true,
      transcript: transcription.text,
      language: language || 'auto-detected',
      duration: duration,
    });
    
  } catch (error: any) {
    console.error('❌ Transcription error:', error);
    
    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { success: false, error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }
    
    if (error.code === 'invalid_api_key') {
      console.error('Invalid OpenAI API key!');
      return NextResponse.json(
        { success: false, error: 'Service configuration error. Please contact support.' },
        { status: 500 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to transcribe audio. Please try again.' 
      },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}