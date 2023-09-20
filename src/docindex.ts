//This file is used as the entry-point for generating documentation
//It includes interfaces and various other types which I don't
//actually want to include as part of the proper index.ts file

import Arpeggiator from './Arpeggiator';
import { Arpeggio, ArpeggioNote } from './Arpeggio';
import ButtonInput, { ButtonEvent, ButtonEventData } from './ButtonInput';
import Chord from './Chord';
import ChordFinder, { ChordLookupResult } from './ChordFinder';
import ChordProgression, { ChordProgressionChord } from './ChordProgression';
import ChordProgressionPlayer, { ChordEventData, ChordEvent } from './ChordProgressionPlayer';
import { Clip, ClipBend, ClipCC, ClipNote } from './Clip';
import ClipPlayer from './ClipPlayer';
import ClipRecorder, { ClipRecorderEvent, ClipRecorderEventData } from './ClipRecorder';
import Clock, { IClockChild, ClockChildFinishedEvent, ClockChildFinishedEventData } from './Clock';
import Cue, { BeatCue, MsCue, ConditionalCue } from './Cue';
import Drums from './Drums';
import EventSubscriber, { IEventSubscriber } from './EventSubscriber';
import { near } from './Extensions';
import Flexinome from './Flexinome';
import { FitDirection, FitPrecision, IPitchContainer, FitPitchOptions } from './IPitchContainer';
import Gamepads, { IGamepad } from './Gamepads';
import Keyboard from './Keyboard';
import Metronome, { IMetronome } from './Metronome';
import MidiAccess, { MidiAccessPortEvent, MidiAccessPortEventData } from './MidiAccess';
import MidiBus from './MidiBus';
import MidiIn, { MidiInEvent, MidiInEventData, IMidiIn } from './MidiIn';
import { 
    IMidiMessage, NoteOffMessage, NoteOnMessage, 
    NotePressureMessage, ControlChangeMessage, ProgramChangeMessage, 
    ChannelPressureMessage, PitchBendMessage, TickMessage,
    SongPositionMessage, StartMessage, ContinueMessage, StopMessage
} from './MidiMessages';
import MidiOut, { IMidiOut } from './MidiOut';
import MiscController from './MiscController';
import Note from './Note';
import { parsePitch as pitch, toHertz } from './utils';
import PropertyTracker from './PropertyTracker';
import PS4Controller from './PS4Controller';
import Range from './Range';
import Repeat, { ConditionalRepeat, RepeatArgs, MsRepeat, FiniteRepeatArgs, BeatRepeat, BeatRepeatArgs } from './Repeat';
import Scale from './Scale';
import ScaleTemplate from './ScaleTemplate';
import ShimiEvent, { ShimiHandler, ShimiEventData } from './ShimiEvent';
import SliderInput, { SliderEvent, SliderEventData } from './SliderInput';
import TickReceiver from './TickReceiver';
import TickSender from './TickSender';
import TimeSig, { TimeSigDivision } from './TimeSig';
import ToneJSMidiOut, { ToneJSMidiOutChannel } from './ToneJSMidiOut';
import Tween, { 
    ITween, LinearTween, 
    SineInOutTween, SineInTween, SineOutTween, 
    QuadraticInOutTween, QuadraticInTween, QuadraticOutTween,
    CubicInOutTween, CubicInTween, CubicOutTween,
    QuarticInOutTween, QuarticInTween, QuarticOutTween,
    MultiTween, StepsTween } from './Tweens';
import WebAudioMidiOut, { WebAudioMidiOutChannel } from './WebAudioMidiOut';

export {
    Arpeggiator,
    Arpeggio, ArpeggioNote,
    ButtonInput, ButtonEvent, ButtonEventData,
    Chord,
    ChordFinder, ChordLookupResult,
    ChordProgression, ChordProgressionChord,
    ChordProgressionPlayer, ChordEvent, ChordEventData,
    Clip, ClipBend, ClipCC, ClipNote,
    ClipPlayer,
    ClipRecorder, ClipRecorderEvent, ClipRecorderEventData,
    Clock, IClockChild, ClockChildFinishedEvent, ClockChildFinishedEventData,
    Cue, BeatCue, MsCue, ConditionalCue,
    Drums,
    EventSubscriber, IEventSubscriber,
    near,
    Flexinome,
    FitDirection, FitPrecision, IPitchContainer, FitPitchOptions,
    Gamepads, IGamepad,
    Keyboard,
    IMidiMessage, NoteOffMessage, NoteOnMessage, 
        NotePressureMessage, ControlChangeMessage, ProgramChangeMessage, 
        ChannelPressureMessage, PitchBendMessage, TickMessage,
        SongPositionMessage, StartMessage, ContinueMessage, StopMessage,
    Metronome, IMetronome,
    MidiAccess, MidiAccessPortEvent, MidiAccessPortEventData,
    MidiBus,
    MidiIn, MidiInEvent, MidiInEventData, IMidiIn,
    MidiOut, IMidiOut,
    MiscController,
    Note,
    pitch, toHertz,
    PropertyTracker,
    PS4Controller,
    Range,
    Repeat, ConditionalRepeat, RepeatArgs, MsRepeat, FiniteRepeatArgs, BeatRepeat, BeatRepeatArgs, 
    Scale,
    ScaleTemplate,
    ShimiEvent, ShimiHandler, ShimiEventData,
    SliderInput, SliderEvent, SliderEventData,
    TickReceiver,
    TickSender,
    TimeSig, TimeSigDivision,
    ToneJSMidiOut, ToneJSMidiOutChannel,
    Tween, ITween, LinearTween, MultiTween, StepsTween, 
        SineInOutTween, SineInTween, SineOutTween, 
        QuadraticInOutTween, QuadraticInTween, QuadraticOutTween,
        CubicInOutTween, CubicInTween, CubicOutTween,
        QuarticInOutTween, QuarticInTween, QuarticOutTween,
    WebAudioMidiOut, WebAudioMidiOutChannel
}