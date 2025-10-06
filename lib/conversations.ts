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

// Create a new conversation
export async function createConversation(title: string = 'New Chat'): Promise<string | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: user.id,
      title,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    return null;
  }

  return data.id;
}

// Save a message to a conversation
export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  simplicityLevel?: SimplicityLevel
): Promise<boolean> {
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
    console.error('Error saving message:', error);
    return false;
  }

  // Update conversation's updated_at timestamp
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return true;
}

// Load messages for a conversation
export async function loadConversation(conversationId: string): Promise<SavedMessage[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading conversation:', error);
    return [];
  }

  return data || [];
}

// Get all conversations for the current user
export async function getUserConversations(): Promise<Conversation[]> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error loading conversations:', error);
    return [];
  }

  return data || [];
}

// Update conversation title
export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('conversations')
    .update({ title })
    .eq('id', conversationId);

  if (error) {
    console.error('Error updating conversation title:', error);
    return false;
  }

  return true;
}

// Delete a conversation
export async function deleteConversation(conversationId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);

  if (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }

  return true;
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
  
  return title || 'New Chat';
}