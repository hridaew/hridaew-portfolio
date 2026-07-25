/**
 * Title + body copy for wafflings that have a full article page.
 * Homepage cards reuse enough consecutive article text that it overflows
 * and gets clipped by the card fade (same idea as Butter Chicken).
 */

export const SAVOR_TITLE = "Savor: Video to 3D model tool";

export const SAVOR_OPENING =
  "Savor turns an ordinary video of an object into a 3D Gaussian splat: a photoreal capture you can orbit and zoom on screen. Walk a slow circle around something with your phone, feed Savor the video, and a minute or two later the object is floating in 3D, lifted out of whatever room it was sitting in.";

export const SAVOR_P2 =
  "I built a completely Mac-native version. Frames come out through AVFoundation, the splat trains in Metal, cleanup uses Vision, and RealityKit handles the viewer. There's also a Windows/Linux version that wraps a third-party stack. Neither talks to a cloud.";

export const SAVOR_P3 =
  "This is a research preview and being updated. You can install it through the terminal further down.";

export const SAVOR_STORY_P1 =
  "I love cyberpunk, especially the idea of braindances: stepping into a moment and looking around it. When I found Gaussian splatting, the cyberpunk reality felt closer than ever before.";

export const SAVOR_STORY_P2 =
  "There's this sculpture at the Legion of Honor: Rodin's Mighty Hand. I love it. I keep going back. Photos don't do it justice; it's a 3D sculpture. I wanted to capture it properly, so I walked a slow circle with my phone and tried to turn that clip into a Gaussian splat.";

/** Enough article text for the home card to overflow and fade out. */
export const SAVOR_CARD_PREVIEW = [
  SAVOR_OPENING,
  SAVOR_P2,
  SAVOR_P3,
  SAVOR_STORY_P1,
  SAVOR_STORY_P2,
].join("\n\n");

export const ORCA_TITLE = "Saving Baby J - An arcade game";

export const ORCA_OPENING =
  "Walk-up arcade game with a science museum vibe for the Puget Sound. You throw orca plushies at a projected hit board to damage a boat and free Baby J, a calf stuck in a fishing net.";

export const ORCA_INTERACTION =
  "I tried two controllers and Wizard-of-Oz tested both. Giant cardboard orcas you tilt, with a foot pedal to attack. Or throwing plushies at a screen while someone scores hits offstage. The throw won. It was obvious, and nobody needed a tutorial.";

export const ORCA_MAKING_P1 =
  "I built a 15-button hit board on an Arduino Leonardo using analog resistor ladders, short on pins. Foam-core panels in front so you hit a surface, not a switch. Underneath, a skee-ball-style slide sent the plushies back.";

export const ORCA_MAKING_P2 =
  "The game is p5.js: intro, play, outro. Boat on a 5×3 grid mapped to the buttons, with hit, near-miss, and miss feedback.";

export const ORCA_PLAYTEST_P1 =
  "In playtests, people got the throw right away, but a few things kept falling flat. The boat still felt small for the size of the screen. Hits and near-misses were easy to miss in the noise of the room. And when the boat finally went down, the game slid into the outro before anyone had a beat to react.";

/** Enough article text for the home card to overflow and fade out. */
export const ORCA_CARD_PREVIEW = [
  ORCA_OPENING,
  ORCA_INTERACTION,
  ORCA_MAKING_P1,
  ORCA_MAKING_P2,
  ORCA_PLAYTEST_P1,
].join("\n\n");

export const BUTTER_CHICKEN_INTRO_P1 =
  "A few people have asked me for my Butter Chicken Recipe and I don't know where else to put it, so why not here.";

export const BUTTER_CHICKEN_INTRO_P2 =
  "Before you read the ingredients, note that this is a vibes-based recipe: the ingredients are correct, but the amounts may vary. Increase the Kashmiri red chili powder if you want more heat, and if anything doesn't taste right, it's usually salt or butter. The key insight I've learned on my butter chicken journey is that the taste scales linearly with how much butter you put in it.";

/** Card fades into the Ingredients heading the same way the article does. */
export const BUTTER_CHICKEN_CARD_PREVIEW = [
  BUTTER_CHICKEN_INTRO_P1,
  BUTTER_CHICKEN_INTRO_P2,
  "Ingredients:",
].join("\n\n");

/** Recorder is a live prototype page with no written article; caption only. */
export const RECORDER_CARD_CAPTION =
  "I wanted to make something cool from a mundane task.";
