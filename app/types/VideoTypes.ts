// VideoTypes.ts - Type definitions for the video player components

export interface VideoItem {
  id: string;
  uri: string;
  title: string;
  duration: number;
  creationTime: number;
  thumbnail?: string; // Optional thumbnail URI for displaying video preview
}

// Additional types for VideoLibrary component
export interface VideoLibraryProps {
  onSelectVideo: (video: VideoItem) => void;
  selectedVideoId?: string | null;
}

export type VideoViewMode = "grid" | "list";

export interface VideoLibraryState {
  videos: VideoItem[];
  isLoading: boolean;
  refreshing: boolean;
  hasNextPage: boolean;
  endCursor?: string;
  viewMode: VideoViewMode;
  albumTitle: string;
}
