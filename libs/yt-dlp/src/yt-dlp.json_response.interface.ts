// types are copied from here, https://github.com/microlinkhq/youtube-dl-exec/blob/master/src/index.d.ts
// seem correct but some are missing

export type IDumpSingleJson = {
  id: string;
  title: string;
  formats: Format[];
  thumbnails: Thumbnail[];
  thumbnail: string;
  description: string;
  channel_id: string;
  channel_url: string;
  duration: number;
  view_count: number;
  average_rating: null;
  age_limit: number;
  webpage_url: string;
  categories: string[];
  tags: string[];
  playable_in_embed: boolean;
  live_status: string;
  release_timestamp: null;
  _format_sort_fields: string[];
  automatic_captions: { [key: string]: AutomaticCaption[] };
  subtitles: any;
  comment_count: number | null;
  chapters: null;
  heatmap: Heatmap[] | null;
  channel: string;
  channel_follower_count: number;
  uploader: string;
  uploader_id: string;
  uploader_url: string;
  upload_date: string;
  availability: string;
  original_url: string;
  webpage_url_basename: string;
  webpage_url_domain: string;
  extractor: string;
  extractor_key: string;
  playlist: null;
  playlist_index: null;
  display_id: string;
  fulltitle: string;
  duration_string: string;
  is_live: boolean;
  was_live: boolean;
  requested_subtitles: null;
  _has_drm: null;
  epoch: number;
  requested_downloads: RequestedDownload[];
  requested_formats: Format[];
  format: string;
  format_id: string;
  ext: AudioEXTEnum;
  protocol: string;
  language: Language | null;
  format_note: string;
  filesize_approx: number;
  tbr: number;
  width: number;
  height: number;
  resolution: string;
  fps: number;
  dynamic_range: DynamicRange;
  vcodec: string;
  vbr: number;
  stretched_ratio: null;
  aspect_ratio: number;
  acodec: Acodec;
  abr: number;
  asr: number;
  audio_channels: number;
  _type: string;
  _version: Version;
  channel_is_verified?: boolean;
};

export type Version = {
  version: string;
  current_git_head: null;
  release_git_head: string;
  repository: string;
};

export enum Acodec {
  Mp4A402 = 'mp4a.40.2',
  Mp4A405 = 'mp4a.40.5',
  None = 'none',
  Opus = 'opus',
}

export type AutomaticCaption = {
  ext: AutomaticCaptionEXT;
  url: string;
  name: string;
};

export enum AutomaticCaptionEXT {
  Json3 = 'json3',
  Srv1 = 'srv1',
  Srv2 = 'srv2',
  Srv3 = 'srv3',
  Ttml = 'ttml',
  Vtt = 'vtt',
}

export enum DynamicRange {
  SDR = 'SDR',
}

export enum AudioEXTEnum {
  M4A = 'm4a',
  Mhtml = 'mhtml',
  Mp4 = 'mp4',
  None = 'none',
  The3Gp = '3gp',
  Webm = 'webm',
}

export type Format = {
  format_id: string;
  format_note?: FormatNote;
  ext: AudioEXTEnum;
  protocol: Protocol;
  acodec?: Acodec;
  vcodec: string;
  url: string;
  width?: number | null;
  height?: number | null;
  fps?: number | null;
  rows?: number;
  columns?: number;
  fragments?: Fragment[];
  resolution: string;
  aspect_ratio: number | null;
  http_headers: HTTPHeaders;
  audio_ext: AudioEXTEnum;
  video_ext: AudioEXTEnum;
  vbr: number | null;
  abr: number | null;
  tbr: number | null;
  format: string;
  format_index?: null;
  manifest_url?: string;
  language?: Language | null;
  preference?: number | null;
  quality?: number;
  has_drm?: boolean;
  source_preference?: number;
  asr?: number | null;
  filesize?: number | null;
  audio_channels?: number | null;
  language_preference?: number;
  dynamic_range?: DynamicRange | null;
  container?: Container;
  downloader_options?: DownloaderOptions;
  filesize_approx?: number;
};

export enum Container {
  M4ADash = 'm4a_dash',
  Mp4Dash = 'mp4_dash',
  WebmDash = 'webm_dash',
}

export type DownloaderOptions = Record<string, string | number>;

export enum FormatNote {
  Default = 'Default',
  Low = 'low',
  Medium = 'medium',
  Premium = 'Premium',
  Storyboard = 'storyboard',
  The1080P = '1080p',
  The144P = '144p',
  The240P = '240p',
  The360P = '360p',
  The480P = '480p',
  The720P = '720p',
  Ultralow = 'ultralow',
}

export type Fragment = {
  url: string;
  duration: number;
};

export type HTTPHeaders = Record<string, string | number>;

export type Language = `${string}${string}`;

export enum Protocol {
  HTTPS = 'https',
  M3U8Native = 'm3u8_native',
  Mhtml = 'mhtml',
}

export type Heatmap = {
  start_time: number;
  end_time: number;
  value: number;
};

export type RequestedDownload = {
  requested_formats: Format[];
  format: string;
  format_id: string;
  ext: AudioEXTEnum;
  protocol: string;
  format_note: string;
  filesize_approx: number;
  tbr: number;
  width: number;
  height: number;
  resolution: string;
  fps: number;
  dynamic_range: DynamicRange;
  vcodec: string;
  vbr: number;
  aspect_ratio: number;
  acodec: Acodec;
  abr: number;
  asr: number;
  audio_channels: number;
  _filename: string;
  filename: string;
  __write_download_archive: boolean;
  language?: Language;
};

export type Thumbnail = {
  url: string;
  preference: number;
  id: string;
  height?: number;
  width?: number;
  resolution?: string;
};
