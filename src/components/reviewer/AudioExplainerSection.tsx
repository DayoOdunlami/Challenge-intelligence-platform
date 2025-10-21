"use client";

import { useState, useRef } from "react";
import { Play, Pause, Download, FileText, Volume2 } from "lucide-react";
import { StaggeredItem } from "../animations/ReviewerAnimations";

export function AudioExplainerSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(300); // 5 minutes
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const chapters = [
    { time: 0, label: "Vision Hook", duration: 45 },
    { time: 45, label: "The Problem", duration: 60 },
    { time: 105, label: "Our Solution", duration: 60 },
    { time: 165, label: "Why CPC", duration: 60 },
    { time: 225, label: "Impact & Future", duration: 45 },
    { time: 270, label: "Call to Action", duration: 30 }
  ];

  const transcript = `
Across the UK, thousands of innovators are tackling the same challenges — often without ever realising it.

A local authority tests a new digital twin for flood resilience. A transport agency pilots predictive maintenance. An energy company trials the same idea under a different name.

The ambition is there. The progress is real. But the visibility isn't.

That's where Innovation Atlas comes in.

Innovation Atlas maps the landscape of public challenges and private innovation — showing where efforts overlap, where evidence already exists, and where collaboration could accelerate progress.

It isn't another portal or listing site. It's an intelligence layer — turning data into patterns, and patterns into opportunities.

Each challenge becomes a node on the map. Lines reveal shared needs across sectors — connecting rail with energy, housing with local government, and data with delivery. In seconds, invisible relationships become visible.

At its core, Innovation Atlas is about clarity and connection. It helps buyers see who's already solved similar problems. It helps innovators discover new markets for their proven ideas. And it helps policymakers see how the nation's innovation ecosystem fits together.

This is just the beginning. From today's pilot map, we're building toward a living system — one that learns, updates, and grows as new challenges and solutions appear.

A smarter way to navigate innovation. A faster route from evidence to adoption. A clearer view of how our collective efforts connect.

Because when innovation becomes visible… progress becomes inevitable.

Innovation Atlas — mapping connections that move the UK forward.
  `;

  return (
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Hear the Vision
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Sometimes the best way to understand a vision is to hear it. This audio explainer walks through the Innovation Atlas concept, from invisible connections to inevitable progress.
          </p>
        </div>

        {/* Audio Player */}
        <StaggeredItem>
          <div className="bg-gray-800 rounded-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 bg-cpc-green-600 hover:bg-cpc-green-700 rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </button>
                <div>
                  <h3 className="text-lg font-semibold text-white">Innovation Atlas Vision</h3>
                  <p className="text-gray-400">Mapping connections that move the UK forward</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="relative h-2 bg-gray-700 rounded-full">
                <div 
                  className="absolute top-0 left-0 h-full bg-cpc-green-600 rounded-full transition-all duration-300"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
                {/* Chapter markers */}
                {chapters.map((chapter, idx) => (
                  <div
                    key={idx}
                    className="absolute top-0 w-0.5 h-full bg-gray-500"
                    style={{ left: `${(chapter.time / duration) * 100}%` }}
                  />
                ))}
              </div>
              
              {/* Chapter labels */}
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                {chapters.map((chapter, idx) => (
                  <span key={idx} className="text-center" style={{ width: `${(chapter.duration / duration) * 100}%` }}>
                    {chapter.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">
                    {showTranscript ? 'Hide' : 'Show'} Transcript
                  </span>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <select className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600">
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>
                <a 
                  href="/Audio/ElevenLabs_Across_the_UK,_thousands_of_innovators....mp3"
                  download="Innovation-Atlas-Vision.mp3"
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Download MP3</span>
                </a>
              </div>
            </div>

            {/* Audio element with your actual MP3 file */}
            <audio
              ref={audioRef}
              onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
              onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
              onEnded={() => setIsPlaying(false)}
              preload="metadata"
            >
              <source src="/Audio/ElevenLabs_Across_the_UK,_thousands_of_innovators....mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        </StaggeredItem>

        {/* Transcript */}
        {showTranscript && (
          <StaggeredItem>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Full Transcript
              </h3>
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {transcript}
                </div>
              </div>
            </div>
          </StaggeredItem>
        )}

        {/* Call to Action */}
        <StaggeredItem>
          <div className="mt-8 text-center">
            <p className="text-gray-300 mb-6">
              Ready to explore the interactive prototype?
            </p>
            <button className="bg-cpc-green-600 hover:bg-cpc-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
              Explore the Challenge Map
            </button>
          </div>
        </StaggeredItem>
      </div>
    </div>
  );
}