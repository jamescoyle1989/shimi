# Shimi

![logo](https://raw.githubusercontent.com/jamescoyle1989/shimi/master/assets/logo180px.png)


## Overview

Shimi is a lightweight javascript MIDI library.

It came out of a desire to easily build new and experimental MIDI instruments out of user input devices, though it can be used for much more than just that.

The library provides an easy, modular way to build up music systems, providing classes for metronomes, scales, chords, clips, arpeggios, and more. 

It includes its own wrapper around the WebAudio API, for generating sounds from MIDI messages in the browser. It can just as easily send and receive MIDI messages to/from external devices and software.


## Example

Here is a simple example, using shimi with loopMIDI to play the start of 'Twinkle Twinkle Little Star' every time the user presses the spacebar:

```
async function run() {
    const midiAccess = await shimi.MidiAccess.request();
    const midiPort = midiAccess.getOutPort('loopMIDI Port');
    const midiOut = new shimi.MidiOut(midiPort);

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
        new shimi.ClipNote(0, 1, shimi.pitch('C4'), 80),
        new shimi.ClipNote(1, 1, shimi.pitch('C4'), 80),
        new shimi.ClipNote(2, 1, shimi.pitch('G4'), 80),
        new shimi.ClipNote(3, 1, shimi.pitch('G4'), 80),
        new shimi.ClipNote(4, 1, shimi.pitch('A4'), 80),
        new shimi.ClipNote(5, 1, shimi.pitch('A4'), 80),
        new shimi.ClipNote(6, 2, shimi.pitch('G4'), 80)
    );
	
    //Start a new playthrough of the clip each time the spacebar is pressed
    keyboard.space.pressed.add(() => {
        const clipPlayer = new shimi.ClipPlayer(clip, metronome, midiOut);
        clipPlayer.beatCount = clip.duration;
        clock.addChild(clipPlayer);
    });
}
run();
```


## Install
```
$ npm install shimi
```


## Documentation

See the full technical documentation here: https://jamescoyle1989.github.io/shimi/modules.html