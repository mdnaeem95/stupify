/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/client';
import { SimplicityLevel } from './prompts';

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
}

// 🎯 LOGGING HELPER
const log = {
  info: (fn: string, msg: string, data?: any) => {
    console.log(`📝 [${fn}] ${msg}`, data || '')
  },
  error: (fn: string, msg: string, error: any) => {
    console.error(`❌ [${fn}] ${msg}`, error)
  },
  success: (fn: string, msg: string, data?: any) => {
    console.log(`✅ [${fn}] ${msg}`, data || '')
  }
}

// Create a new conversation
export async function createConversation(title: string = 'New Chat'): Promise<string | null> {
  log.info('createConversation', 'Creating new conversation', { title })
  
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    log.error('createConversation', 'Auth error', authError)
    return null
  }
  
  if (!user) {
    log.error('createConversation', 'No authenticated user', null)
    return null
  }

  log.info('createConversation', 'User authenticated', { userId: user.id })

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: user.id,
      title,
    })
    .select('id')
    .single();

  if (error) {
    log.error('createConversation', 'Database error', error)
    return null
  }

  log.success('createConversation', 'Conversation created', { conversationId: data.id })
  return data.id
}

// Save a message to a conversation
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
  })
  
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
    log.error('saveMessage', 'Failed to save message', error)
    return false
  }

  log.success('saveMessage', 'Message saved')

  // Update conversation's updated_at timestamp
  const { error: updateError } = await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  if (updateError) {
    log.error('saveMessage', 'Failed to update conversation timestamp', updateError)
  }

  return true
}

// Load messages for a conversation
export async function loadConversation(conversationId: string): Promise<SavedMessage[]> {
  log.info('loadConversation', 'Loading conversation', { conversationId })
  
  const supabase = createClient();

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    log.error('loadConversation', 'Failed to load messages', error)
    return []
  }

  log.success('loadConversation', 'Messages loaded', { count: data?.length || 0 })
  return data || []
}

// Get all conversations for the current user
export async function getUserConversations(): Promise<Conversation[]> {
  log.info('getUserConversations', 'Fetching user conversations')
  
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    log.error('getUserConversations', 'Auth error', authError)
    return []
  }
  
  if (!user) {
    log.error('getUserConversations', 'No authenticated user', null)
    return []
  }

  log.info('getUserConversations', 'User authenticated', { userId: user.id })

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    log.error('getUserConversations', 'Database error', error)
    return []
  }

  log.success('getUserConversations', 'Conversations loaded', { count: data?.length || 0 })
  return data || []
}

// Update conversation title
export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<boolean> {
  log.info('updateConversationTitle', 'Updating title', { conversationId, title })
  
  const supabase = createClient();

  const { error } = await supabase
    .from('conversations')
    .update({ title })
    .eq('id', conversationId);

  if (error) {
    log.error('updateConversationTitle', 'Failed to update title', error)
    return false
  }

  log.success('updateConversationTitle', 'Title updated')
  return true
}

// Delete a conversation
export async function deleteConversation(conversationId: string): Promise<boolean> {
  log.info('deleteConversation', 'Deleting conversation', { conversationId })
  
  const supabase = createClient();

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);

  if (error) {
    log.error('deleteConversation', 'Failed to delete conversation', error)
    return false
  }

  log.success('deleteConversation', 'Conversation deleted')
  return true
}

// Generate a title from the first user message
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
  
  const result = title || 'New Chat'
  log.info('generateConversationTitle', 'Generated title', { result })
  return result
}