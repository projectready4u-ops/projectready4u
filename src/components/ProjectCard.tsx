'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types';
import { formatPrice, getYouTubeThumbnail, getYouTubeVideoId } from '@/lib/utils';
import { Play } from 'lucide-react';
import { VideoModal } from './VideoModal';
import { useState } from 'react';

interface ProjectCardProps {
  project: Project;
  showDemo?: boolean;
  featured?: boolean;
}

export function ProjectCard({ project, showDemo = true, featured = false }: ProjectCardProps) {
  const [showVideo, setShowVideo] = useState(false);
  const videoId = getYouTubeVideoId(project.video_url);
  const thumbnail = getYouTubeThumbnail(videoId);
  
  // Check if thumbnail_url is a valid image URL (not a YouTube URL)
  const isValidImageUrl = project.thumbnail_url && 
    !project.thumbnail_url.includes('youtu') &&
    !project.thumbnail_url.includes('youtube') &&
    project.thumbnail_url.trim().length > 0;
  
  const imageUrl = isValidImageUrl ? project.thumbnail_url : (videoId ? thumbnail : '');
  
  const price = Number(project.price) || 0;
  const discountedPrice = Number(project.discounted_price) || price;
  const discount = price > 0 ? Math.round(((price - discountedPrice) / price) * 100) : 0;

  const includes = [
    project.includes_source && 'Source Code ✅',
    project.includes_report && 'Report ✅',
    project.includes_ppt && 'PPT ✅',
    project.includes_synopsis && 'Synopsis ✅',
    project.includes_viva && 'Viva ✅',
    project.includes_readme && 'README ✅',
  ].filter((item): item is string => Boolean(item));

  return (
    <>
      <Card className="group overflow-hidden border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-300">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-gradient-to-b from-white/10 to-white/5 aspect-video">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={project.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
              <div className="text-4xl opacity-50">🎓</div>
            </div>
          )}

          {/* Overlay with Demo Button */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            {showDemo && (
              <Button
                onClick={() => setShowVideo(true)}
                size="sm"
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Demo
              </Button>
            )}
          </div>

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
              -{discount}%
            </div>
          )}

          {/* Category Badge */}
          <Badge className="absolute top-3 left-3 bg-violet-600 hover:bg-violet-700">
            {project.category}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-white line-clamp-2 mb-2 group-hover:text-violet-400 transition-colors">
            {project.title}
          </h3>

          <p className="text-gray-400 text-sm line-clamp-2 mb-3">
            {project.description}
          </p>

          {/* Pricing */}
          <div className="space-y-2 mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-emerald-400">
                {formatPrice(discountedPrice)}
              </span>
              {discount > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(price)}
                </span>
              )}
            </div>
            
            {discount > 0 && (
              <div className="text-xs text-amber-300 font-semibold">
                You save {formatPrice(price - discountedPrice)}
              </div>
            )}
            
            <div className="text-xs text-gray-400">
              Original: {formatPrice(price)}
            </div>
          </div>

          {/* Includes Badges */}
          {includes.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {includes.slice(0, 2).map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="text-xs bg-white/5 text-gray-300"
                >
                  {item}
                </Badge>
              ))}
              {includes.length > 2 && (
                <Badge variant="secondary" className="text-xs bg-white/5 text-gray-400">
                  +{includes.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Link href={`/projects/${project.slug}`} className="flex-1">
              <button
                className="w-full px-4 py-2 rounded-md font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all"
              >
                View Details
              </button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Video Modal */}
      {showVideo && (
        <VideoModal
          videoId={videoId}
          title={project.title}
          onClose={() => setShowVideo(false)}
        />
      )}
    </>
  );
}
