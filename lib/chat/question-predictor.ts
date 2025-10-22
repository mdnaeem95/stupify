import { SimplicityLevel } from '../prompts/prompts-v2';

/**
 * QUESTION PREDICTOR
 * 
 * Generates 3 intelligent follow-up questions based on:
 * - The user's original question
 * - The AI's response
 * - The complexity level they're using
 * - Natural curiosity patterns
 */

export interface FollowUpQuestion {
  id: string;
  text: string;
  category: 'deeper' | 'related' | 'practical';
}

export interface PredictorConfig {
  userQuestion: string;
  aiResponse: string;
  simplicityLevel: SimplicityLevel;
}

/**
 * System prompt for generating follow-up questions
 */
function getFollowUpPrompt(config: PredictorConfig): string {
  const levelGuidance = {
    '5yo': 'Questions should be simple and curious, like what a 5-year-old would ask next. Use simple words.',
    'normal': 'Questions should be conversational and practical, exploring natural next steps in understanding.',
    'advanced': 'Questions should dig deeper into mechanisms, implications, or adjacent technical topics.'
  };

  return `You are helping predict what someone might want to learn next.

USER'S ORIGINAL QUESTION: "${config.userQuestion}"

AI'S RESPONSE SUMMARY: "${config.aiResponse.slice(0, 500)}..."

COMPLEXITY LEVEL: ${config.simplicityLevel}
${levelGuidance[config.simplicityLevel]}

Generate exactly 3 follow-up questions that this person would naturally want to ask next. Follow these rules:

1. DEEPER QUESTION (exploring the same topic more deeply)
   - Digs into "how" or "why" 
   - Explores mechanisms or causes
   - Example: "How does [specific part] actually work?"

2. RELATED QUESTION (connecting to adjacent topics)
   - Explores related concepts or applications
   - Makes connections to other areas
   - Example: "How is this different from [related thing]?"

3. PRACTICAL QUESTION (real-world application or implications)
   - About using, seeing, or experiencing it
   - About implications or consequences  
   - Example: "Can I see this in everyday life?"

CRITICAL RULES:
- Keep questions SHORT (5-12 words maximum)
- Make them specific to what was just discussed
- Use the same vocabulary level as the user
- Sound curious and natural, not academic
- Don't ask questions already answered in the response
- Make them genuinely interesting (not boring follow-ups)

Return ONLY the 3 questions in this exact JSON format:
{
  "deeper": "question text here",
  "related": "question text here", 
  "practical": "question text here"
}`;
}

/**
 * Generate follow-up questions using OpenAI
 */
export async function predictFollowUpQuestions(
  config: PredictorConfig
): Promise<FollowUpQuestion[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: getFollowUpPrompt(config)
          },
          {
            role: 'user',
            content: 'Generate the 3 follow-up questions now.'
          }
        ],
        temperature: 0.8, // Higher for more creative questions
        max_tokens: 200,
        response_format: { type: 'json_object' } // Force JSON response
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    // Convert to our format
    return [
      {
        id: generateQuestionId(),
        text: parsed.deeper,
        category: 'deeper'
      },
      {
        id: generateQuestionId(),
        text: parsed.related,
        category: 'related'
      },
      {
        id: generateQuestionId(),
        text: parsed.practical,
        category: 'practical'
      }
    ];

  } catch (error) {
    console.error('Error predicting follow-up questions:', error);
    
    // Fallback to generic questions if prediction fails
    return getFallbackQuestions(config);
  }
}

/**
 * Fallback questions if API fails
 */
function getFallbackQuestions(config: PredictorConfig): FollowUpQuestion[] {
  const levelQuestions = {
    '5yo': [
      { text: "Can you tell me more?", category: 'deeper' as const },
      { text: "What else is like this?", category: 'related' as const },
      { text: "Can I see this myself?", category: 'practical' as const }
    ],
    'normal': [
      { text: "How does that work in detail?", category: 'deeper' as const },
      { text: "What's similar to this?", category: 'related' as const },
      { text: "Where do I see this in real life?", category: 'practical' as const }
    ],
    'advanced': [
      { text: "What's the underlying mechanism?", category: 'deeper' as const },
      { text: "How does this compare to alternatives?", category: 'related' as const },
      { text: "What are the practical implications?", category: 'practical' as const }
    ]
  };

  return levelQuestions[config.simplicityLevel].map(q => ({
    id: generateQuestionId(),
    ...q
  }));
}

/**
 * Generate unique ID for questions
 */
function generateQuestionId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * PATTERN-BASED PREDICTOR (Faster alternative)
 * 
 * Uses heuristics instead of AI to generate questions.
 * Good for development/testing or as a faster option.
 */
export function predictFollowUpQuestionsPattern(
  config: PredictorConfig
): FollowUpQuestion[] {
  const { userQuestion, simplicityLevel } = config;
  
  // Extract key terms from the question
  const keyTerms = extractKeyTerms(userQuestion);
  const mainTopic = keyTerms[0] || 'this';

  const templates = {
    '5yo': {
      deeper: [
        `Why does ${mainTopic} work that way?`,
        `What makes ${mainTopic} special?`,
        `How does ${mainTopic} happen?`
      ],
      related: [
        `What else is like ${mainTopic}?`,
        `Does ${mainTopic} have friends?`,
        `Where else can I find ${mainTopic}?`
      ],
      practical: [
        `Can I see ${mainTopic} myself?`,
        `Is ${mainTopic} safe to touch?`,
        `When do I see ${mainTopic}?`
      ]
    },
    'normal': {
      deeper: [
        `How exactly does ${mainTopic} work?`,
        `What causes ${mainTopic} to happen?`,
        `Why is ${mainTopic} important?`
      ],
      related: [
        `What's the difference between ${mainTopic} and similar things?`,
        `How does ${mainTopic} connect to other concepts?`,
        `What else uses ${mainTopic}?`
      ],
      practical: [
        `Where do I encounter ${mainTopic} in daily life?`,
        `Can I use ${mainTopic} somehow?`,
        `What are real examples of ${mainTopic}?`
      ]
    },
    'advanced': {
      deeper: [
        `What's the mechanism behind ${mainTopic}?`,
        `What are the theoretical foundations of ${mainTopic}?`,
        `What edge cases exist for ${mainTopic}?`
      ],
      related: [
        `How does ${mainTopic} compare to alternative approaches?`,
        `What adjacent fields study ${mainTopic}?`,
        `What are the trade-offs with ${mainTopic}?`
      ],
      practical: [
        `What are the practical applications of ${mainTopic}?`,
        `How is ${mainTopic} implemented in real systems?`,
        `What are current research directions for ${mainTopic}?`
      ]
    }
  };

  const level = templates[simplicityLevel];
  
  return [
    {
      id: generateQuestionId(),
      text: level.deeper[Math.floor(Math.random() * level.deeper.length)],
      category: 'deeper'
    },
    {
      id: generateQuestionId(),
      text: level.related[Math.floor(Math.random() * level.related.length)],
      category: 'related'
    },
    {
      id: generateQuestionId(),
      text: level.practical[Math.floor(Math.random() * level.practical.length)],
      category: 'practical'
    }
  ];
}

/**
 * Extract key terms from a question
 */
function extractKeyTerms(question: string): string[] {
  // Remove common question words
  const stopWords = ['what', 'how', 'why', 'when', 'where', 'who', 'is', 'are', 'does', 'do', 'can', 'the', 'a', 'an'];
  
  const words = question
    .toLowerCase()
    .replace(/[?.!]/g, '')
    .split(' ')
    .filter(word => word.length > 3 && !stopWords.includes(word));
  
  return words.slice(0, 3); // Return top 3 key terms
}

/**
 * Format questions for display (add emoji based on category)
 */
export function formatFollowUpQuestion(question: FollowUpQuestion): string {
  const emoji = {
    deeper: '🔍',
    related: '🔗',
    practical: '💡'
  };
  
  return `${emoji[question.category]} ${question.text}`;
}