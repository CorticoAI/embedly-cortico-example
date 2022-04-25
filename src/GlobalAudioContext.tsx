import * as React from "react";
import Html5Audio from "./Html5Audio";
import PlayerjsAdapter from "./PlayerjsAdapter";

export interface GlobalAudioContextValue {
  isPlaying: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  seekTime: number | undefined;
  duration: number | undefined;
  playbackSpeed: number;
  src: string | undefined;
  meta: any;
  audioError: MediaError | undefined;
  sound: Html5Audio | undefined;
  onPlay: (seekTime?: number, endTime?: number) => void;
  onSeek: (seekTime: number) => void;
  onChangePlaybackSpeed: (playbackSpeed: number) => void;
  onPause: () => void;
  onStop: () => void; // pauses then clears the src
  onChangeSound: (src: string, meta?: any) => void;
  setCurrentSrc: (src: string) => void;
}

export const GlobalAudioContext = React.createContext({
  isPlaying: false,
  isLoading: false,
  isLoaded: false,
  seekTime: undefined,
  duration: undefined,
  playbackSpeed: 1,
  src: undefined,
  meta: undefined,
  audioError: undefined,
  sound: undefined,
  onPlay: (seekTime?: number, endTime?: number) => {},
  onSeek: (seekTime: number) => {},
  onChangePlaybackSpeed: (playbackSpeed: number) => {},
  onPause: () => {},
  onStop: () => {},
  onChangeSound: (src: string, meta?: any) => {},
  setCurrentSrc: (src: string) => {},
} as GlobalAudioContextValue);

interface Props {}

export class GlobalAudioContextProvider extends React.Component<Props> {
  sound: Html5Audio;
  raf: any | null = null;
  unmounting: boolean = false;
  endPlayTime: number | undefined = undefined;
  meta: any = undefined; // TODO could make meta a generic parameter of GlobalAudioContextProvider

  constructor(props: Props) {
    super(props);
    const sound = new Html5Audio({
      onPlay: this.handleAudioPlay,
      onPause: this.handleAudioPause,
      onEnd: this.handleAudioEnd,
      onLoad: this.handleAudioLoaded,
      onError: this.handleAudioError,
    });
    this.sound = sound;
  }

  componentWillUnmount() {
    const sound = this.sound;

    this.endPlayTime = undefined;

    if (this.raf) {
      cancelAnimationFrame(this.raf);
    }
    // flag we are unmounting to prevent calling forceUpdate in howler handlers
    this.unmounting = true;
    if (sound) {
      sound.unload();
    }
  }

  /** We can use meta to pass in a conversation as context for other players to know about */
  handleChangeSound = (src: string | undefined, meta?: any) => {
    this.endPlayTime = undefined;
    this.meta = meta;

    const sound = this.sound;
    sound.setSrc(src);
  };

  /** Checks if an audio source has loaded */
  isLoaded() {
    return this.sound.getSrc() !== undefined;
  }

  isPlaying() {
    const sound = this.sound;
    return sound.isPlaying();
  }

  play() {
    const sound = this.sound;
    sound.play();
  }

  pause() {
    const sound = this.sound;
    sound.pause();
  }

  playbackSpeed() {
    const sound = this.sound;
    return !this.isLoading() ? sound.getPlaybackRate() : 1;
  }

  duration() {
    const sound = this.sound;
    return !this.isLoading() ? sound.getDuration() : undefined;
  }

  seekTime() {
    const sound = this.sound;
    return !this.isLoading() ? (sound.getCurrentTime() as number) : undefined;
  }

  seek(seekTime: number, play?: boolean) {
    const sound = this.sound;
    if (play && !sound.isPlaying()) {
      sound.play();
    }
    sound.seek(seekTime);
  }

  changePlaybackSpeed(playbackSpeed: number) {
    const sound = this.sound;
    sound.setPlaybackRate(playbackSpeed);
  }

  isLoading() {
    const sound = this.sound;
    return sound.isLoading();
  }

  handleAudioLoaded = () => {
    this.forceUpdate();
  };

  handleAudioPlay = () => {
    this.playingTick();
  };

  handleAudioPause = () => {
    this.forceUpdate();
  };

  handleAudioError = (instance: Html5Audio, audio: HTMLAudioElement) => {
    console.error("Audio error for " + audio.src + "\n", audio.error, audio);
    this.forceUpdate();
  };

  handleAudioEnd = () => {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = null;
    }
    this.forceUpdate();
  };

  handleControlsPlay = (seekTime?: number, endTime?: number) => {
    if (!this.isPlaying()) {
      this.play();
    }
    if (seekTime != null) {
      this.seek(seekTime);
    }

    // store time to auto end play
    this.endPlayTime = endTime;
  };

  handleControlsPause = () => {
    if (this.isPlaying()) {
      this.pause();
    }

    this.endPlayTime = undefined;
  };

  handleControlsStop = () => {
    this.handleControlsPause();
    this.handleChangeSound(undefined);
    this.forceUpdate();
  };

  handleControlsSeek = (seekTime: number, play?: boolean) => {
    this.seek(seekTime, play);
    this.forceUpdate();

    // if we seek past the end play time, then reset the end play time.
    if (this.endPlayTime && seekTime > this.endPlayTime) {
      this.endPlayTime = undefined;
    }
  };
  handleControlsChangePlaybackSpeed = (playbackSpeed: number) => {
    this.changePlaybackSpeed(playbackSpeed);
    this.forceUpdate();
  };

  /**
   * Called continuously while playing to update the seekTime value
   */
  playingTick = () => {
    this.forceUpdate();

    if (this.isPlaying()) {
      if (this.endPlayTime) {
        const seekTime = this.seekTime();
        if (seekTime != null && seekTime >= this.endPlayTime) {
          this.handleControlsPause();
        }
      }
      this.raf = requestAnimationFrame(this.playingTick);
    }
  };

  globalAudioContextValue() {
    const sound = this.sound;

    return {
      isPlaying: this.isPlaying(),
      isLoading: this.isLoading(),
      isLoaded: this.isLoaded(),
      seekTime: this.seekTime(),
      duration: this.duration(),
      playbackSpeed: this.playbackSpeed(),
      src: sound.getSrc(),
      meta: this.meta,
      audioError: sound.getError(),
      sound,
      onSeek: this.handleControlsSeek,
      onPlay: this.handleControlsPlay,
      onPause: this.handleControlsPause,
      onStop: this.handleControlsStop,
      onChangeSound: this.handleChangeSound,
      onChangePlaybackSpeed: this.handleControlsChangePlaybackSpeed,
      setCurrentSrc: sound.setCurrentSrc,
    };
  }

  render() {
    const value = this.globalAudioContextValue();
    const adapter = new PlayerjsAdapter(value);
    adapter.ready();
    return (
      <GlobalAudioContext.Provider value={value}>
        {this.props.children}
      </GlobalAudioContext.Provider>
    );
  }
}

export default GlobalAudioContext;
