import useSound from 'use-sound';

const SOUND_CONFIG = {
  volume: 0.4, 
  playbackRate: 1.0,
};

export const useGameSounds = () => {
  // 1. UI Sounds
  const [playSelect] = useSound('/sounds/select.mp3', SOUND_CONFIG);
  const [playHover] = useSound('/sounds/hover.mp3', { ...SOUND_CONFIG, volume: 0.1 });
  const [playCancel] = useSound('/sounds/cancel.mp3', { ...SOUND_CONFIG, volume: 0.5 });
  const [playSuccess] = useSound('/sounds/success.mp3', { ...SOUND_CONFIG, volume: 0.5 });

  // 2. Action Sounds
  const [playBuild] = useSound('/sounds/build.mp3', SOUND_CONFIG);
  const [playUpgrade] = useSound('/sounds/upgrade.mp3', SOUND_CONFIG);
  const [playDestroy] = useSound('/sounds/destroy.mp3', { ...SOUND_CONFIG, volume: 0.2 });
  
  // 3. Combat Sounds
  const [playAttack] = useSound('/sounds/attack.mp3', {...SOUND_CONFIG, volume: 0.3});
  const [playBarbarians] = useSound('/sounds/war_scream.mp3', SOUND_CONFIG);

  return {
    playSelect,
    playHover,
    playCancel,
    playSuccess,
    playBuild,
    playUpgrade,
    playDestroy,
    playAttack,
    playBarbarians,
  };
};