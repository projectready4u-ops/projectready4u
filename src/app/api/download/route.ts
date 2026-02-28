import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Fetch the request and get repo link
    const { data: requestData, error: fetchError } = await supabase
      .from('project_requests')
      .select(`
        id,
        user_email,
        status,
        download_link,
        download_link_expires_at,
        downloads_count,
        project_id
      `)
      .eq('id', requestId)
      .single();

    if (fetchError || !requestData) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Fetch the project separately to get the repo link
    const { data: projectData } = await supabase
      .from('projects')
      .select('id, title, github_repo_link')
      .eq('id', requestData.project_id)
      .single();

    // Check if request is approved
    if (requestData.status !== 'approved') {
      return NextResponse.json(
        { error: 'Request must be approved to download' },
        { status: 403 }
      );
    }

    // Check if link has expired
    if (requestData.download_link_expires_at) {
      const expiryDate = new Date(requestData.download_link_expires_at);
      if (new Date() > expiryDate) {
        return NextResponse.json(
          { error: 'Download link has expired' },
          { status: 403 }
        );
      }
    }

    // Get repo link from download_link or project github_repo_link
    const repoLink = requestData.download_link || projectData?.github_repo_link;

    if (!repoLink) {
      return NextResponse.json(
        { error: 'Repository link not found' },
        { status: 404 }
      );
    }

    // Generate GitHub ZIP download URL
    const zipDownloadUrl = generateGitHubZipUrl(repoLink);

    // Log the download
    try {
      await supabase
        .from('downloads')
        .insert({
          request_id: requestId,
          project_id: requestData.project_id,
          user_email: requestData.user_email,
          download_at: new Date().toISOString(),
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown',
        });
    } catch (logError) {
      console.error('[DOWNLOAD] Failed to log download:', logError);
      // Continue even if logging fails
    }

    // Update download count and last downloaded timestamp
    try {
      await supabase
        .from('project_requests')
        .update({
          downloads_count: (requestData.downloads_count || 0) + 1,
          last_downloaded_at: new Date().toISOString(),
        })
        .eq('id', requestId);
    } catch (updateError) {
      console.error('[DOWNLOAD] Failed to update download count:', updateError);
      // Continue even if update fails
    }

    // Redirect to GitHub ZIP download
    return NextResponse.redirect(zipDownloadUrl, {
      status: 302,
    });
  } catch (error: any) {
    console.error('[DOWNLOAD] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate download link' },
      { status: 500 }
    );
  }
}

function generateGitHubZipUrl(repoLink: string): string {
  try {
    // Extract owner and repo from various GitHub URL formats
    let owner = '';
    let repo = '';

    if (repoLink.includes('@github.com:')) {
      // SSH format: git@github.com:owner/repo.git
      const match = repoLink.match(/git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/);
      if (match) {
        owner = match[1];
        repo = match[2].replace(/\.git$/, '');
      }
    } else if (repoLink.includes('github.com')) {
      // HTTPS format: https://[token@]github.com/owner/repo[.git]
      const match = repoLink.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/);
      if (match) {
        owner = match[1];
        repo = match[2].replace(/\.git$/, '');
      }
    }

    if (!owner || !repo) {
      throw new Error('Invalid GitHub repository URL');
    }

    // Try main branch first, fallback to master
    // Return GitHub archive ZIP URL that works for public repos
    const mainZipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;
    const masterZipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/master.zip`;
    
    // If the original link has a token, we need to embed it
    if (repoLink.includes('@')) {
      const tokenMatch = repoLink.match(/https:\/\/([^@]+)@github\.com/);
      if (tokenMatch) {
        const token = tokenMatch[1];
        // For private repos with token, main branch is more likely
        return `https://${token}@github.com/${owner}/${repo}/archive/refs/heads/main.zip`;
      }
    }

    // For public repos, return main URL (GitHub will redirect if needed)
    // Users can always access: https://github.com/owner/repo/releases or /archive/master.zip if main doesn't exist
    console.log('[GITHUB_ZIP] Generated URL for:', owner, repo, mainZipUrl);
    return mainZipUrl;
  } catch (error) {
    console.error('[GITHUB_ZIP] Error generating URL:', error);
    throw new Error('Invalid repository link format');
  }
}
