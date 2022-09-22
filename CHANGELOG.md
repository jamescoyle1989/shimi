# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## Unreleased

### Added

- ChordProgression classes


## 1.0.2 (2022-09-20)

### Added

- Project changelog file

- Project badges

### Fixed

- ControlChangeMessage.duplicate() no longer produces a NotePressureMessage


## 1.0.1 (2022-09-12)

### Fixed

- Many of the project Dependencies should actually have been DevDependencies



## 1.0.0 (2022-09-12)

### Fixed

- Dependencies updated to latest versions.



## 0.8.2 (2022-09-03)

### Added

- Project keywords.



## 0.8.1 (2022-09-01)

### Fixed

- Linked project to git repo



## 0.8.0 (2022-08-24)

### Added

- TickSender



## 0.7.0 (2022-08-20)

### Added

- TickMessage & TickReceiver
- SongPositionMessage



## 0.6.0 (2022-08-08)

### Added

- Tween classes

### Changed

- Clip & ClipPlayer classes now no longer support custom functions for changing note velocities, bends, and control changes over time. They now support tweens instead.



## 0.5.7 (2022-08-04)

### Added

- ClipRecord can optionally take a null beatCount, in which case it calculates the output clip duration when recording has finished.

### Fixed

- ClipRecorder unsubscribes from all MIDI messages once finished recording.

- ClipPlayer references IMetronome instead of Metronome.



## 0.5.6 (2022-07-25)

### Added

- withRef method on ShimiHandler, for nicer syntax adding refs to event handlers.

- tempoMultiplier property on IMetronome, for defining tempos in terms of note values other than quarter notes.



## 0.5.5 (2022-07-21)

### Changed

- Scale.degree method changed to work relative to scale root. Previous functionality preserved in degreeInOctave method.

- ScaleTemplate.major.create(6) will prefer to use G♭ rather than F♯.




## 0.5.4 (2022-07-17)

### Added

- withRef method added to IClockChild, for nicer syntax adding refs.

### Fixed

- WebSynth.finish ends all currently playing notes.



## 0.5.3 (2022-17-16)

### Added

- Library now on unpkg

### Changed

- ScaleTemplate now explicitly contains 0, representing the scale root, rather than it being implicitly understood that a scale would contain its own root.



## 0.5.2 (2022-06-18)

### Changed

- ChordSuggester now called ChordFinder



## 0.5.1 (2022-06-18)

### Added

- Project README

- Project LICENSE

- Project documentation with TypeDoc

- WebSynth

### Changed

- Removed PitchBuilder class, added near method to number prototype instead.

- Midi message classes now no longer contained within their own 'messages' namespace.

### Fixed

- Websynth oscillators won't keep running for a note once that note has been stopped if there's another note that's been started since, with the same pitch & channel.



## 0.5.0 (2022-05-19)

### Added

- Repeat classes

- pitch method

- degree & pitchesInRange methods on Scale class.

- suppressPortValidationErrors property on MidiOut.

### Fixed

- Use of proper sharp and flat symbols in ChordSuggester.

- ClipPlayer immediately stops playing notes that have been removed from the clip.



## 0.4.1 (2022-04-03)

### Changed

- Webpack minimizer preserves class names.

- Metronome more rigidly enforces tempo parameter being set.

- MidiIn supports port changes.

- Improved logic for getting pitch names in scale.



## 0.4.0 (2022-02-15)

### Added

- Arpeggio & Arpeggiator classes

- Chord.getPitch method

### Changed

- ChordSuggester supports customising which chords it will recognise.



## 0.3.2 (2022-01-09)

### Fixed

- MidiIn receiving messages properly from port



## 0.3.1 (2022-01-08)

### Fixed

- Fix for how webpack outputs the library.



## 0.3.0 (2022-01-08)

### Added

- SliderInput classes

- Gamepads classes

- PS4Controller class

- ShimiHandler class

- ChordSuggester class

- duplicate, quantize, transpose, invert & reverse methods added to Clip

- Chord.fitPitch supports various levels of tightness in pitch fitting.

### Changed

- MidiOut sends NOTE ON message as soon as note object is added to it, rather than on next update cycle.

- ButtonInput takes numerical value, rather than boolean.



## 0.2.2 (2021-11-28)

### Added

- Chord class

- MidiIn class

- MidiBus class

- ClipRecorder class

- Scale.getPitchName supports including octave in result

- Scale.fitPitch method

### Changed

- Added MidiOut.sendMessage method, to replace individual methods that supported each message type separately.

- Each midi message class handles its own validation and conversion into a byte array.



## RIP 0.1.1 - 0.2.1, we hardly knew ye



## 0.1.0 (2021-10-29)

### Added

- Initial setup