//This file is used as the entry-point for generating documentation
//It includes interfaces and various other types which I don't
//actually want to include as part of the proper index.ts file

import Arpeggiator from './Arpeggiator';
import { Arpeggio, ArpeggioNote } from './Arpeggio';
import ButtonInput, { ButtonEvent, ButtonEventData } from './ButtonInput';
import Chord from './Chord';
import ChordSuggester, { ChordLookupData, ChordLookupResult } from './ChordSuggester';
import { Clip, ClipBend, ClipCC, ClipNote } from './Clip';
import ClipPlayer from './ClipPlayer';
import ClipRecorder, { ClipRecorderEvent, ClipRecorderEventData } from './ClipRecorder';
import Clock, { IClockChild } from './Clock';
import Cue, { BeatCue, MsCue, ConditionalCue } from './Cue';
import EventSubscriber, { IEventSubscriber } from './EventSubscriber';
import Flexinome from './Flexinome';
import { FitDirection, FitPrecision, IPitchContainer, FitPitchOptions } from './IPitchContainer';
import Gamepads, { IGamepad } from './Gamepads';
import Keyboard from './Keyboard';
import Metronome, { IMetronome } from './Metronome';
import MidiAccess from './MidiAccess';
import MidiBus from './MidiBus';
import MidiIn, { MidiInEvent, MidiInEventData, IMidiIn } from './MidiIn';
import { 
    IMidiMessage, MidiMessageBase, NoteOffMessage, NoteOnMessage, 
    NotePressureMessage, ControlChangeMessage, ProgramChangeMessage, 
    ChannelPressureMessage, PitchBendMessage 
} from './MidiMessages';
import MidiOut, { IMidiOut } from './MidiOut';
import Note from './Note';
import { parsePitch as pitch } from './utils';
import PropertyTracker from './PropertyTracker';
import PS4Controller from './PS4Controller';
import Scale, { PitchBuilder } from './Scale';
import ScaleTemplate from './ScaleTemplate';
import SliderInput, { SliderEvent, SliderEventData } from './SliderInput';
import TimeSig, { TimeSigDivision } from './TimeSig';
import WebSynth, { WebSynthChannel, IWebSynthChannel } from './WebSynth';

export {
    Arpeggiator,
    Arpeggio, ArpeggioNote,
    ButtonInput, ButtonEvent, ButtonEventData,
    Chord,
    ChordSuggester, ChordLookupData, ChordLookupResult,
    Clip, ClipBend, ClipCC, ClipNote,
    ClipPlayer,
    ClipRecorder, ClipRecorderEvent, ClipRecorderEventData,
    Clock, IClockChild,
    Cue, BeatCue, MsCue, ConditionalCue,
    EventSubscriber, IEventSubscriber,
    Flexinome,
    FitDirection, FitPrecision, IPitchContainer, FitPitchOptions,
    Gamepads, IGamepad,
    Keyboard,
    IMidiMessage, MidiMessageBase, NoteOffMessage, NoteOnMessage, 
    NotePressureMessage, ControlChangeMessage, ProgramChangeMessage, 
    ChannelPressureMessage, PitchBendMessage,
    Metronome, IMetronome,
    MidiAccess,
    MidiBus,
    MidiIn, MidiInEvent, MidiInEventData, IMidiIn,
    MidiOut, IMidiOut,
    Note,
    pitch,
    PropertyTracker,
    PS4Controller,
    Scale, PitchBuilder,
    ScaleTemplate,
    SliderInput, SliderEvent, SliderEventData,
    TimeSig, TimeSigDivision,
    WebSynth, WebSynthChannel, IWebSynthChannel
}