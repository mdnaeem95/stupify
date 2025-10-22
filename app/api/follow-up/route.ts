import { NextRequest, NextResponse } from 'next/server';
import { predictFollowUpQuestions, predictFollowUpQuestionsPattern } from '@/lib/chat/question-predictor';
import type { SimplicityLevel } from '@/lib/prompts/prompts-v2';

/**
 * API ROUTE: /api/follow-up
 * 
 * Generates 3 intelligent follow-up questions based on the conversation.
 * 
 * POST body:
 * {
 *   userQuestion: string,
 *   aiResponse: string,
 *   simplicityLevel: '5yo' | 'normal' | 'advanced',
 *   usePattern?: boolean  // Optional: use pattern-based instead of AI
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userQuestion, aiResponse, simplicityLevel, usePattern } = body;

    // Validate inputs
    if (!userQuestion || !aiResponse || !simplicityLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: userQuestion, aiResponse, simplicityLevel' },
        { status: 400 }
      );
    }

    // Validate simplicity level
    const validLevels: SimplicityLevel[] = ['5yo', 'normal', 'advanced'];
    if (!validLevels.includes(simplicityLevel)) {
      return NextResponse.json(
        { error: 'Invalid simplicityLevel. Must be: 5yo, normal, or advanced' },
        { status: 400 }
      );
    }

    // Choose prediction method
    let questions;
    if (usePattern) {
      // Pattern-based (faster, no API cost)
      questions = predictFollowUpQuestionsPattern({
        userQuestion,
        aiResponse,
        simplicityLevel
      });
    } else {
      // AI-based (better quality, uses OpenAI)
      questions = await predictFollowUpQuestions({
        userQuestion,
        aiResponse,
        simplicityLevel
      });
    }

    return NextResponse.json({
      success: true,
      questions
    });

  } catch (error) {
    console.error('Follow-up API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate follow-up questions' },
      { status: 500 }
    );
  }
}

/**
 * GET: Health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Follow-up questions API is running'
  });
}