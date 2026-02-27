import { createClient } from '@supabase/supabase-js';
import type { Project, Request, Category } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null as any;

// Server-side client with service role key
export const supabaseServer = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  if (!url || !key) {
    throw new Error('Supabase credentials not configured');
  }
  
  return createClient(url, key);
};

// Projects
export const fetchAllProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const fetchProjectBySlug = async (slug: string): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
};

export const fetchFeaturedProjects = async (limit = 3): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

// Requests
export const createRequest = async (request: Omit<Request, 'id' | 'requested_at' | 'status'>) => {
  const { data, error } = await supabase
    .from('project_requests')
    .insert([request]);

  if (error) throw error;
  return data;
};

export const fetchRequestsByStatus = async (status: string) => {
  const { data, error } = await supabase
    .from('project_requests')
    .select('*')
    .eq('status', status)
    .order('requested_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const fetchRecentRequests = async (limit = 10) => {
  const { data, error } = await supabase
    .from('project_requests')
    .select('*')
    .order('requested_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

export const approveRequest = async (requestId: string, accessLink: string) => {
  const { error } = await supabaseServer()
    .from('project_requests')
    .update({
      status: 'approved',
      access_link: accessLink,
      approved_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (error) throw error;
};

export const rejectRequest = async (requestId: string) => {
  const { error } = await supabaseServer()
    .from('project_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId);

  if (error) throw error;
};

// Admin auth check
export const checkAdminAuth = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
};

// Categories
export const fetchCategories = async (): Promise<(Category & { count: number })[]> => {
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (catError) throw catError;

  // Get project count for each category
  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (cat: any) => {
      const { count, error: countError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('category', cat.name);

      return {
        ...cat,
        count: countError ? 0 : (count || 0),
      };
    })
  );

  return categoriesWithCounts;
};

export const getCategoryCount = async (categoryName: string): Promise<number> => {
  const { count, error } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('category', categoryName);

  if (error) return 0;
  return count || 0;
};
