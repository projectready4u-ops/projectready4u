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
      return NextResponse.json({
        success: false,
        error: 'Request ID is required',
        step: 'validation',
      });
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
      return NextResponse.json({
        success: false,
        error: 'Request not found in database',
        step: 'request_fetch',
        details: fetchError?.message,
      });
    }

    // Check if request is approved
    if (requestData.status !== 'approved') {
      return NextResponse.json({
        success: false,
        error: `Request status is "${requestData.status}", must be "approved"`,
        step: 'status_check',
        currentStatus: requestData.status,
      });
    }

    // Check if link has expired
    if (requestData.download_link_expires_at) {
      const expiryDate = new Date(requestData.download_link_expires_at);
      if (new Date() > expiryDate) {
        return NextResponse.json({
          success: false,
          error: 'Download link has expired',
          step: 'expiry_check',
          expiryDate: expiryDate.toISOString(),
        });
      }
    }

    // Fetch the project separately to get the repo link
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('id, title, github_repo_link')
      .eq('id', requestData.project_id)
      .single();

    if (projectError || !projectData) {
      return NextResponse.json({
        success: false,
        error: 'Project not found',
        step: 'project_fetch',
        details: projectError?.message,
      });
    }

    // Get repo link from download_link or project github_repo_link
    const repoLink = requestData.download_link || projectData?.github_repo_link;

    if (!repoLink) {
      return NextResponse.json({
        success: false,
        error: 'No repository link found. Please configure github_repo_link in the project settings.',
        step: 'repo_link_check',
        projectDownloadLink: requestData.download_link,
        projectGithubLink: projectData?.github_repo_link,
      });
    }

    // Generate GitHub ZIP download URL
    const zipDownloadUrl = generateGitHubZipUrl(repoLink);

    return NextResponse.json({
      success: true,
      error: null,
      step: 'success',
      requestId,
      requestStatus: requestData.status,
      projectTitle: projectData.title,
      repoLink,
      downloadUrl: zipDownloadUrl,
      downloadsCount: requestData.downloads_count || 0,
      expiryDate: requestData.download_link_expires_at,
    });
  } catch (error: any) {
    console.error('[DOWNLOAD_TEST] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate download link',
      step: 'error',
      details: error.stack,
    });
  }
}

function generateGitHubZipUrl(repoLink: string): string {
  try {
    // Extract owner and repo from various GitHub URL formats
    let owner = '';
    let repo = '';
    let token = '';

    if (repoLink.includes('@github.com:')) {
      // SSH format: git@github.com:owner/repo.git
      const match = repoLink.match(/git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/);
      if (match) {
        owner = match[1];
        repo = match[2].replace(/\.git$/, '');
      }
    } else if (repoLink.includes('github.com')) {
      // HTTPS format: https://[token@]github.com/owner/repo[.git]
      // Extract token first
      const tokenMatch = repoLink.match(/https:\/\/([^@]+)@github\.com/);
      if (tokenMatch) {
        token = tokenMatch[1];
      }

      const match = repoLink.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/);
      if (match) {
        owner = match[1];
        repo = match[2].replace(/\.git$/, '');
      }
    }

    if (!owner || !repo) {
      throw new Error(`Invalid GitHub repository URL: ${repoLink}`);
    }

    // Return GitHub archive ZIP URL
    const baseZipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;

    // If there's a token, embed it in the URL
    if (token) {
      return `https://${token}@github.com/${owner}/${repo}/archive/refs/heads/main.zip`;
    }

    return baseZipUrl;
  } catch (error) {
    console.error('[GITHUB_ZIP] Error generating URL:', error);
    throw new Error(`Invalid repository link format: ${repoLink}`);
  }
}
