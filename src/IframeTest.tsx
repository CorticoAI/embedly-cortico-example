import React from "react";
//@ts-ignore
import playerjs from "player.js";

/**
 * iframe example for testing purposes
 */

interface Props {
  iframeUrl: string;
  width?: number;
  height?: number;
}

const events = ["ready", "play", "pause", "timeUpdate", "ended"];
type EventTest = typeof events[number];
const methods = [
  "play",
  "pause",
  "getPaused",
  "mute",
  "unmute",
  "getMuted",
  "setVolume",
  "getVolume",
  "getDuration",
  "setCurrentTime",
  "getCurrentTime",
  "setLoop",
  "getLoop",
  "addEventListener",
  "removeEventListener",
];
type MethodTest = typeof events[number];

interface TestSuite {
  events: { [key in EventTest]: boolean };
  methods: { [key in MethodTest]: boolean };
}

function delay(callback: () => void, t: number) {
  return new Promise<void>(function (resolve) {
    setTimeout(() => {
      callback();
      resolve();
    }, t);
  });
}

const IframeTest = ({ iframeUrl, width = 570, height = 220 }: Props) => {
  const [results, setResults] = React.useState<TestSuite>({
    events: {},
    methods: {},
  });
  const iframeLoad = (ev: EventTarget) => {
    var player = new playerjs.Player(ev as HTMLIFrameElement);
    player.on("ready", async function () {
      setResults((self) => ({
        events: { ...self.events, ready: true },
        methods: { ...self.methods },
      }));
      player.on("play", function () {
        console.log("Playing");
        setResults((self) => ({
          events: { ...self.events, play: true },
          methods: { ...self.methods },
        }));
      });
      player.on("pause", function () {
        console.log("Paused");
        setResults((self) => ({
          events: { ...self.events, pause: true },
          methods: { ...self.methods },
        }));
      });
      player.on("timeupdate", function () {
        console.log("Time Updated");
        setResults((self) => ({
          events: { ...self.events, timeUpdate: true },
          methods: { ...self.methods },
        }));
      });
      player.on("ended", function () {
        console.log("Ended");
        setResults((self) => ({
          events: { ...self.events, ended: true },
          methods: { ...self.methods },
        }));
      });

      // Testing Play
      await delay(() => {
        console.log("Testing Play");
        player.play();
        setResults((self) => ({
          events: { ...self.events },
          methods: { ...self.methods, play: true },
        }));
      }, 500);

      // Testing Pause
      await delay(() => {
        console.log("Testing Pause");
        player.pause();
        setResults((self) => ({
          events: { ...self.events },
          methods: { ...self.methods, pause: true },
        }));
      }, 500);

      // Testing getPaused
      await delay(() => {
        console.log("Testing getPaused");
        player.getPaused((paused: boolean) => {
          if (paused) {
            setResults((self) => ({
              events: { ...self.events },
              methods: { ...self.methods, getPaused: true },
            }));
          }
        });
      }, 500);

      // Testing Mute
      await delay(() => {
        console.log("Testing mute");
        player.mute();
        setResults((self) => ({
          events: { ...self.events },
          methods: { ...self.methods, mute: true },
        }));

        player.getMuted((muted: boolean) => {
          if (muted) {
            setResults((self) => ({
              events: { ...self.events },
              methods: { ...self.methods, getMuted: true },
            }));
          }
        });
      }, 500);

      // Testing Unmute
      await delay(() => {
        console.log("Testing unmute");
        player.unmute();
        setResults((self) => ({
          events: { ...self.events },
          methods: { ...self.methods, unmute: true },
        }));
      }, 500);

      // Testing setVolume
      await delay(() => {
        console.log("volume");
        player.setVolume(30);
        setResults((self) => ({
          events: { ...self.events },
          methods: { ...self.methods, setVolume: true },
        }));
        player.getVolume((volume: number) => {
          if (volume === 30) {
            setResults((self) => ({
              events: { ...self.events },
              methods: { ...self.methods, getVolume: true },
            }));
          }
        });
      }, 500);

      let endtime = 0;
      // Testing Duration
      await delay(() => {
        console.log("Testing duration");
        player.getDuration((duration: number) => {
          endtime = duration;
          setResults((self) => ({
            events: { ...self.events },
            methods: { ...self.methods, getDuration: true },
          }));
        });
      }, 500);

      // Testing setCurrentTime
      await delay(() => {
        console.log("Testing setCurrentTime");
        player.setCurrentTime(endtime);
        setResults((self) => ({
          events: { ...self.events },
          methods: { ...self.methods, setCurrentTime: true },
        }));
      }, 500);

      // Testing getCurrentTime
      await delay(() => {
        player.getCurrentTime((time: number) => {
          console.log("Testing getCurrentTime");
          if (time === endtime) {
            setResults((self) => ({
              events: { ...self.events },
              methods: { ...self.methods, getCurrentTime: true },
            }));
          }
        });
      }, 500);

      // Testing Loop
      await delay(() => {
        console.log("Testing Loop");
        player.setLoop(true);
        setResults((self) => ({
          events: { ...self.events },
          methods: { ...self.methods, setLoop: true },
        }));
        player.getLoop((isLooping: boolean) => {
          if (isLooping) {
            setResults((self) => ({
              events: { ...self.events },
              methods: { ...self.methods, getLoop: true },
            }));
          }
          player.setLoop(false);
        });
      }, 500);

      // Testing Event Listeners
      await delay(() => {
        const play = () => {
          console.log("Event listener");
        };
        player.addEventListener("play", play);
        setResults((self) => ({
          events: { ...self.events },
          methods: { ...self.methods, addEventListener: true },
        }));
        player.removeEventListener("play", play);
        setResults((self) => ({
          events: { ...self.events },
          methods: { ...self.methods, removeEventListener: true },
        }));
      }, 500);

      // Ending
      player.play();
      await delay(() => {
        setResults((self) => {
          let sucess = 0;
          let total = 0;
          events.forEach((event) => {
            if (self?.events[event]) {
              sucess = sucess + 1;
            }
            total = total + 1;
          });
          methods.forEach((method) => {
            if (self?.methods[method]) {
              sucess = sucess + 1;
            }
            total = total + 1;
          });

          window.alert(`Testing complete. Passed ${sucess}/${total} tests.`);
          return self;
        });
      }, 500);
    });
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>This is the test page for the iframe</h1>
      <iframe
        src={iframeUrl}
        width={width}
        height={height}
        scrolling="no"
        frameBorder="0"
        title="embed-test"
        allow="autoplay"
        onLoad={(ev) => iframeLoad(ev.target)}
      />
      <h2>Below are the test results</h2>
      <h3>Events</h3>
      {events.map((event) => (
        <div key={event} style={{ margin: "1rem 0" }}>
          {event} -{" "}
          {results.events[event] === undefined
            ? "Waiting"
            : results.events[event]
            ? "Passed"
            : "Failed"}
        </div>
      ))}
      <h3>Methods</h3>
      {methods.map((method) => (
        <div key={method} style={{ margin: "1rem 0" }}>
          {method} -{" "}
          {results?.methods[method] === undefined
            ? "Waiting"
            : results?.methods[method]
            ? "Passed"
            : "Failed"}
        </div>
      ))}
    </div>
  );
};

export default IframeTest;
