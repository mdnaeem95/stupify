/**
 * Transcribe API Route
 * 
 * Handles audio transcription using OpenAI Whisper API
 * This is the fallback method when Web Speech API is unavailable
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Maximum file size: 25MB (Whisper API limit)
const MAX_FILE_SIZE = 25 * 1024 * 1024;

// Supported audio formats
const SUPPORTED_FORMATS = [
  'audio/flac',
  'audio/m4a',
  'audio/mp3',
  'audio/mp4',
  'audio/mpeg',
  'audio/mpga',
  'audio/oga',
  'audio/ogg',
  'audio/wav',
  'audio/webm',
];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const language = formData.get('language') as string | null;
    
    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'No audio file provided' },
        { status: 400 }
      );
    }
    
    // Validate file size
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 25MB.' },
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
      fileSize: audioFile.size,
      fileType: audioFile.type,
      language: language || 'auto-detect',
    });
    
    // Call Whisper API
    const startTime = Date.now();
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: language || undefined, // Let Whisper auto-detect if not specified
      response_format: 'json',
      // Note: temperature, prompt are optional parameters for fine-tuning
    });
    
    const duration = Date.now() - startTime;
    
    console.log('✅ Transcription complete:', {
      userId: user.id,
      transcriptLength: transcription.text.length,
      duration: `${duration}ms`,
    });
    
    // Track usage (optional - for analytics)
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
      console.warn('Failed to track transcription:', trackingError);
    }
    
    // Return transcript
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