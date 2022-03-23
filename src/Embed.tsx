import React from "react";
import GlobalAudioContext from "./GlobalAudioContext";

const Embed = () => {
  const {
    src,
    onPause,
    isPlaying,
    isLoading,
    onPlay,
    onChangeSound,
    isLoaded,
    audioError,
  } = React.useContext(GlobalAudioContext);

  React.useEffect(() => {
    const fullAudioUrl = `https://origin-embed.dev.lvn.org/highlight/161/play`;
    if (src !== fullAudioUrl) {
      onChangeSound(fullAudioUrl);
    } else if (audioError) {
      // in the case of an audio error, avoid using the browser's cached version of the audio file
      // https://stackoverflow.com/questions/25821915/how-to-force-the-html5-audio-tag-to-reload-a-changing-file
      onChangeSound(`${fullAudioUrl}/?${new Date().getTime()}`);
    }
  }, [audioError, onChangeSound, src]);

  const handlePlay = () => {
    onPlay();
  };

  const handleTogglePlay = () => {
    if (!isLoaded) {
      return handlePlay();
    } else if (isPlaying) {
      return onPause();
    } else {
      return handlePlay();
    }
  };
  const content =
    isLoaded && isLoading ? "Loading" : isPlaying ? "Pause" : "Play";
  return (
    <div>
      <button onClick={handleTogglePlay}>{content}</button>
    </div>
  );
};

export default Embed;
