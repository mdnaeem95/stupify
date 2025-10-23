import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/user/profile
 * Returns user's profile, subscription status, and knowledge graph
 */
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ ADDED: Fetch profile data (subscription_status, monthly_questions_used)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status, monthly_questions_used, stripe_customer_id, created_at, full_name, avatar_url')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      
      // If profile doesn't exist, create it
      if (profileError.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            subscription_status: 'free',
            monthly_questions_used: 0
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        // Return minimal profile data
        return NextResponse.json({
          userId: user.id,
          email: user.email,
          subscription_status: 'free',
          monthly_questions_used: 0,
          stripe_customer_id: null,
          full_name: null,
          avatar_url: null,
          knownTopics: [],
          totalConversations: 0,
          totalMessages: 0,
          createdAt: newProfile.created_at
        });
      }
      
      throw profileError;
    }

    // Get knowledge graph
    const { data: knowledge, error: knowledgeError } = await supabase
      .from('user_knowledge_graph')
      .select('*')
      .eq('user_id', user.id)
      .order('questions_asked', { ascending: false })
      .limit(20);

    if (knowledgeError) throw knowledgeError;

    // Get total conversations
    const { count: totalConversations, error: convCountError } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    if (convCountError) throw convCountError;

    // Get conversation IDs
    const { data: userConversations, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', user.id);
    if (convError) throw convError;

    const conversationIds = userConversations?.map(c => c.id) || [];

    // Get total messages (only if there are conversations)
    let totalMessages = 0;
    if (conversationIds.length > 0) {
      const { count: msgCount, error: msgError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds);
      
      if (msgError) throw msgError;
      totalMessages = msgCount || 0;
    }

    // ✅ UPDATED: Return all profile data including subscription info
    return NextResponse.json({
      userId: user.id,
      email: user.email,
      // Profile data from profiles table
      subscription_status: profile.subscription_status,
      monthly_questions_used: profile.monthly_questions_used || 0,
      stripe_customer_id: profile.stripe_customer_id,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      // Knowledge graph data
      knownTopics: knowledge?.map(k => ({
        topic: k.topic,
        questionsAsked: k.questions_asked,
        understandingLevel: k.understanding_level,
        lastAskedAt: k.last_asked_at
      })) || [],
      totalConversations: totalConversations || 0,
      totalMessages: totalMessages,
      createdAt: profile.created_at
    });

  } catch (error) {
    console.error('Profile API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * Update user preferences and profile data
 */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // ✅ FIXED: Actually update the profile with the data from the request
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, profile: data });

  } catch (error) {
    console.error('Profile Update Error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}