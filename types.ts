
export type MediaType = 'image' | 'animated-video' | 'cinematic-video';

export type Style = 'Cinematic Realism' | 'Anime' | 'Photorealistic' | 'Fantasy Art' | 'Cyberpunk';

export interface Output {
  type: 'image' | 'video';
  description: string;
  caption: string;
  url: string;
}
