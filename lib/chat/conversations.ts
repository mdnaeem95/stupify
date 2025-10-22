/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/client';
import { SimplicityLevel } from '../prompts/prompts';
import { type SubscriptionTier } from '../stripe';

export interface SavedMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  simplicity_level?: SimplicityLevel;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  delete_after?: string | null; // NEW: For automatic history retention
}

// NEW: Conversation limits by tier
const CONVERSATION_LIMITS = {
  free: 3,
  starter: 50,
  premium: null, // unlimited
};

// 🎯 LOGGING HELPER
const log = {
  info: (fn: string, msg: string, data?: any) => {
    console.log(`📝 [${fn}] ${msg}`, data || '');
  },
  error: (fn: string, msg: string, error: any) => {
    console.error(`❌ [${fn}] ${msg}`, error);
  },
  success: (fn: string, msg: string, data?: any) => {
    console.log(`✅ [${fn}] ${msg}`, data || '');
  },
};

// ============================================================================
// NEW: Check if user can create a new conversation based on their tier
// ============================================================================
export async function canCreateConversation(): Promise<{
  canCreate: boolean;
  reason?: string;
  currentCount?: number;
  limit?: number | null;
  tier?: SubscriptionTier;
}> {
  const supabase = createClient();

  // Get user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      canCreate: false,
      reason: 'Not authenticated',
    };
  }

  // Get user's tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single();

  const tier = (profile?.subscription_status || 'free') as SubscriptionTier;
  const limit = CONVERSATION_LIMITS[tier];

  // Premium has unlimited
  if (tier === 'premium') {
    return {
      canCreate: true,
      currentCount: 0,
      limit: null,
      tier,
    };
  }

  // Count current conversations
  const { count } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const currentCount = count || 0;

  log.info('canCreateConversation', 'Checked conversation limit', {
    tier,
    currentCount,
    limit,
  });

  if (currentCount >= limit!) {
    return {
      canCreate: false,
      reason: `You've reached your ${limit} conversation limit. Upgrade to save more!`,
      currentCount,
      limit,
      tier,
    };
  }

  return {
    canCreate: true,
    currentCount,
    limit,
    tier,
  };
}

// ============================================================================
// UPDATED: Create a new conversation (now checks limits and sets expiry)
// ============================================================================
export async function createConversation(title: string = 'New Chat'): Promise<string | null> {
  log.info('createConversation', 'Creating new conversation', { title });
  
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    log.error('createConversation', 'Auth error', authError);
    return null;
  }
  
  if (!user) {
    log.error('createConversation', 'No authenticated user', null);
    return null;
  }

  log.info('createConversation', 'User authenticated', { userId: user.id });

  // NEW: Check if user can create a conversation
  const check = await canCreateConversation();

  if (!check.canCreate) {
    log.error('createConversation', 'Cannot create conversation', {
      reason: check.reason,
      currentCount: check.currentCount,
      limit: check.limit,
    });
    
    // Show alert to user
    if (check.reason) {
      alert(check.reason);
    }
    
    return null;
  }

  // NEW: Get user's tier to set delete_after
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single();

  const tier = (profile?.subscription_status || 'free') as SubscriptionTier;

  // NEW: Calculate delete_after based on tier
  let deleteAfter: string | null = null;
  
  if (tier === 'free') {
    // 7 days from now
    const date = new Date();
    date.setDate(date.getDate() + 7);
    deleteAfter = date.toISOString();
  } else if (tier === 'starter') {
    // 30 days from now
    const date = new Date();
    date.setDate(date.getDate() + 30);
    deleteAfter = date.toISOString();
  }
  // Premium: deleteAfter stays null (permanent)

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: user.id,
      title: title.substring(0, 100), // Limit title length
      delete_after: deleteAfter, // NEW: Set expiry
    })
    .select('id')
    .single();

  if (error) {
    log.error('createConversation', 'Database error', error);
    return null;
  }

  log.success('createConversation', 'Conversation created', { 
    conversationId: data.id,
    tier,
    deleteAfter,
    remaining: check.limit ? check.limit - (check.currentCount || 0) - 1 : 'unlimited'
  });
  
  return data.id;
}

// ============================================================================
// UNCHANGED: Save a message to a conversation
// ============================================================================
export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  simplicityLevel?: SimplicityLevel
): Promise<boolean> {
  log.info('saveMessage', 'Saving message', { 
    conversationId, 
    role, 
    contentLength: content.length,
    simplicityLevel 
  });
  
  const supabase = createClient();

  const { error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      simplicity_level: simplicityLevel,
    });

  if (error) {
    log.error('saveMessage', 'Failed to save message', error);
    return false;
  }

  log.success('saveMessage', 'Message saved');

  // Update conversation's updated_at timestamp
  const { error: updateError } = await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  if (updateError) {
    log.error('saveMessage', 'Failed to update conversation timestamp', updateError);
  }

  return true;
}

// ============================================================================
// UNCHANGED: Load messages for a conversation
// ============================================================================
export async function loadConversation(conversationId: string): Promise<SavedMessage[]> {
  log.info('loadConversation', 'Loading conversation', { conversationId });
  
  const supabase = createClient();

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    log.error('loadConversation', 'Failed to load messages', error);
    return [];
  }

  log.success('loadConversation', 'Messages loaded', { count: data?.length || 0 });
  return data || [];
}

// ============================================================================
// UNCHANGED: Get all conversations for the current user
// ============================================================================
export async function getUserConversations(): Promise<Conversation[]> {
  log.info('getUserConversations', 'Fetching user conversations');
  
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    log.error('getUserConversations', 'Auth error', authError);
    return [];
  }
  
  if (!user) {
    log.error('getUserConversations', 'No authenticated user', null);
    return [];
  }

  log.info('getUserConversations', 'User authenticated', { userId: user.id });

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    log.error('getUserConversations', 'Database error', error);
    return [];
  }

  log.success('getUserConversations', 'Conversations loaded', { count: data?.length || 0 });
  return data || [];
}

// ============================================================================
// UNCHANGED: Update conversation title
// ============================================================================
export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<boolean> {
  log.info('updateConversationTitle', 'Updating title', { conversationId, title });
  
  const supabase = createClient();

  const { error } = await supabase
    .from('conversations')
    .update({ title })
    .eq('id', conversationId);

  if (error) {
    log.error('updateConversationTitle', 'Failed to update title', error);
    return false;
  }

  log.success('updateConversationTitle', 'Title updated');
  return true;
}

// ============================================================================
// UNCHANGED: Delete a conversation
// ============================================================================
export async function deleteConversation(conversationId: string): Promise<boolean> {
  log.info('deleteConversation', 'Deleting conversation', { conversationId });
  
  const supabase = createClient();

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);

  if (error) {
    log.error('deleteConversation', 'Failed to delete conversation', error);
    return false;
  }

  log.success('deleteConversation', 'Conversation deleted');
  return true;
}

// ============================================================================
// UNCHANGED: Generate a title from the first user message
// ============================================================================
export function generateConversationTitle(firstMessage: string): string {
  // Take first 50 characters or up to the first question mark/period
  const truncated = firstMessage.slice(0, 50);
  const endIndex = Math.min(
    truncated.indexOf('?') !== -1 ? truncated.indexOf('?') + 1 : truncated.length,
    truncated.indexOf('.') !== -1 ? truncated.indexOf('.') + 1 : truncated.length
  );
  
  let title = firstMessage.slice(0, endIndex).trim();
  
  // If still too long, truncate and add ellipsis
  if (title.length > 50) {
    title = title.slice(0, 47) + '...';
  }
  
  const result = title || 'New Chat';
  log.info('generateConversationTitle', 'Generated title', { result });
  return result;
}

// ============================================================================
// NEW: Get conversations that are about to expire (for warnings)
// ============================================================================
export async function getExpiringConversations(daysUntilExpiry: number = 2): Promise<Conversation[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry);

  const { data: conversations, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id)
    .not('delete_after', 'is', null)
    .lte('delete_after', expiryDate.toISOString())
    .order('delete_after', { ascending: true });

  if (error) {
    log.error('getExpiringConversations', 'Failed to fetch', error);
    return [];
  }

  log.info('getExpiringConversations', 'Expiring conversations found', { 
    count: conversations?.length || 0 
  });

  return conversations || [];
}