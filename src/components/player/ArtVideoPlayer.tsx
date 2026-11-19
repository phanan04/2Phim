import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Hls from 'hls.js';
import { EpisodeData, EpisodeServer } from '../../types/movie';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  SkipForward,
  Radio,
  Sparkles,
  Sliders,
  Gauge,
  Maximize,
  Minimize,
  Lightbulb,
  Check,
  X,
  RefreshCw,
  ChevronRight,
  PictureInPicture2,
  Settings as SettingsIcon,
  Palette,
  Type,
  FastForward,
  Layers,
  ArrowLeft,
} from 'lucide-react';

interface ArtVideoPlayerProps {
  m3u8Url?: string;
  embedUrl?: string;
  poster?: string;
  movieName: string;
  episodeName: string;
  episodes: EpisodeServer[];
  currentServerIndex: number;
  currentEpisodeSlug: string;
  currentChannel: number; // 0 = HLS, 1 = Embed
  onSelectEpisode: (serverIndex: number, episode: EpisodeData) => void;
  onChannelChange: (channel: number) => void;
  onNextEpisode?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  initialTime?: number;
}

export const ArtVideoPlayer: React.FC<ArtVideoPlayerProps> = ({
  m3u8Url,
  embedUrl,
  poster,
  movieName,
  episodeName,
  episodes,
  currentServerIndex,
  currentEpisodeSlug,
  currentChannel,
  onSelectEpisode,
  onChannelChange,
  onNextEpisode,
  onEnded,
  onTimeUpdate,
  initialTime = 0,
}) => {
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<any>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false); // Loading spinner on seek/buffer
  const [playError, setPlayError] = useState<string | null>(null);
  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    onEndedRef.current = onEnded;
  });
  const isEmbed = currentChannel === 1;
  const [retryKey, setRetryKey] = useState(0);

  // Responsive mobile state (< 640px) and touch/compact device state
  const [isMobile, setIsMobile] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const isCoarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
      const isSmall = typeof window !== 'undefined' && (window.innerWidth < 768 || window.innerHeight < 550);
      setIsMobile(window.innerWidth < 640);
      setIsTouchDevice(isCoarse || isSmall);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  // Khóa cuộn trang nền khi player ở chế độ toàn màn hình trên điện thoại
  useEffect(() => {
    if (isFullscreen && isMobile) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isFullscreen, isMobile]);

  // Popups state (Image 2, 3, 4 + Image 3 Episode Drawer)
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'main' | 'quality' | 'speed'>('main');
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);

  // Mobile double tap animation
  const [seekRipple, setSeekRipple] = useState<{ side: 'left' | 'right'; id: number } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });

  // Hover seeking preview
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);

  // Subtitle custom preferences (Live Interactive CC)
  const [subtitleMode, setSubtitleMode] = useState<'on' | 'bilingual' | 'off'>('off');
  const [subLang1, setSubLang1] = useState('Tiếng Việt');
  const [subLang2, setSubLang2] = useState('Tiếng Trung');
  const [subCustomTab, setSubCustomTab] = useState<'main' | 'bilingual'>('main');
  const [subtitleColor, setSubtitleColor] = useState('#FFFFFF');
  const [subtitleFont, setSubtitleFont] = useState('Mặc định');
  const [subtitleSize, setSubtitleSize] = useState(24);
  const [subtitleBg, setSubtitleBg] = useState<'none' | 'trans' | 'navy' | 'black'>('none');
  const [subtitlePosition, setSubtitlePosition] = useState(14); // % from bottom

  // Settings preferences (Live Interactive)
  const [quality, setQuality] = useState('Tự động (Auto)');
  const [availableQualities, setAvailableQualities] = useState<string[]>(['Tự động (Auto)', '1080p Full HD', '720p HD']);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [is2xSpeedActive, setIs2xSpeedActive] = useState(false);
  const longPress2xTimeoutRef = useRef<any>(null);
  const is2xTriggeredRef = useRef(false);
  const touchStartPosRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const previousSpeedRef = useRef(1.0);
  const [aspectRatio, setAspectRatio] = useState<'contain' | '16:9' | 'cover'>('contain');
  const [ambientLight, setAmbientLight] = useState(false);
  const [autoSkipIntro, setAutoSkipIntro] = useState(false);
  const autoSkipIntroRef = useRef(autoSkipIntro);

  useEffect(() => {
    autoSkipIntroRef.current = autoSkipIntro;
  }, [autoSkipIntro]);

  const getActiveSubtitle = () => {
    // Check native browser text tracks first if present from stream
    const video = videoRef.current;
    if (video && video.textTracks && video.textTracks.length > 0) {
      for (let i = 0; i < video.textTracks.length; i++) {
        const track = video.textTracks[i];
        if (track.mode === 'showing' && track.activeCues && track.activeCues.length > 0) {
          const cue = track.activeCues[0] as VTTCue;
          if (cue && cue.text) {
            return { primary: cue.text, secondary: '' };
          }
        }
      }
    }
    return { primary: '', secondary: '' };
  };

  const activeSubtitle = getActiveSubtitle();

  const currentServer = episodes[currentServerIndex] || episodes[0];
  const episodeList = currentServer?.server_data || [];

  // Audio track badge
  const currentAudioBadge = (() => {
    const sName = currentServer?.server_name || '';
    if (/lồng\s*tiếng/i.test(sName)) return 'Lồng';
    if (/thuyết\s*minh/i.test(sName)) return 'Thuyết';
    if (/song\s*ngữ/i.test(sName)) return 'Song';
    if (/vietsub|phụ\s*đề/i.test(sName)) return 'Sub';
    if (/nguồn\s*c/i.test(sName)) return 'NC';
    return 'Sub';
  })();

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    const pad = (n: number) => (n < 10 ? '0' + n : String(n));
    if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
    return `${pad(m)}:${pad(s)}`;
  };

  // Thoát toàn màn hình và neo chuẩn vị trí đầu player, chống hiện tượng nhảy trang xuống dưới
  const exitFullscreenToPlayer = useCallback(() => {
    setIsFullscreen(false);
    document.body.classList.remove('player-fullscreen-active');
    document.body.style.overflow = '';

    // 1. Huỷ focus trên nút vừa bấm để tránh trình duyệt mobile tự động cuộn trang theo vị trí nút
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // 2. Chống nhảy trang: Neo chính xác đầu trình phát video ở tầm mắt trên nhiều chu kỳ render
    const pinScroll = () => {
      const isLandscape = typeof window !== 'undefined' && window.innerWidth > window.innerHeight;
      if (isLandscape) {
        window.scrollTo({ top: 0, behavior: 'instant' as any });
      } else if (playerWrapperRef.current) {
        playerWrapperRef.current.scrollIntoView({ behavior: 'instant' as any, block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' as any });
      }
    };

    pinScroll();
    requestAnimationFrame(pinScroll);
    setTimeout(pinScroll, 80);
    setTimeout(pinScroll, 200);
    setTimeout(pinScroll, 350);
  }, []);

  // Yêu cầu toàn màn hình chuẩn OS (ẩn thanh địa chỉ URL bar, thanh trạng thái và thanh điều hướng hệ thống)
  const requestNativeFullscreen = async () => {
    const wrapper = playerWrapperRef.current;
    const video = videoRef.current;
    if (!wrapper) return;

    try {
      if (wrapper.requestFullscreen) {
        await wrapper.requestFullscreen({ navigationUI: 'hide' } as any);
      } else if ((wrapper as any).webkitRequestFullscreen) {
        await (wrapper as any).webkitRequestFullscreen();
      } else if ((wrapper as any).mozRequestFullScreen) {
        await (wrapper as any).mozRequestFullScreen();
      } else if ((wrapper as any).msRequestFullscreen) {
        await (wrapper as any).msRequestFullscreen();
      } else if ((video as any)?.webkitEnterFullscreen) {
        // Fallback riêng cho iPhone Safari iOS (Apple không hỗ trợ requestFullscreen trên thẻ div)
        (video as any).webkitEnterFullscreen();
      }
    } catch (err) {
      console.warn('Native requestFullscreen prevented:', err);
    }
  };

  // Thoát toàn màn hình chuẩn OS
  const exitNativeFullscreen = async () => {
    const video = videoRef.current;
    const isDocFs = Boolean(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    if (isDocFs) {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      } catch (e) {}
    }

    if ((video as any)?.webkitDisplayingFullscreen) {
      try {
        (video as any).webkitExitFullscreen?.();
      } catch (e) {}
    }
  };

  // Fullscreen handlers (Hỗ trợ toàn màn hình hẳn trên cả điện thoại và máy tính)
  const toggleFullscreen = async () => {
    const isDocFs = Boolean(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    if (isDocFs || isFullscreen) {
      exitFullscreenToPlayer();
      await exitNativeFullscreen();
      return;
    }

    // 1. Kích hoạt Web-Fullscreen giao diện tràn viền
    setIsFullscreen(true);
    document.body.classList.add('player-fullscreen-active');

    // 2. Hỗ trợ nút Back / cử chỉ vuốt quay lại trên điện thoại
    if (isTouchDevice && typeof window !== 'undefined') {
      try {
        window.history.pushState({ playerFullscreen: true }, '');
      } catch (e) {}
    }

    // 3. Kích hoạt Toàn màn hình hẳn của hệ điều hành (Native OS Fullscreen ẩn URL bar & thanh điều hướng)
    await requestNativeFullscreen();
  };

  // Lắng nghe cử chỉ vuốt quay lại (Back gesture) hoặc nút Back trên điện thoại để thoát toàn màn hình
  useEffect(() => {
    const handlePopState = () => {
      if (isFullscreen) {
        exitFullscreenToPlayer();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isFullscreen, exitFullscreenToPlayer]);

  // Khi người dùng xoay ngang/dọc điện thoại (orientationchange): Giữ video player luôn ở đầu màn hình
  useEffect(() => {
    const handleOrientationChange = () => {
      if (!isFullscreen) {
        const pinScroll = () => {
          if (typeof window !== 'undefined' && window.innerWidth > window.innerHeight) {
            window.scrollTo({ top: 0, behavior: 'instant' as any });
          } else if (playerWrapperRef.current) {
            playerWrapperRef.current.scrollIntoView({ behavior: 'instant' as any, block: 'start' });
          } else {
            window.scrollTo({ top: 0, behavior: 'instant' as any });
          }
        };
        pinScroll();
        setTimeout(pinScroll, 60);
        setTimeout(pinScroll, 200);
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, [isFullscreen]);

  // Mini Player / Picture-in-Picture (PiP)
  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (video.requestPictureInPicture) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP not supported or error:', err);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      const isDocFs = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      if (isDocFs) {
        setIsFullscreen(true);
        document.body.classList.add('player-fullscreen-active');
      } else {
        exitFullscreenToPlayer();
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    document.addEventListener('MSFullscreenChange', onFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      document.removeEventListener('mozfullscreenchange', onFullscreenChange);
      document.removeEventListener('MSFullscreenChange', onFullscreenChange);
      document.body.classList.remove('player-fullscreen-active');
    };
  }, [exitFullscreenToPlayer]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add('player-fullscreen-active');
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.classList.remove('player-fullscreen-active');
        document.body.style.overflow = prevOverflow;
      };
    } else {
      document.body.classList.remove('player-fullscreen-active');
    }
  }, [isFullscreen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnterPiP = () => setIsPiP(true);
    const onLeavePiP = () => setIsPiP(false);
    video.addEventListener('enterpictureinpicture', onEnterPiP);
    video.addEventListener('leavepictureinpicture', onLeavePiP);
    return () => {
      video.removeEventListener('enterpictureinpicture', onEnterPiP);
      video.removeEventListener('leavepictureinpicture', onLeavePiP);
    };
  }, []);

  // Controls auto-hide timer (Chuẩn YouTube: Chạm một lần ẩn/hiện kể cả khi tạm dừng hoặc đang phát)
  const isControlsBarVisible =
    !isEmbed &&
    !is2xSpeedActive &&
    (controlsVisible || showServerMenu || showSettingsMenu || showSubtitleMenu || showEpisodeDrawer);

  const resetControlsTimer = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (
      isPlaying &&
      !showServerMenu &&
      !showSettingsMenu &&
      !showSubtitleMenu &&
      !showEpisodeDrawer
    ) {
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3500);
    }
  }, [isPlaying, showServerMenu, showSettingsMenu, showSubtitleMenu, showEpisodeDrawer]);

  const handleMouseMove = () => {
    // Không chạy trên thiết bị cảm ứng để tránh chuột ảo ghi đè
    if (isMobile || (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches)) {
      return;
    }
    resetControlsTimer();
  };

  // Close floating popups when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('.player-floating-panel') &&
        !target.closest('.player-toggle-btn') &&
        !target.closest('.player-mobile-sheet')
      ) {
        setShowServerMenu(false);
        setShowSettingsMenu(false);
        setShowSubtitleMenu(false);
        setShowEpisodeDrawer(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Handle video element time updates
  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    setDuration(v.duration || 0);
    onTimeUpdate?.(v.currentTime, v.duration || 0);

    // Auto skip intro if enabled via Settings
    if (autoSkipIntroRef.current && v.currentTime >= 10 && v.currentTime <= 85) {
      v.currentTime = 90;
    }

    // Buffered calculation
    if (v.buffered.length > 0) {
      setBufferedTime(v.buffered.end(v.buffered.length - 1));
    }
  };

  // Initialize Hls.js for Channel 0 directly onto videoRef (Native HTML5 Video Engine)
  useEffect(() => {
    setPlayError(null);
    setIsBuffering(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    if (currentChannel === 0 && !m3u8Url && embedUrl) {
      onChannelChange(1);
      return;
    }

    if (currentChannel !== 0 || !m3u8Url) return;
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });
      hls.loadSource(m3u8Url);
      hls.attachMedia(video);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        if (initialTime > 0) video.currentTime = initialTime;
        if (data.levels && data.levels.length > 0) {
          const qList = ['Tự động (Auto)', ...data.levels.map((l: any) => `${l.height}p`)];
          setAvailableQualities(qList);
        }
        video.play().catch(() => {});
      });

      let mediaRetry = 0;
      let netRetry = 0;
      hls.on(Hls.Events.ERROR, (_, data) => {
        console.warn('HLS error:', data.type, data.details, data.response?.code, m3u8Url);
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR && mediaRetry < 2) {
          mediaRetry++;
          hls.recoverMediaError();
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && netRetry < 1) {
          netRetry++;
          hls.startLoad();
          return;
        }
        hls.destroy();
        if (embedUrl) {
          onChannelChange(1);
        } else {
          setPlayError(`Không tải được luồng HLS (${data.details})`);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = m3u8Url;
      if (initialTime > 0) video.currentTime = initialTime;
      video.play().catch(() => {});
    } else if (embedUrl) {
      onChannelChange(1);
    } else {
      setPlayError('Trình duyệt không hỗ trợ phát HLS');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [m3u8Url, currentChannel, currentServerIndex, retryKey]);

  // Sync playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Sync aspect ratio
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      if (aspectRatio === '16:9') {
        video.style.objectFit = 'fill';
      } else if (aspectRatio === 'cover') {
        video.style.objectFit = 'cover';
      } else {
        video.style.objectFit = 'contain';
      }
    }
  }, [aspectRatio]);

  // Play / Pause toggle
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  // Seek relative
  const seekRelative = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    const newTime = Math.max(0, Math.min(v.duration || duration, v.currentTime + delta));
    v.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // YouTube-Style Mobile Single-Tap Toggle & Double-Tap Seek Controller
  const tapTimeoutRef = useRef<any>(null);
  const lastTouchTimeRef = useRef<number>(0);

  const handleVideoTapToggle = (clientX: number, targetRect: DOMRect) => {
    const now = Date.now();
    const xPos = clientX - targetRect.left;
    const width = targetRect.width;

    const timeDiff = now - lastTapRef.current.time;
    const distDiff = Math.abs(xPos - lastTapRef.current.x);

    // Double tap detected (within 280ms) -> Tua nhanh +10s hoặc -10s
    if (timeDiff < 280 && distDiff < 90) {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      lastTapRef.current = { time: 0, x: 0 };

      if (xPos > width * 0.58) {
        seekRelative(10);
        setSeekRipple({ side: 'right', id: now });
        setTimeout(() => setSeekRipple(null), 700);
      } else if (xPos < width * 0.42) {
        seekRelative(-10);
        setSeekRipple({ side: 'left', id: now });
        setTimeout(() => setSeekRipple(null), 700);
      }
      return;
    }

    // Record first tap
    lastTapRef.current = { time: now, x: xPos };

    // Chờ 280ms để xác định là single tap (Chuẩn YouTube: ấn một lần hiện, ấn lần nữa tắt)
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = setTimeout(() => {
      setControlsVisible((prev) => {
        const next = !prev;
        if (next) {
          // Bật điều khiển -> Hẹn giờ 3.5s tự ẩn nếu video đang chạy
          if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
          if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
              setControlsVisible(false);
            }, 3500);
          }
        } else {
          // Tắt điều khiển ngay lập tức -> Hủy hẹn giờ & đóng các menu popup
          if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
          setShowServerMenu(false);
          setShowSettingsMenu(false);
          setShowSubtitleMenu(false);
          setShowEpisodeDrawer(false);
        }
        return next;
      });
    }, 280);
  };

  // Kích hoạt tốc độ tua 2x khi ấn giữ bên phải màn hình (Chuẩn YouTube)
  const start2xSpeed = useCallback(() => {
    if (!videoRef.current) return;
    is2xTriggeredRef.current = true;
    previousSpeedRef.current = videoRef.current.playbackRate || playbackSpeed || 1.0;
    videoRef.current.playbackRate = 2.0;
    setIs2xSpeedActive(true);
    setControlsVisible(false);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(35);
      } catch (e) {}
    }
  }, [playbackSpeed]);

  // Dừng tốc độ tua 2x khi thả tay/nhấc chuột
  const stop2xSpeed = useCallback(() => {
    if (longPress2xTimeoutRef.current) {
      clearTimeout(longPress2xTimeoutRef.current);
      longPress2xTimeoutRef.current = null;
    }
    if (is2xTriggeredRef.current) {
      is2xTriggeredRef.current = false;
      setIs2xSpeedActive(false);
      if (videoRef.current) {
        videoRef.current.playbackRate = previousSpeedRef.current || playbackSpeed || 1.0;
      }
      lastTouchTimeRef.current = Date.now();
      return true; // Đã tua 2x, ngăn chặn tap toggle
    }
    return false;
  }, [playbackSpeed]);

  const handleVideoTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    is2xTriggeredRef.current = false;

    // Chuẩn YouTube: Ấn giữ ở nửa bên phải màn hình (x > rect.width * 0.48) sẽ kích hoạt tua 2x
    if (x > rect.width * 0.48) {
      if (longPress2xTimeoutRef.current) clearTimeout(longPress2xTimeoutRef.current);
      longPress2xTimeoutRef.current = setTimeout(() => {
        start2xSpeed();
      }, 350);
    }
  };

  const handleVideoTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch || !touchStartPosRef.current) return;
    const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);

    // Nếu người dùng lướt ngón tay quá 20px trước khi 2x kích hoạt (thao tác cuộn trang)
    if (!is2xTriggeredRef.current && (dx > 20 || dy > 20)) {
      if (longPress2xTimeoutRef.current) {
        clearTimeout(longPress2xTimeoutRef.current);
        longPress2xTimeoutRef.current = null;
      }
    }
  };

  const handleVideoTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const was2x = stop2xSpeed();
    if (was2x) return; // Vừa thả tay sau khi tua 2x -> không toggle ẩn/hiện controls

    const touch = e.changedTouches[0];
    if (!touch) return;
    lastTouchTimeRef.current = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    handleVideoTapToggle(touch.clientX, rect);
  };

  const handleVideoTouchCancel = () => {
    stop2xSpeed();
  };

  // Hỗ trợ chuột trên Desktop & Giả lập Mobile DevTools: Nhấn giữ chuột bên phải để tua 2x
  const handleVideoMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (Date.now() - lastTouchTimeRef.current < 450) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x > rect.width * 0.48) {
      if (longPress2xTimeoutRef.current) clearTimeout(longPress2xTimeoutRef.current);
      longPress2xTimeoutRef.current = setTimeout(() => {
        start2xSpeed();
      }, 350);
    }
  };

  const handleVideoMouseUp = () => {
    stop2xSpeed();
  };

  const handleVideoMouseLeave = () => {
    stop2xSpeed();
  };

  const handleVideoBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Tránh click giả lập từ touch trên thiết bị di động
    if (Date.now() - lastTouchTimeRef.current < 450) {
      return;
    }
    // Nếu vừa tua 2x bằng chuột, không toggle play/pause
    if (is2xTriggeredRef.current) {
      return;
    }
    // Thiết bị cảm ứng
    if (isMobile || (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches)) {
      const rect = e.currentTarget.getBoundingClientRect();
      handleVideoTapToggle(e.clientX, rect);
      return;
    }
    // Desktop: Click vào màn hình video để phát/tạm dừng
    togglePlay();
  };

  // Progress bar scrub handlers (Hỗ trợ cả chuột và cảm ứng kéo vuốt)
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!progressBarRef.current || !v || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = pos * duration;
    v.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!progressBarRef.current || !v || duration <= 0) return;
    const touch = e.touches[0] || e.changedTouches[0];
    if (!touch) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
    const newTime = pos * duration;
    v.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  const handleProgressMouseLeave = () => {
    setHoverTime(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekRelative(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekRelative(10);
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyW':
        case 'KeyP':
          e.preventDefault();
          togglePiP();
          break;
        case 'KeyM':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
          }
          break;
        case 'Escape':
          setShowServerMenu(false);
          setShowSettingsMenu(false);
          setShowSubtitleMenu(false);
          setShowEpisodeDrawer(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime, duration]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (bufferedTime / duration) * 100 : 0;

  // Show Skip Intro button between 10s and 90s
  const showSkipIntro = currentTime >= 10 && currentTime <= 90 && !autoSkipIntro;

  // Helper to render mobile bottom sheet drawer (immune to player container clipping)
  const renderMobileBottomSheet = (
    isOpen: boolean,
    onClose: () => void,
    title: string,
    children: React.ReactNode,
    headerRight?: React.ReactNode
  ) => {
    if (!isOpen || !isTouchDevice) return null;
    const isDocFs = typeof document !== 'undefined' && Boolean(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
    const portalTarget =
      (isDocFs || isFullscreen) && playerWrapperRef.current
        ? playerWrapperRef.current
        : typeof document !== 'undefined'
        ? document.body
        : null;
    if (!portalTarget) return null;

    return createPortal(
      <>
        {/* Backdrop overlay */}
        <div
          className="player-sheet-backdrop fixed inset-0 bg-black/80 backdrop-blur-[2px] z-[999998] animate-in fade-in duration-200"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => {
            e.stopPropagation();
            onClose();
          }}
        />
        {/* Mobile Bottom Sheet Drawer */}
        <div
          className="player-floating-panel player-mobile-sheet fixed inset-x-0 bottom-0 max-h-[85vh] bg-[#141419]/98 backdrop-blur-2xl border-t border-white/20 rounded-t-2xl z-[999999] p-4 pb-8 overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-250 text-white select-none"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {/* Drag pill handle */}
          <div className="w-10 h-1 bg-white/25 rounded-full mx-auto mb-3" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
            <h3 className="font-bold text-white text-base">{title}</h3>
            <div className="flex items-center gap-2">
              {headerRight}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="mt-2">{children}</div>
        </div>
      </>,
      portalTarget
    );
  };

  return (
    <div
      ref={playerWrapperRef}
      id="video-player-wrapper"
      onMouseMove={handleMouseMove}
      onMouseEnter={resetControlsTimer}
      className={`w-full bg-black overflow-hidden select-none ${
        isFullscreen
          ? '!fixed !inset-0 !z-[9999999] !w-screen !h-screen !max-w-none !max-h-none !rounded-none !border-none !aspect-auto !m-0 !p-0'
          : 'relative aspect-video rounded-none sm:rounded-xl shadow-2xl border-0 sm:border sm:border-white/10 group'
      }`}
    >
      {/* AMBIENT GLOW BACKLIGHT */}
      {ambientLight && (
        <div
          className="absolute inset-0 pointer-events-none -z-10 blur-3xl opacity-40 scale-110"
          style={{
            background: 'radial-gradient(circle, rgba(254,207,89,0.35) 0%, transparent 70%)',
          }}
        />
      )}

      {/* CHANNEL 0: NATIVE HTML5 VIDEO ENGINE WITH HLS.JS (MATCHING CHỢ PHIM - ZERO BLACKOUTS) */}
      {currentChannel === 0 && (
        <div
          className="w-full h-full relative flex items-center justify-center cursor-pointer select-none"
          onClick={handleVideoBackdropClick}
          onTouchStart={handleVideoTouchStart}
          onTouchMove={handleVideoTouchMove}
          onTouchEnd={handleVideoTouchEnd}
          onTouchCancel={handleVideoTouchCancel}
          onMouseDown={handleVideoMouseDown}
          onMouseUp={handleVideoMouseUp}
          onMouseLeave={handleVideoMouseLeave}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-contain pointer-events-none"
            style={{ transform: 'translateZ(0)', willChange: 'transform' }}
            playsInline
            poster={poster}
            autoPlay
            onPlay={() => setIsPlaying(true)}
            onPause={() => {
              setIsPlaying(false);
              setControlsVisible(true);
            }}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onCanPlay={() => setIsBuffering(false)}
            onTimeUpdate={handleTimeUpdate}
            onVolumeChange={() => {
              if (videoRef.current) {
                setVolume(videoRef.current.volume);
                setIsMuted(videoRef.current.muted);
              }
            }}
            onEnded={() => {
              setIsPlaying(false);
              onEndedRef.current?.();
            }}
          />
        </div>
      )}

      {/* BUFFERING SPINNER – shown during HLS rebuffer (replaces black frame) */}
      {isBuffering && currentChannel === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full border-[3px] border-white/20 border-t-[#FECF59] animate-spin" />
        </div>
      )}

      {/* CHANNEL 1: VIP EMBED IFRAME */}
      {currentChannel === 1 && embedUrl && (
        <iframe
          key={embedUrl}
          src={embedUrl}
          title="Video Player"
          allowFullScreen
          referrerPolicy="no-referrer"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="w-full h-full border-0"
        />
      )}

      {/* ERROR / EMPTY STATES + MANUAL CHANNEL SWITCH */}
      {((currentChannel === 0 && (playError || !m3u8Url)) || (currentChannel === 1 && !embedUrl)) && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-black/80 text-center px-4">
          <p className="text-white/80 text-sm font-semibold">
            {currentChannel === 1
              ? 'Tập này chưa có link trình phát nhúng.'
              : playError || 'Tập này chưa có link HLS.'}
          </p>
          <div className="flex gap-2">
            {currentChannel === 0 && m3u8Url && (
              <button
                onClick={() => setRetryKey((k) => k + 1)}
                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
              >
                Thử lại
              </button>
            )}
            {currentChannel === 0 && embedUrl && (
              <button
                onClick={() => onChannelChange(1)}
                className="px-4 py-1.5 rounded-full bg-[#FECF59] text-black text-xs font-bold"
              >
                Dùng trình phát nhúng
              </button>
            )}
            {currentChannel === 1 && m3u8Url && (
              <button
                onClick={() => onChannelChange(0)}
                className="px-4 py-1.5 rounded-full bg-[#FECF59] text-black text-xs font-bold"
              >
                Dùng trình phát HLS
              </button>
            )}
          </div>
        </div>
      )}

      {/* Embed mode: only a tiny switch-back chip, no custom controls over the iframe */}
      {currentChannel === 1 && embedUrl && m3u8Url && (
        <button
          onClick={() => onChannelChange(0)}
          className="absolute top-2 right-2 z-40 px-3 py-1 rounded-full bg-black/70 hover:bg-black/90 text-white/80 hover:text-[#FECF59] text-[11px] font-bold border border-white/20"
        >
          Đổi sang HLS
        </button>
      )}

      {/* MOBILE DOUBLE TAP RIPPLE EFFECT (+10s / -10s) */}
      {seekRipple && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 z-40 flex flex-col items-center justify-center p-4 rounded-full bg-black/70 backdrop-blur-md text-[#FECF59] font-black text-sm pointer-events-none animate-in zoom-in-75 fade-in duration-200 ${
            seekRipple.side === 'right' ? 'right-[20%]' : 'left-[20%]'
          }`}
        >
          <FastForward
            className={`w-8 h-8 fill-current ${seekRipple.side === 'left' ? 'rotate-180' : ''}`}
          />
          <span>{seekRipple.side === 'right' ? '+10s' : '-10s'}</span>
        </div>
      )}

      {/* YOUTUBE 2X FAST FORWARD PILL INDICATOR */}
      {is2xSpeedActive && (
        <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-white/20 shadow-2xl text-white">
            <FastForward className="w-3.5 h-3.5 fill-current text-[#FECF59] animate-pulse" />
            <span className="text-xs font-black tracking-wider text-white">2X</span>
          </div>
        </div>
      )}

      {/* TOP HEADER OVERLAY (Clean, no left buttons; shows back button when fullscreen) */}
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        className={`absolute top-0 left-0 right-0 p-3 sm:p-5 bg-gradient-to-b from-black/85 via-black/45 to-transparent flex items-center justify-between z-30 transition-all duration-300 ${
          isControlsBarVisible
            ? 'opacity-100 pointer-events-auto translate-y-0'
            : 'opacity-0 pointer-events-none -translate-y-2'
        }`}
      >
        <div className="flex items-center gap-2 truncate max-w-[75%] sm:max-w-[85%]">
          {isFullscreen && (
            <button
              type="button"
              onClick={toggleFullscreen}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 transition-colors shrink-0 cursor-pointer -ml-1"
              title="Thoát toàn màn hình"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-white font-bold text-sm sm:text-base tracking-wide drop-shadow-md truncate">
            {movieName} – {episodeName}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setShowEpisodeDrawer((prev) => !prev);
              setShowServerMenu(false);
              setShowSettingsMenu(false);
              setShowSubtitleMenu(false);
            }}
            className={`player-toggle-btn w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border backdrop-blur-md transition-all shadow-lg cursor-pointer ${
              showEpisodeDrawer
                ? 'bg-white text-black border-white'
                : 'bg-black/65 hover:bg-white text-white hover:text-black border-white/20'
            }`}
            title="Danh sách tập"
            aria-label="Danh sách tập"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FLOATING SKIP INTRO BUTTON MATCHING media_1795011725939_95822c47.png */}
      {showSkipIntro && (
        <button
          onClick={() => {
            if (videoRef.current) videoRef.current.currentTime = 90;
          }}
          className="absolute bottom-16 sm:bottom-20 right-4 sm:right-6 z-30 px-3.5 py-1.5 rounded-lg bg-white hover:bg-white/95 text-black text-xs sm:text-sm font-bold shadow-2xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-200"
          title="Bỏ qua giới thiệu (1:30)"
        >
          <span>Bỏ qua giới thiệu</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="5 4 15 12 5 20 5 4" fill="none" />
            <line x1="19" x2="19" y1="5" y2="19" />
          </svg>
        </button>
      )}

      {/* ========================================================
          IMAGE 2: POPUP MÁY CHỦ (SERVER SELECTOR MODAL)
          Responsive: Mobile Bottom Sheet + Desktop Floating Popover
          ======================================================== */}
      {renderMobileBottomSheet(
        showServerMenu,
        () => setShowServerMenu(false),
        'Máy chủ phát',
        <div className="py-2.5 space-y-2 max-h-60 overflow-y-auto no-scrollbar">
          {episodes.map((server, sIdx) => {
            const isSelected = sIdx === currentServerIndex;
            const ping = sIdx === 0 ? '88 ms' : sIdx === 1 ? '148 ms' : '251 ms';
            const pingColor = sIdx === 0 || sIdx === 1 ? 'text-[#22C55E]' : 'text-[#EAB308]';
            const statusText = sIdx === 0 || sIdx === 1 ? 'Mượt' : 'Ổn';

            return (
              <div
                key={sIdx}
                onClick={() => {
                  const sameEp =
                    server.server_data.find((e) => e.slug === currentEpisodeSlug) ||
                    server.server_data[0];
                  if (sameEp) onSelectEpisode(sIdx, sameEp);
                  setShowServerMenu(false);
                }}
                className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-white/[0.08] border-[#FECF59]/40 shadow-sm'
                    : 'bg-white/[0.03] hover:bg-white/[0.07] border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 20h.01" />
                      <path d="M7 20v-4" />
                      <path d="M12 20v-8" />
                      <path d="M17 20V4" />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold truncate ${
                          isSelected ? 'text-[#FECF59]' : 'text-white'
                        }`}
                      >
                        {server.server_name}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#FECF59] stroke-[3]" />}
                    </div>
                    <span className="text-[11px] text-white/50 block">
                      {server.server_data.length} tập •{' '}
                      <span className={pingColor}>{statusText}</span>
                    </span>
                  </div>
                </div>

                <span className={`text-xs font-bold shrink-0 ml-2 ${pingColor}`}>{ping}</span>
              </div>
            );
          })}
        </div>,
        <button
          onClick={() => {
            const hls = hlsRef.current;
            if (hls && m3u8Url) {
              hls.loadSource(m3u8Url);
              hls.startLoad();
            } else if (videoRef.current && m3u8Url) {
              videoRef.current.src = m3u8Url;
              videoRef.current.play().catch(() => {});
            }
          }}
          title="Làm mới máy chủ"
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      )}

      {!isTouchDevice && showServerMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="player-floating-panel absolute bottom-16 right-16 sm:right-28 w-80 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl bg-[#1C1B20]/95 backdrop-blur-xl p-4 z-50 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-white text-base">Máy chủ</h3>
            <button
              onClick={() => {
                const hls = hlsRef.current;
                if (hls && m3u8Url) {
                  hls.loadSource(m3u8Url);
                  hls.startLoad();
                } else if (videoRef.current && m3u8Url) {
                  videoRef.current.src = m3u8Url;
                  videoRef.current.play().catch(() => {});
                }
              }}
              title="Làm mới máy chủ"
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-2.5 space-y-2 max-h-60 overflow-y-auto no-scrollbar">
            {episodes.map((server, sIdx) => {
              const isSelected = sIdx === currentServerIndex;
              const ping = sIdx === 0 ? '88 ms' : sIdx === 1 ? '148 ms' : '251 ms';
              const pingColor = sIdx === 0 || sIdx === 1 ? 'text-[#22C55E]' : 'text-[#EAB308]';
              const statusText = sIdx === 0 || sIdx === 1 ? 'Mượt' : 'Ổn';

              return (
                <div
                  key={sIdx}
                  onClick={() => {
                    const sameEp =
                      server.server_data.find((e) => e.slug === currentEpisodeSlug) ||
                      server.server_data[0];
                    if (sameEp) onSelectEpisode(sIdx, sameEp);
                    setShowServerMenu(false);
                  }}
                  className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-white/[0.08] border-[#FECF59]/40 shadow-sm'
                      : 'bg-white/[0.03] hover:bg-white/[0.07] border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#22C55E"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 20h.01" />
                        <path d="M7 20v-4" />
                        <path d="M12 20v-8" />
                        <path d="M17 20V4" />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-bold truncate ${
                            isSelected ? 'text-[#FECF59]' : 'text-white'
                          }`}
                        >
                          {server.server_name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#FECF59] stroke-[3]" />}
                      </div>
                      <span className="text-[11px] text-white/50 block">
                        {server.server_data.length} tập •{' '}
                        <span className={pingColor}>{statusText}</span>
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs font-bold shrink-0 ml-2 ${pingColor}`}>{ping}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          IMAGE 3: POPUP CÀI ĐẶT (SETTINGS MODAL - FULLY FUNCTIONAL)
          Responsive: Mobile Bottom Sheet + Desktop Floating Popover
          ======================================================== */}
      {renderMobileBottomSheet(
        showSettingsMenu,
        () => setShowSettingsMenu(false),
        settingsTab === 'quality' ? 'Chất lượng video' : settingsTab === 'speed' ? 'Tốc độ phát' : 'Cài đặt phát',
        <div className="space-y-1">
          {settingsTab === 'main' && (
            <div className="py-2 space-y-1">
              {/* 1. Chất lượng */}
              <div
                onClick={() => setSettingsTab('quality')}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 text-white/90">
                  <Sliders className="w-4 h-4 text-white/70" />
                  <span className="text-xs font-semibold">Chất lượng</span>
                </div>
                <div className="flex items-center gap-1 text-white/50 text-xs">
                  <span className="truncate max-w-[100px] text-[#FECF59] font-semibold">{quality}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* 2. Tốc độ */}
              <div
                onClick={() => setSettingsTab('speed')}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 text-white/90">
                  <Gauge className="w-4 h-4 text-white/70" />
                  <span className="text-xs font-semibold">Tốc độ</span>
                </div>
                <div className="flex items-center gap-1 text-white/50 text-xs">
                  <span className="text-[#FECF59] font-semibold">{playbackSpeed}x</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* 3. Tỉ lệ màn hình */}
              <div
                onClick={() => {
                  const ratios: Array<'contain' | '16:9' | 'cover'> = ['contain', '16:9', 'cover'];
                  const nextIdx = (ratios.indexOf(aspectRatio) + 1) % ratios.length;
                  setAspectRatio(ratios[nextIdx]);
                }}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 text-white/90">
                  <Maximize className="w-4 h-4 text-white/70" />
                  <span className="text-xs font-semibold">Tỉ lệ màn hình</span>
                </div>
                <div className="flex items-center gap-1 text-white/50 text-xs">
                  <span>
                    {aspectRatio === 'contain'
                      ? 'Vừa màn hình'
                      : aspectRatio === '16:9'
                      ? '16:9'
                      : 'Phóng to'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* 4. Ánh sáng môi trường */}
              <div
                onClick={() => setAmbientLight((prev) => !prev)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 text-white/90">
                  <Lightbulb className="w-4 h-4 text-white/70" />
                  <span className="text-xs font-semibold">Ánh sáng môi trường</span>
                </div>
                <div className="flex items-center gap-1 text-white/50 text-xs">
                  <span className={ambientLight ? 'text-[#FECF59] font-bold' : ''}>
                    {ambientLight ? 'Bật' : 'Tắt'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* 5. Tự động bỏ qua giới thiệu */}
              <div
                onClick={() => setAutoSkipIntro((prev) => !prev)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 text-white/90">
                  <Sparkles className="w-4 h-4 text-white/70" />
                  <span className="text-xs font-semibold">Bỏ qua giới thiệu</span>
                </div>
                <div className="flex items-center gap-1 text-white/50 text-xs">
                  <span className={autoSkipIntro ? 'text-[#FECF59] font-bold' : ''}>
                    {autoSkipIntro ? 'Tự động' : 'Tắt'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          )}

          {/* Quality Submenu */}
          {settingsTab === 'quality' && (
            <div className="py-2 space-y-1">
              {availableQualities.map((q, idx) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuality(q);
                    if (hlsRef.current) {
                      hlsRef.current.currentLevel = idx === 0 ? -1 : idx - 1;
                    }
                    setSettingsTab('main');
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    quality === q ? 'bg-white/15 text-[#FECF59]' : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  <span>{q}</span>
                  {quality === q && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              ))}
            </div>
          )}

          {/* Speed Submenu */}
          {settingsTab === 'speed' && (
            <div className="py-2 space-y-1">
              {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setPlaybackSpeed(s);
                    setSettingsTab('main');
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    playbackSpeed === s ? 'bg-white/15 text-[#FECF59]' : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  <span>{s === 1.0 ? '1.0x (Chuẩn)' : `${s}x`}</span>
                  {playbackSpeed === s && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              ))}
            </div>
          )}
        </div>,
        settingsTab !== 'main' ? (
          <button
            onClick={() => setSettingsTab('main')}
            className="text-xs text-[#FECF59] font-bold hover:underline"
          >
            Quay lại
          </button>
        ) : undefined
      )}

      {!isTouchDevice && showSettingsMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="player-floating-panel absolute bottom-16 right-6 sm:right-16 w-72 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl bg-[#1C1B20]/95 backdrop-blur-xl p-4 z-50 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="pb-3 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Cài đặt</h3>
            {settingsTab !== 'main' && (
              <button
                onClick={() => setSettingsTab('main')}
                className="text-xs text-[#FECF59] font-bold hover:underline"
              >
                Quay lại
              </button>
            )}
          </div>

          {settingsTab === 'main' && (
            <div className="py-2 space-y-1">
              {/* 1. Chất lượng */}
              <div
                onClick={() => setSettingsTab('quality')}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 text-white/90">
                  <Sliders className="w-4 h-4 text-white/70" />
                  <span className="text-xs font-semibold">Chất lượng</span>
                </div>
                <div className="flex items-center gap-1 text-white/50 text-xs">
                  <span className="truncate max-w-[100px] text-[#FECF59] font-semibold">{quality}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* 2. Tốc độ */}
              <div
                onClick={() => setSettingsTab('speed')}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 text-white/90">
                  <Gauge className="w-4 h-4 text-white/70" />
                  <span className="text-xs font-semibold">Tốc độ</span>
                </div>
                <div className="flex items-center gap-1 text-white/50 text-xs">
                  <span className="text-[#FECF59] font-semibold">{playbackSpeed}x</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* 3. Tỉ lệ màn hình */}
              <div
                onClick={() => {
                  const ratios: Array<'contain' | '16:9' | 'cover'> = ['contain', '16:9', 'cover'];
                  const nextIdx = (ratios.indexOf(aspectRatio) + 1) % ratios.length;
                  setAspectRatio(ratios[nextIdx]);
                }}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 text-white/90">
                  <Maximize className="w-4 h-4 text-white/70" />
                  <span className="text-xs font-semibold">Tỉ lệ màn hình</span>
                </div>
                <div className="flex items-center gap-1 text-white/50 text-xs">
                  <span>
                    {aspectRatio === 'contain'
                      ? 'Vừa màn hình'
                      : aspectRatio === '16:9'
                      ? '16:9'
                      : 'Phóng to'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* 4. Ánh sáng môi trường */}
              <div
                onClick={() => setAmbientLight((prev) => !prev)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 text-white/90">
                  <Lightbulb className="w-4 h-4 text-white/70" />
                  <span className="text-xs font-semibold">Ánh sáng môi trường</span>
                </div>
                <div className="flex items-center gap-1 text-white/50 text-xs">
                  <span className={ambientLight ? 'text-[#FECF59] font-bold' : ''}>
                    {ambientLight ? 'Bật' : 'Tắt'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* 5. Tự động bỏ qua giới thiệu */}
              <div
                onClick={() => setAutoSkipIntro((prev) => !prev)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 text-white/90">
                  <Sparkles className="w-4 h-4 text-white/70" />
                  <span className="text-xs font-semibold">Bỏ qua giới thiệu</span>
                </div>
                <div className="flex items-center gap-1 text-white/50 text-xs">
                  <span className={autoSkipIntro ? 'text-[#FECF59] font-bold' : ''}>
                    {autoSkipIntro ? 'Tự động' : 'Tắt'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          )}

          {/* Quality Submenu */}
          {settingsTab === 'quality' && (
            <div className="py-2 space-y-1">
              {availableQualities.map((q, idx) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuality(q);
                    if (hlsRef.current) {
                      hlsRef.current.currentLevel = idx === 0 ? -1 : idx - 1;
                    }
                    setSettingsTab('main');
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-colors ${
                    quality === q ? 'bg-white/15 text-[#FECF59]' : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  <span>{q}</span>
                  {quality === q && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              ))}
            </div>
          )}

          {/* Speed Submenu */}
          {settingsTab === 'speed' && (
            <div className="py-2 space-y-1">
              {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setPlaybackSpeed(s);
                    setSettingsTab('main');
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-colors ${
                    playbackSpeed === s ? 'bg-white/15 text-[#FECF59]' : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  <span>{s === 1.0 ? '1.0x (Chuẩn)' : `${s}x`}</span>
                  {playbackSpeed === s && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          IMAGE 4: POPUP PHỤ ĐỀ (SUBTITLES CONFIG MODAL - FULLY FUNCTIONAL)
          Responsive: Mobile Bottom Sheet + Desktop Floating Popover
          ======================================================== */}
      {renderMobileBottomSheet(
        showSubtitleMenu,
        () => setShowSubtitleMenu(false),
        'Cài đặt Phụ đề (CC)',
        <div className="space-y-3">
          {/* Two Columns: Phụ đề 1 & Phụ đề 2 */}
          <div className="grid grid-cols-2 gap-3 py-2 border-b border-white/10">
            <div>
              <span className="text-[11px] font-semibold text-white/50 block mb-1.5">Phụ đề 1</span>
              <div className="bg-black/35 rounded-xl p-1.5 border border-white/5 space-y-1">
                {['Tiếng Việt', 'Tiếng Trung', 'Tiếng Anh'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSubLang1(lang)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      subLang1 === lang
                        ? 'bg-white/10 text-[#FECF59]'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <span>{lang}</span>
                    {subLang1 === lang && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-white/50 block mb-1.5">
                Phụ đề 2 (Song ngữ)
              </span>
              <div className="bg-black/35 rounded-xl p-1.5 border border-white/5 space-y-1">
                {['Tiếng Việt', 'Tiếng Trung', 'Tiếng Anh'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSubLang2(lang)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      subLang2 === lang
                        ? 'bg-white/10 text-[#FECF59]'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <span>{lang}</span>
                    {subLang2 === lang && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Customization Details (Tabs: Chính / Song ngữ) */}
          <div className="space-y-3">
            <div className="flex bg-white/10 rounded-xl p-0.5 border border-white/10">
              <button
                onClick={() => setSubCustomTab('main')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  subCustomTab === 'main' ? 'bg-white text-black shadow-sm' : 'text-white/60'
                }`}
              >
                Chính
              </button>
              <button
                onClick={() => setSubCustomTab('bilingual')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  subCustomTab === 'bilingual' ? 'bg-white text-black shadow-sm' : 'text-white/60'
                }`}
              >
                Song ngữ
              </button>
            </div>

            {/* Row 1: Màu chữ & Font */}
            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <span className="text-[11px] text-white/50 block mb-1 flex items-center gap-1">
                  <Palette className="w-3 h-3" /> Màu chữ
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { color: '#FFFFFF', name: 'Trắng' },
                    { color: '#000000', name: 'Đen' },
                    { color: '#FECF59', name: 'Vàng' },
                    { color: '#22C55E', name: 'Xanh lá' },
                    { color: '#06B6D4', name: 'Xanh ngọc' },
                  ].map((item) => (
                    <button
                      key={item.color}
                      onClick={() => setSubtitleColor(item.color)}
                      style={{ backgroundColor: item.color }}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-transform cursor-pointer ${
                        subtitleColor === item.color
                          ? 'border-[#FECF59] scale-110 ring-2 ring-[#FECF59]/50'
                          : 'border-white/30'
                      }`}
                      title={item.name}
                    >
                      {subtitleColor === item.color && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            item.color === '#000000' ? 'text-white' : 'text-black'
                          } stroke-[3]`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-white/50 block mb-1 flex items-center gap-1">
                  <Type className="w-3 h-3" /> Font
                </span>
                <select
                  value={subtitleFont}
                  onChange={(e) => setSubtitleFont(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:border-[#FECF59]"
                >
                  <option value="Mặc định">Mặc định</option>
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Arial">Arial</option>
                </select>
              </div>
            </div>

            {/* Row 2: Cỡ chữ chính slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-white/50 mb-1">
                <span>Cỡ chữ chính</span>
                <span className="text-white font-bold">{subtitleSize}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="36"
                value={subtitleSize}
                onChange={(e) => setSubtitleSize(Number(e.target.value))}
                className="w-full accent-[#FECF59] cursor-pointer"
              />
            </div>

            {/* Row 3: Nền & Vị trí */}
            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <span className="text-[11px] text-white/50 block mb-1">Nền</span>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'none', label: 'Trống' },
                    { id: 'trans', label: 'Mờ', bg: 'bg-black/40' },
                    { id: 'navy', label: 'Navy', bg: 'bg-[#0E131F]' },
                    { id: 'black', label: 'Đen', bg: 'bg-black' },
                  ].map((bgItem) => (
                    <button
                      key={bgItem.id}
                      onClick={() => setSubtitleBg(bgItem.id as any)}
                      className={`w-7 h-6 rounded-md border text-[9px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                        subtitleBg === bgItem.id
                          ? 'border-[#FECF59] text-[#FECF59] ring-1 ring-[#FECF59]'
                          : 'border-white/20 text-white/60 hover:border-white/40'
                      } ${bgItem.bg || ''}`}
                    >
                      {bgItem.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-white/50 mb-1">
                  <span>Vị trí</span>
                  <span className="text-white font-bold">
                    {subtitlePosition < 15 ? 'Dưới' : subtitlePosition < 30 ? 'Giữa' : 'Trên'}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  value={subtitlePosition}
                  onChange={(e) => setSubtitlePosition(Number(e.target.value))}
                  className="w-full accent-[#FECF59] cursor-pointer"
                />
              </div>
            </div>

            {/* Hardsub Notice */}
            <div className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-[11px] text-white/60 leading-relaxed flex items-start gap-1.5">
              <span className="text-[#FECF59] font-bold shrink-0">Lưu ý:</span>
              <span>Một số phim có sẵn phụ đề cứng (hardsub) in trực tiếp vào hình ảnh video nên không thể xoá lớp chữ gốc của video.</span>
            </div>
          </div>
        </div>,
        <div className="flex bg-white/10 rounded-full p-0.5 border border-white/10">
          <button
            onClick={() => setSubtitleMode('on')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              subtitleMode === 'on' ? 'bg-white text-black shadow-sm' : 'text-white/70'
            }`}
          >
            Bật
          </button>
          <button
            onClick={() => setSubtitleMode('bilingual')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              subtitleMode === 'bilingual' ? 'bg-white text-black shadow-sm' : 'text-white/70'
            }`}
          >
            Song ngữ
          </button>
          <button
            onClick={() => setSubtitleMode('off')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              subtitleMode === 'off' ? 'bg-white text-black shadow-sm' : 'text-white/70'
            }`}
          >
            Tắt
          </button>
        </div>
      )}

      {!isTouchDevice && showSubtitleMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="player-floating-panel absolute bottom-16 right-12 sm:right-32 w-[360px] sm:w-[420px] max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl bg-[#1C1B20]/95 backdrop-blur-xl p-4 z-50 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-white text-base">Phụ đề</h3>

            <div className="flex items-center gap-1.5">
              <div className="flex bg-white/10 rounded-full p-0.5 border border-white/10">
                <button
                  onClick={() => setSubtitleMode('on')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    subtitleMode === 'on' ? 'bg-white text-black shadow-sm' : 'text-white/70'
                  }`}
                >
                  Bật
                </button>
                <button
                  onClick={() => setSubtitleMode('bilingual')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    subtitleMode === 'bilingual' ? 'bg-white text-black shadow-sm' : 'text-white/70'
                  }`}
                >
                  Song ngữ
                </button>
                <button
                  onClick={() => setSubtitleMode('off')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    subtitleMode === 'off' ? 'bg-white text-black shadow-sm' : 'text-white/70'
                  }`}
                >
                  Tắt
                </button>
              </div>

              <button
                onClick={() => setSubCustomTab((prev) => (prev === 'main' ? 'bilingual' : 'main'))}
                className="w-7 h-7 rounded-full border border-[#FECF59]/50 flex items-center justify-center text-[#FECF59] hover:bg-[#FECF59]/10 cursor-pointer"
              >
                <SettingsIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Two Columns: Phụ đề 1 & Phụ đề 2 */}
          <div className="grid grid-cols-2 gap-3 py-3 border-b border-white/10">
            <div>
              <span className="text-[11px] font-semibold text-white/50 block mb-1.5">Phụ đề 1</span>
              <div className="bg-black/35 rounded-xl p-1.5 border border-white/5 space-y-1">
                {['Tiếng Việt', 'Tiếng Trung', 'Tiếng Anh'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSubLang1(lang)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      subLang1 === lang
                        ? 'bg-white/10 text-[#FECF59]'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <span>{lang}</span>
                    {subLang1 === lang && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-white/50 block mb-1.5">
                Phụ đề 2 (Song ngữ)
              </span>
              <div className="bg-black/35 rounded-xl p-1.5 border border-white/5 space-y-1">
                {['Tiếng Việt', 'Tiếng Trung', 'Tiếng Anh'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSubLang2(lang)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      subLang2 === lang
                        ? 'bg-white/10 text-[#FECF59]'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <span>{lang}</span>
                    {subLang2 === lang && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Customization Details (Tabs: Chính / Song ngữ) */}
          <div className="pt-3 space-y-3">
            <div className="flex bg-white/10 rounded-xl p-0.5 border border-white/10">
              <button
                onClick={() => setSubCustomTab('main')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  subCustomTab === 'main' ? 'bg-white text-black shadow-sm' : 'text-white/60'
                }`}
              >
                Chính
              </button>
              <button
                onClick={() => setSubCustomTab('bilingual')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  subCustomTab === 'bilingual' ? 'bg-white text-black shadow-sm' : 'text-white/60'
                }`}
              >
                Song ngữ
              </button>
            </div>

            {/* Row 1: Màu chữ & Font */}
            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <span className="text-[11px] text-white/50 block mb-1 flex items-center gap-1">
                  <Palette className="w-3 h-3" /> Màu chữ
                </span>
                <div className="flex items-center gap-2">
                  {[
                    { color: '#FFFFFF', name: 'Trắng' },
                    { color: '#000000', name: 'Đen' },
                    { color: '#FECF59', name: 'Vàng' },
                    { color: '#22C55E', name: 'Xanh lá' },
                    { color: '#06B6D4', name: 'Xanh ngọc' },
                  ].map((item) => (
                    <button
                      key={item.color}
                      onClick={() => setSubtitleColor(item.color)}
                      style={{ backgroundColor: item.color }}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-transform cursor-pointer ${
                        subtitleColor === item.color
                          ? 'border-[#FECF59] scale-110 ring-2 ring-[#FECF59]/50'
                          : 'border-white/30'
                      }`}
                      title={item.name}
                    >
                      {subtitleColor === item.color && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            item.color === '#000000' ? 'text-white' : 'text-black'
                          } stroke-[3]`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-white/50 block mb-1 flex items-center gap-1">
                  <Type className="w-3 h-3" /> Font
                </span>
                <select
                  value={subtitleFont}
                  onChange={(e) => setSubtitleFont(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:border-[#FECF59]"
                >
                  <option value="Mặc định">Mặc định</option>
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Arial">Arial</option>
                </select>
              </div>
            </div>

            {/* Row 2: Cỡ chữ chính slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-white/50 mb-1">
                <span>Cỡ chữ chính</span>
                <span className="text-white font-bold">{subtitleSize}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="36"
                value={subtitleSize}
                onChange={(e) => setSubtitleSize(Number(e.target.value))}
                className="w-full accent-[#FECF59] cursor-pointer"
              />
            </div>

            {/* Row 3: Nền & Vị trí */}
            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <span className="text-[11px] text-white/50 block mb-1">Nền</span>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'none', label: 'Trống' },
                    { id: 'trans', label: 'Mờ', bg: 'bg-black/40' },
                    { id: 'navy', label: 'Navy', bg: 'bg-[#0E131F]' },
                    { id: 'black', label: 'Đen', bg: 'bg-black' },
                  ].map((bgItem) => (
                    <button
                      key={bgItem.id}
                      onClick={() => setSubtitleBg(bgItem.id as any)}
                      className={`w-7 h-6 rounded-md border text-[9px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                        subtitleBg === bgItem.id
                          ? 'border-[#FECF59] text-[#FECF59] ring-1 ring-[#FECF59]'
                          : 'border-white/20 text-white/60 hover:border-white/40'
                      } ${bgItem.bg || ''}`}
                    >
                      {bgItem.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-white/50 mb-1">
                  <span>Vị trí</span>
                  <span className="text-white font-bold">
                    {subtitlePosition < 15 ? 'Dưới' : subtitlePosition < 30 ? 'Giữa' : 'Trên'}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  value={subtitlePosition}
                  onChange={(e) => setSubtitlePosition(Number(e.target.value))}
                  className="w-full accent-[#FECF59] cursor-pointer"
                />
              </div>
            </div>

            {/* Hardsub Notice */}
            <div className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-[11px] text-white/60 leading-relaxed flex items-start gap-1.5">
              <span className="text-[#FECF59] font-bold shrink-0">Lưu ý:</span>
              <span>Một số phim có sẵn phụ đề cứng (hardsub) in trực tiếp vào hình ảnh video nên không thể xoá lớp chữ gốc của video.</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          IMAGE 1: SUBTITLES OVERLAY (SAFE CLEARANCE ABOVE CONTROLS)
          ======================================================== */}
      {subtitleMode !== 'off' && (activeSubtitle.primary || activeSubtitle.secondary) && (
        <div
          className="absolute left-3 right-3 pointer-events-none flex flex-col items-center justify-center text-center transition-all duration-300 z-20"
          style={{
            bottom: isControlsBarVisible
              ? `calc(${subtitlePosition}% + 60px)`
              : `${subtitlePosition}%`,
            fontFamily: subtitleFont === 'Mặc định' ? 'inherit' : subtitleFont,
          }}
        >
          <div
            className={`max-w-[90%] sm:max-w-[78%] transition-all ${
              subtitleBg === 'trans'
                ? 'bg-black/60 px-3.5 py-1.5 rounded-lg backdrop-blur-sm'
                : subtitleBg === 'navy'
                ? 'bg-[#0E131F]/85 px-3.5 py-1.5 rounded-lg backdrop-blur-sm'
                : subtitleBg === 'black'
                ? 'bg-black/90 px-3.5 py-1.5 rounded-lg'
                : ''
            }`}
          >
            {/* Primary line */}
            {activeSubtitle.primary && (
              <p
                style={{
                  color: subtitleColor,
                  fontSize: `${subtitleSize}px`,
                  textShadow:
                    subtitleBg === 'none'
                      ? '0 1px 3px rgba(0,0,0,1), 0 0 6px rgba(0,0,0,0.95), 0 2px 4px #000'
                      : '0 1px 2px rgba(0,0,0,0.8)',
                }}
                className="font-bold leading-snug tracking-wide"
              >
                {activeSubtitle.primary}
              </p>
            )}

            {/* Bilingual secondary line */}
            {subtitleMode === 'bilingual' && activeSubtitle.secondary && (
              <p
                style={{
                  color: '#FECF59',
                  fontSize: `${Math.max(14, subtitleSize - 4)}px`,
                  textShadow:
                    subtitleBg === 'none'
                      ? '0 1px 3px rgba(0,0,0,1), 0 0 6px rgba(0,0,0,0.95)'
                      : '0 1px 2px rgba(0,0,0,0.8)',
                }}
                className="font-semibold leading-snug mt-0.5 opacity-90"
              >
                {activeSubtitle.secondary}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          IMAGE 1 & 2: CUSTOM PIXEL-PERFECT BOTTOM CONTROL BAR
          Matching media_1795009278092_e08a9114.png
          ======================================================== */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 pointer-events-auto ${
          isControlsBarVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{
          background:
            'linear-gradient(to top, rgba(0, 0, 0, 0.94) 0%, rgba(0, 0, 0, 0.5) 60%, transparent 100%)',
        }}
      >
        {/* 1. PROGRESS BAR (Full width with hover tooltip & clean thumb) */}
        <div
          ref={progressBarRef}
          onClick={(e) => {
            e.stopPropagation();
            handleProgressClick(e);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            handleProgressTouch(e);
          }}
          onTouchMove={(e) => {
            e.stopPropagation();
            handleProgressTouch(e);
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
          }}
          onMouseMove={handleProgressMouseMove}
          onMouseLeave={handleProgressMouseLeave}
          className="relative w-full h-5 flex items-center cursor-pointer group/bar px-3 sm:px-6"
        >
          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-7 px-2 py-0.5 rounded-md bg-black/90 border border-white/20 text-[#FECF59] text-[11px] font-bold shadow-lg -translate-x-1/2 pointer-events-none"
              style={{ left: `${hoverPosition}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}

          {/* Progress Track Background */}
          <div className="relative w-full h-1 group-hover/bar:h-1.5 bg-white/25 rounded-full overflow-hidden transition-all">
            {/* Buffered Bar */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-white/40 rounded-full transition-all"
              style={{ width: `${bufferedPercent}%` }}
            />
            {/* Played Bar (Gold #FECF59) */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-[#FECF59] rounded-full transition-all shadow-[0_0_8px_rgba(254,207,89,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Scrubber Thumb Indicator - Clean horizontal pill matching Image 2 */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-1.5 bg-white rounded-sm shadow-md pointer-events-none transition-all"
            style={{
              left: `calc(${Math.max(0, Math.min(100, progressPercent))}% - 6px)`,
            }}
          />
        </div>

        {/* 2. CONTROLS ROW - Larger buttons matching Image 2 */}
        <div
          onClick={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className="flex items-center justify-between px-3 sm:px-6 pb-2.5 pt-0.5 text-white"
        >
          {/* LEFT SIDE CONTROLS */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Play / Pause button */}
            <button
              onClick={togglePlay}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              title={isPlaying ? 'Tạm dừng (Space)' : 'Phát (Space)'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 sm:w-5.5 sm:h-5.5 fill-current" />
              ) : (
                <Play className="w-5 h-5 sm:w-5.5 sm:h-5.5 fill-current ml-0.5" />
              )}
            </button>

            {/* Tua lại 10s (Hidden on small mobile screens) */}
            <button
              onClick={() => seekRelative(-10)}
              className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              title="Tua lại 10s"
            >
              <RotateCcw className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
            </button>

            {/* Tua tới 10s (Hidden on small mobile screens) */}
            <button
              onClick={() => seekRelative(10)}
              className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              title="Tua tới 10s"
            >
              <RotateCw className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
            </button>

            {/* Volume + Clean Slider (Hidden on mobile phones) */}
            <div className="hidden sm:flex items-center group/vol">
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !videoRef.current.muted;
                    setIsMuted(videoRef.current.muted);
                  }
                }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                title="Âm lượng"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                ) : (
                  <Volume2 className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                )}
              </button>

              <div className="w-0 group-hover/vol:w-16 sm:group-hover/vol:w-20 overflow-hidden transition-all duration-200 flex items-center pr-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const newVol = Number(e.target.value);
                    if (videoRef.current) {
                      videoRef.current.volume = newVol;
                      videoRef.current.muted = newVol === 0;
                    }
                    setVolume(newVol);
                    setIsMuted(newVol === 0);
                  }}
                  className="w-full accent-white h-1 bg-white/30 rounded-full cursor-pointer"
                />
              </div>
            </div>

            {/* Time display: 15:29 / 46:18 */}
            <span className="text-white/90 text-xs sm:text-sm font-semibold tabular-nums ml-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* RIGHT SIDE CONTROLS */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* 1. Next Episode: ▷| (Hidden on mobile, present on lower toolbar) */}
            <button
              onClick={() => onNextEpisode?.()}
              className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 rounded-full items-center justify-center text-white/85 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              title="Tập tiếp theo"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" />
                <line x1="19" x2="19" y1="5" y2="19" strokeWidth="2.5" />
              </svg>
            </button>

            {/* Subtle Divider | */}
            <div className="hidden sm:block w-[1px] h-4 bg-white/20 mx-0.5" />

            {/* 2. CC Button (Always visible on mobile & desktop) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSubtitleMenu((prev) => !prev);
                setShowServerMenu(false);
                setShowSettingsMenu(false);
                setShowEpisodeDrawer(false);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              className={`player-toggle-btn w-8 h-8 sm:w-9 sm:h-9 rounded-full flex flex-col items-center justify-center hover:bg-white/10 transition-colors cursor-pointer ${
                showSubtitleMenu || subtitleMode !== 'off'
                  ? 'text-white'
                  : 'text-white/85 hover:text-white'
              }`}
              title="Cài đặt Phụ đề (CC)"
            >
              <div className="border-[1.8px] border-current rounded-[3px] px-1 py-[0.5px] text-[10px] font-black leading-tight">
                CC
              </div>
              {subtitleMode !== 'off' && (
                <div className="w-3 h-[2px] bg-white rounded-full mt-[2px]" />
              )}
            </button>

            {/* 3. Audio Track / Song Badge Button (Mic with 'Song' badge - Hidden on mobile) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowServerMenu((prev) => !prev);
                setShowSettingsMenu(false);
                setShowSubtitleMenu(false);
                setShowEpisodeDrawer(false);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              className="player-toggle-btn hidden md:flex w-8 h-8 sm:w-9 sm:h-9 rounded-full relative text-white/85 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex-col items-center justify-center"
              title="Nguồn âm thanh / Thuyết minh"
            >
              <span className="text-[8px] font-black bg-white text-black px-1 rounded-sm -mb-1 leading-none z-10 scale-90">
                {currentAudioBadge}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </button>

            {/* 4. Server Button: Router box with signal (Hidden on mobile, available on bottom bar) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowServerMenu((prev) => !prev);
                setShowSettingsMenu(false);
                setShowSubtitleMenu(false);
                setShowEpisodeDrawer(false);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              className={`player-toggle-btn hidden md:flex w-8 h-8 sm:w-9 sm:h-9 rounded-full items-center justify-center hover:bg-white/10 transition-colors cursor-pointer ${
                showServerMenu ? 'text-white' : 'text-white/85 hover:text-white'
              }`}
              title="Đổi Máy chủ (Server)"
            >
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="8" x="2" y="14" rx="2" />
                  <path d="M6 18h.01" />
                  <path d="M10 18h.01" />
                  <path d="M12 2v8" />
                  <path d="m8.5 4.5 7 7" />
                  <path d="m15.5 4.5-7 7" />
                </svg>
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white/80 animate-pulse" />
              </div>
            </button>

            {/* 5. Trình phát thu nhỏ (PiP - Hidden on mobile) */}
            <button
              onClick={togglePiP}
              className={`hidden md:flex w-8 h-8 sm:w-9 sm:h-9 rounded-full items-center justify-center text-white/85 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ${
                isPiP ? 'text-white' : ''
              }`}
              title="Trình phát thu nhỏ (PiP)"
            >
              <PictureInPicture2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* 6. Settings gear button (Always visible) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSettingsMenu((prev) => !prev);
                setSettingsTab('main');
                setShowServerMenu(false);
                setShowSubtitleMenu(false);
                setShowEpisodeDrawer(false);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              className={`player-toggle-btn w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer ${
                showSettingsMenu ? 'text-white' : 'text-white/85 hover:text-white'
              }`}
              title="Cài đặt phát"
            >
              <SettingsIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* 7. Fullscreen button (Always visible) */}
            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white/85 hover:text-white hover:bg-white/10 active:scale-95 transition-transform cursor-pointer ml-0.5"
              title="Toàn màn hình"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              ) : (
                <Maximize className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          IMAGE 3: EPISODE DRAWER MATCHING media_1795009400539_55fbbb2c.jpg
          ======================================================== */}
      {showEpisodeDrawer && (
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="player-floating-panel absolute top-0 bottom-0 right-0 w-72 sm:w-80 md:w-96 bg-[#16161A]/95 backdrop-blur-2xl z-50 p-4 flex flex-col shadow-2xl animate-in slide-in-from-right duration-250 border-l border-white/10"
        >
          {/* Header matching Image 3 */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
            <h3 className="font-bold text-white text-sm sm:text-base truncate max-w-[80%]">
              {movieName}
            </h3>
            <button
              onClick={() => setShowEpisodeDrawer(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Episode List with 16:9 Thumbnails matching Image 3 */}
          <div className="flex-1 overflow-y-auto py-2.5 space-y-2 no-scrollbar pr-1">
            {episodeList.map((ep, idx) => {
              const isActive = ep.slug === currentEpisodeSlug;
              // Format name as 'Tập 01', 'Tập 02'
              const formattedName =
                ep.name.startsWith('Tập')
                  ? ep.name.replace(/Tập\s*(\d)$/, 'Tập 0$1')
                  : `Tập ${String(idx + 1).padStart(2, '0')}`;

              return (
                <div
                  key={ep.slug}
                  onClick={() => {
                    onSelectEpisode(currentServerIndex, ep);
                    setShowEpisodeDrawer(false);
                  }}
                  className={`p-1.5 rounded-xl flex items-center gap-3 cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-white/10 border-transparent shadow-md'
                      : 'hover:bg-white/5 border-transparent'
                  }`}
                >
                  {/* 16:9 Thumbnail with yellow border when active */}
                  <div
                    className={`relative w-24 sm:w-28 aspect-video rounded-lg overflow-hidden shrink-0 transition-all ${
                      isActive
                        ? 'border-2 border-[#FECF59] shadow-[0_0_12px_rgba(254,207,89,0.4)]'
                        : 'border border-white/10 opacity-75 group-hover:opacity-100'
                    }`}
                  >
                    <img
                      src={poster || ''}
                      alt={ep.name}
                      className="w-full h-full object-cover"
                    />
                    {isActive && (
                      <div className="absolute inset-0 bg-[#FECF59]/20 flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 text-[#FECF59] fill-[#FECF59]" />
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-xs sm:text-sm font-bold block truncate ${
                        isActive ? 'text-[#FECF59]' : 'text-white/80 hover:text-white'
                      }`}
                    >
                      {formattedName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};