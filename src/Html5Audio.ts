/**
 * Wrapper around HTML5 Audio objects
 */
interface Props {
  src?: string;
  onPlay?: (instance: Html5Audio, audio: HTMLAudioElement) => void;
  onPause?: (instance: Html5Audio, audio: HTMLAudioElement) => void;
  onEnd?: (instance: Html5Audio, audio: HTMLAudioElement) => void;
  onCanPlay?: (instance: Html5Audio, audio: HTMLAudioElement) => void;
  onProgress?: (instance: Html5Audio, audio: HTMLAudioElement) => void;
  onRateChange?: (instance: Html5Audio, audio: HTMLAudioElement) => void;
  onSeeked?: (instance: Html5Audio, audio: HTMLAudioElement) => void;
  onLoad?: (instance: Html5Audio, audio: HTMLAudioElement) => void;
  onLoadMetadata?: (instance: Html5Audio, audio: HTMLAudioElement) => void;
  onError?: (instance: Html5Audio, audio: HTMLAudioElement) => void;
}

// jsdom doesn't provide these functions, give no-ops here so jest can run
if (process.env.NODE_ENV === "test") {
  (window as any).HTMLMediaElement.prototype.load = () => {
    /* do nothing */
  };
  (window as any).HTMLMediaElement.prototype.play = () => {
    /* do nothing */
  };
  (window as any).HTMLMediaElement.prototype.pause = () => {
    /* do nothing */
  };
  (window as any).HTMLMediaElement.prototype.addTextTrack = () => {
    /* do nothing */
  };
}

class Html5Audio {
  audio: HTMLAudioElement;
  boundEventListeners: Array<[string, () => void]> = [];
  hasSrc: boolean = false;
  isLoaded: boolean = false;
  currentSrc: string | undefined;

  constructor({
    src,
    onPlay,
    onPause,
    onEnd,
    onCanPlay,
    onProgress,
    onRateChange,
    onSeeked,
    onLoad,
    onLoadMetadata,
    onError,
  }: Props) {
    const audio = (this.audio = new Audio());
    const instance = this;
    console.log("created html5 audio", audio);

    // update internal is loaded flag
    audio.addEventListener("loadeddata", function () {
      instance.isLoaded = true;
    });

    function addEventListener(
      eventName: string,
      handler?: (instance: Html5Audio, audio: HTMLAudioElement) => void
    ) {
      if (handler) {
        const eventListener = function () {
          console.log("html5 audio event:", eventName);
          handler(instance, audio);
        };
        audio.addEventListener(eventName, eventListener);
        instance.boundEventListeners.push([eventName, eventListener]);
      }
    }

    // see https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
    addEventListener("play", onPlay);
    addEventListener("pause", onPause);
    addEventListener("ended", onEnd);
    addEventListener("canplay", onCanPlay);
    addEventListener("loadeddata", onLoad);
    addEventListener("loadedmetadata", onLoadMetadata);
    addEventListener("progress", onProgress);
    addEventListener("ratechange", onRateChange);
    addEventListener("seeked", onSeeked);
    addEventListener("error", onError);

    // set src after adding event listeners
    if (src != null) {
      this.hasSrc = true;
      audio.src = src[0] === "/" ? `${window.location.origin}${src}` : src;
    }
  }

  setCurrentSrc = (src: string | undefined) => {
    this.currentSrc = src;
  };

  setSrc(src: string | undefined) {
    const fullSrc =
      src && src[0] === "/" ? `${window.location.origin}${src}` : src;

    // ignore if this is already the source (required for streaming responses which)
    if (this.hasSrc && this.audio.src === fullSrc) {
      return;
    }

    this.audio.pause();
    this.isLoaded = false;

    if (fullSrc == null) {
      this.hasSrc = false;
    } else {
      this.hasSrc = true;
      this.audio.src = fullSrc;
    }
  }

  play(seekTime?: number) {
    if (!this.hasSrc && !this.currentSrc) return;

    if (seekTime != null) {
      this.audio.currentTime = seekTime;
    }
    if (this.audio.src !== this.currentSrc) {
      this.setSrc(this.currentSrc);
    }

    this.audio.play();
  }

  pause() {
    if (!this.hasSrc) return;
    this.audio.pause();
  }

  seek(seekTime: number) {
    if (!this.hasSrc) return;
    this.audio.currentTime = seekTime;
  }

  setPlaybackRate(rate: number) {
    this.audio.playbackRate = rate;
  }

  isLoading() {
    return !this.isLoaded && !this.audio.error;
  }

  isPlaying() {
    if (!this.hasSrc) return false;

    return !this.audio.paused && !this.audio.error;
  }

  getSrc(): string | undefined {
    if (!this.hasSrc) return undefined;
    return this.audio.src;
  }

  getError(): MediaError | undefined {
    return this.audio.error ? this.audio.error : undefined;
  }

  getCurrentTime() {
    if (!this.hasSrc) return 0;

    return this.audio.currentTime;
  }

  getDuration() {
    if (!this.hasSrc) return 0;

    return this.audio.duration;
  }

  getPlaybackRate() {
    return this.audio.playbackRate;
  }

  unload() {
    // facilitate garbage collection by ensuring no audio is playing
    /*
        see: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement

        Note: An Audio element constructed with new Audio() won't be
        garbage collected as long as playback is in progress. It will
        continue playing and be audible until pause() is called or
        playback finishes.
    */

    // remove event listeners
    for (const eventListener of this.boundEventListeners) {
      this.audio.removeEventListener(eventListener[0], eventListener[1]);
    }

    this.audio.pause();
    this.hasSrc = false;
    this.isLoaded = false;
  }
}

export default Html5Audio;
