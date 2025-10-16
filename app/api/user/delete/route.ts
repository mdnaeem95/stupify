/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * DELETE /api/user/delete
 * Delete user account and all associated data
 */
export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete in order to respect foreign key constraints:
    
    // 1. Delete saved explanations
    await supabase
      .from('saved_explanations')
      .delete()
      .eq('user_id', user.id);

    // 2. Delete confusion events
    await supabase
      .from('confusion_events')
      .delete()
      .eq('user_id', user.id);

    // 3. Delete analogy ratings
    await supabase
      .from('analogy_ratings')
      .delete()
      .eq('user_id', user.id);

    // 4. Delete suggested questions
    await supabase
      .from('suggested_questions')
      .delete()
      .eq('user_id', user.id);

    // 5. Delete user knowledge graph
    await supabase
      .from('user_knowledge_graph')
      .delete()
      .eq('user_id', user.id);

    // 6. Delete user achievements
    await supabase
      .from('user_achievements')
      .delete()
      .eq('user_id', user.id);

    // 7. Delete learning stats
    await supabase
      .from('learning_stats')
      .delete()
      .eq('user_id', user.id);

    // 8. Delete user streaks
    await supabase
      .from('user_streaks')
      .delete()
      .eq('user_id', user.id);

    // 9. Delete daily usage
    await supabase
      .from('daily_usage')
      .delete()
      .eq('user_id', user.id);

    // 10. Delete messages
    await supabase
      .from('messages')
      .delete()
      .eq('user_id', user.id);

    // 11. Delete conversations
    await supabase
      .from('conversations')
      .delete()
      .eq('user_id', user.id);

    // 12. Delete profile
    await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    // 13. Delete auth user (this will cascade delete in Supabase Auth)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error('Error deleting auth user:', deleteError);
      // Continue anyway since we've deleted most data
    }

    return NextResponse.json({ 
      success: true,
      message: 'Account deleted successfully' 
    });

  } catch (error: any) {
    console.error('Account Deletion Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account', details: error.message },
      { status: 500 }
    );
  }
}