# Shimi

![logo](https://raw.githubusercontent.com/jamescoyle1989/shimi/master/assets/logo180px.png)


![GitHub](https://img.shields.io/github/license/jamescoyle1989/shimi)
![npm bundle size](https://img.shields.io/bundlephobia/min/shimi)
![GitHub package.json version](https://img.shields.io/github/package-json/v/jamescoyle1989/shimi)
![GitHub last commit](https://img.shields.io/github/last-commit/jamescoyle1989/shimi)
![npm](https://img.shields.io/npm/dw/shimi)
![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/jamescoyle1989/shimi)
![CircleCI](https://img.shields.io/circleci/build/github/jamescoyle1989/shimi)
[![Coverage Status](https://coveralls.io/repos/github/jamescoyle1989/shimi/badge.svg?branch=master)](https://coveralls.io/github/jamescoyle1989/shimi?branch=master)

## Overview

Shimi is a lightweight javascript MIDI library.

It came out of a desire to easily build new and experimental MIDI instruments out of user input devices, though it can be used for much more than just that.

The library provides an easy, modular way to build up music systems, providing classes for metronomes, scales, chords, clips, arpeggios, and more. 

It includes its own wrapper around the WebAudio API, for generating sounds from MIDI messages in the browser. It can just as easily send and receive MIDI messages to/from external devices and software.


## Example

Here is a simple example, using shimi to play the start of 'Twinkle Twinkle Little Star' every time the user presses the spacebar:

```
<script src="https://unpkg.com/shimi"></script>
<script>
function run() {
    const midiOut = new shimi.WebSynth(new AudioContext()).withDefaultChannels();

    const keyboard = new shimi.Keyboard(new shimi.EventSubscriber(document));
    keyboard.activate();
	
    const metronome = new shimi.Metronome(120);

    const clock = new shimi.Clock();
    clock.children.push(keyboard);
    clock.children.push(metronome);
    clock.children.push(midiOut);
    clock.start();

    //Twinkle Twinkle Little Star
    const clip = new shimi.Clip(8);
    clip.notes.push(
        new shimi.ClipNote(0, 1, 'C4', 80),
        new shimi.ClipNote(1, 1, 'C4', 80),
        new shimi.ClipNote(2, 1, 'G4', 80),
        new shimi.ClipNote(3, 1, 'G4', 80),
        new shimi.ClipNote(4, 1, 'A4', 80),
        new shimi.ClipNote(5, 1, 'A4', 80),
        new shimi.ClipNote(6, 2, 'G4', 80)
    );
	
    //Start a new playthrough of the clip each time the spacebar is pressed
    keyboard.space.pressed.add(() => {
        const clipPlayer = new shimi.ClipPlayer(clip, metronome, midiOut);
        clipPlayer.beatCount = clip.duration;
        clock.addChild(clipPlayer);
    });
}
run();
</script>
```


## Install
```
$ npm install shimi
```

or

```
<script src="https://unpkg.com/shimi"></script>
```


## Documentation

See the full technical documentation here: https://jamescoyle1989.github.io/shimi/modules.html