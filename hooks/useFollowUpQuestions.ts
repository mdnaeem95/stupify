import { useState, useCallback } from 'react';
import { SimplicityLevel } from '@/lib/prompts/prompts';
import { FollowUpQuestion } from '@/lib/chat/question-predictor';

export function useFollowUpQuestions(simplicityLevel: SimplicityLevel) {
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);

  // Generate follow-up questions
  const generate = useCallback(async (userQuestion: string, aiResponse: string) => {
    console.log('🔍 Generating follow-ups:', { 
      userQuestion: userQuestion.slice(0, 50), 
      aiResponse: aiResponse.slice(0, 100) 
    });

    try {
      setLoadingFollowUp(true);

      const response = await fetch('/api/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuestion,
          aiResponse,
          simplicityLevel,
          usePattern: false,
        }),
      });

      console.log('📡 Follow-up API response:', response.status, response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Follow-up questions received:', data.questions);
        setFollowUpQuestions(data.questions);
      } else {
        console.error('❌ Follow-up API failed:', await response.text());
        setFollowUpQuestions([]);
      }
    } catch (error) {
      console.error('❌ Failed to generate follow-up questions:', error);
      setFollowUpQuestions([]);
    } finally {
      setLoadingFollowUp(false);
    }
  }, [simplicityLevel]);

  // Clear follow-up questions
  const clear = useCallback(() => {
    setFollowUpQuestions([]);
  }, []);

  return {
    followUpQuestions,
    loadingFollowUp,
    generate,
    clear,
  };
}