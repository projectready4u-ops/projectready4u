// Database types
export interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  abstract: string;
  synopsis: string;
  price: number;
  discounted_price: number;
  video_url: string;
  github_repo_link: string;
  thumbnail_url: string;
  includes_source: boolean;
  includes_report: boolean;
  includes_ppt: boolean;
  includes_synopsis: boolean;
  includes_viva: boolean;
  includes_readme: boolean;
  created_at: string;
}

export interface Request {
  id: string;
  project_id: string;
  project_title: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp_number: string;
  college: string;
  city: string;
  state: string;
  traffic_source: 'youtube' | 'google' | 'whatsapp' | 'friend' | 'other';
  utm_source?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  access_link?: string;
  requested_at: string;
  approved_at?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  videoId: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  created_at: string;
}

export interface StatsData {
  totalProjects: number;
  totalRequests: number;
  pendingRequests: number;
  approvedThisMonth: number;
  youtubeTraffic: number;
}

export interface RequestsPerDayData {
  date: string;
  count: number;
}

export interface CityRequestsData {
  city: string;
  count: number;
}

export interface TrafficSourceData {
  name: string;
  value: number;
}
