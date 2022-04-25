/**
 * This is a custom implementation of a playerjs adapter. More detalis can be found
 * at https://github.com/embedly/player.js#adapters. Player js (http://playerjs.io/) allows us to
 * share our embed so that they are customizable and accessible through other applications.
 */
//@ts-ignore
import playerjs from "player.js";
import { GlobalAudioContextValue } from "./GlobalAudioContext";

class PlayerjsAdapter {
  receiver: any;
  constructor(context: GlobalAudioContextValue) {
    const receiver = new playerjs.Receiver();
    const sound = context.sound;
    if (sound) {
      receiver.on("play", () => {
        context.onPlay();
        receiver.emit("play");
      });

      receiver.on("pause", () => {
        context.onPause();
        receiver.emit("pause");
      });

      receiver.on("getPaused", (callback: (arg0: boolean) => any) =>
        callback(sound.audio.paused)
      );

      receiver.on("getDuration", (callback: (arg0: number) => any) =>
        callback(sound.getDuration())
      );

      receiver.on("getVolume", (callback: (arg0: number) => any) =>
        callback(sound.audio.volume * 100)
      );

      receiver.on("setVolume", (value: number) => {
        sound.audio.volume = value / 100;
      });

      receiver.on("mute", () => {
        sound.audio.muted = true;
      });

      receiver.on("unmute", () => {
        sound.audio.muted = false;
      });

      receiver.on("getMuted", (callback: (arg0: boolean) => any) =>
        callback(sound.audio.muted)
      );

      receiver.on("getLoop", (callback: (arg0: boolean) => any) =>
        callback(sound.audio.loop)
      );

      receiver.on("setLoop", (value: boolean) => {
        sound.audio.loop = value;
      });

      receiver.on(
        "getCurrentTime",
        (callback: (arg0: number | undefined) => any) =>
          callback(sound.getCurrentTime())
      );

      receiver.on("setCurrentTime", (value: number) => context.onSeek(value));

      sound.audio.addEventListener("ended", () => receiver.emit("ended"));

      sound.audio.addEventListener("timeupdate", () => {
        receiver.emit("timeupdate", {
          seconds: sound.getCurrentTime(),
          duration: sound.getDuration(),
        });
      });
      this.receiver = receiver;
    } else {
      // If no audio element detected, throw an error
      throw new Error("Audio element not found!");
    }
  }
  ready() {
    if (this.receiver) {
      this.receiver.ready();
    }
  }
}
export default PlayerjsAdapter;
