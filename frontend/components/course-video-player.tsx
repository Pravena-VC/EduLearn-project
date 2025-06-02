import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CourseVideoPlayerProps {
  videoUrl?: string | null;
  title: string;
  poster?: string;
  onComplete?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  nextLessonId?: number;
  prevLessonId?: number;
  isAccessRestricted?: boolean;
  applicationStatus?: string;
}

export default function CourseVideoPlayer({
  videoUrl,
  title,
  poster,
  onComplete,
  onNext,
  onPrevious,
  nextLessonId,
  prevLessonId,
  isAccessRestricted = false,
  applicationStatus,
}: CourseVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasEnded, setHasEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Reset state when video changes
    setIsPlaying(false);
    setProgress(0);
    setHasEnded(false);
    setCurrentTime(0);
    setDuration(0);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, [videoUrl]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);

      // Mark as completed if near end (95%)
      if (
        onComplete &&
        currentProgress > 95 &&
        !hasEnded &&
        videoRef.current.currentTime > 5 // Ensure it's not just the start
      ) {
        setHasEnded(true);
        onComplete();
      }
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setHasEnded(true);
    if (onComplete) {
      onComplete();
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (isAccessRestricted) {
    return (
      <Card className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-auto">
          <Info className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-bold mb-2">Application In Progress</h3>
          <p className="text-muted-foreground mb-4">
            Thanks for applying to "{title}"! Your application is currently{" "}
            <span className="font-medium text-primary">
              {applicationStatus}
            </span>
            .
          </p>
          <p className="text-muted-foreground mb-6">
            While you wait for approval, you can:
          </p>
          <ul className="text-left list-disc list-inside mb-6">
            <li className="mb-2">
              Browse the course outline to get familiar with the curriculum
            </li>
            <li className="mb-2">
              Check out free preview lessons if available
            </li>
            <li className="mb-2">Prepare your learning environment</li>
            <li>Explore related topics in our free resources section</li>
          </ul>
          <p className="text-sm text-muted-foreground mb-6">
            Full course content will be unlocked once your application is
            approved. We'll notify you by email!
          </p>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={!prevLessonId}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous Lesson
            </Button>
            <Button onClick={onNext} disabled={!nextLessonId}>
              Next Lesson
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!videoUrl) {
    return (
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium">Video Unavailable</h3>
          <p className="text-sm text-muted-foreground mt-1">
            This lesson doesn't have a video.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        src={videoUrl}
        poster={poster}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
        onLoadedMetadata={handleLoadedMetadata}
        controls
      />

      {/* Navigation Controls */}
      <div className="absolute top-0 left-0 right-0 p-3 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!prevLessonId}
          className="bg-black/50 text-white border-none hover:bg-black/70"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!nextLessonId}
          className="bg-black/50 text-white border-none hover:bg-black/70"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
