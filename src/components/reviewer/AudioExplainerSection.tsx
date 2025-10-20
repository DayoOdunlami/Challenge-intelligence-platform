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
[0:00 - 0:45] Vision Hook
Imagine if every infrastructure challenge in the UK was visible on one map. Not just the tenders and grants you already know about, but the patterns hiding in plain sight. The energy sector solving the same predictive maintenance problem as rail. Local authorities each reinventing net-zero retrofits. Innovations proven in one sector, invisible to another that desperately needs them.

This isn't a fantasy. The data exists. The patterns are real. What's missing is the intelligence layer to make them visible.

[0:45 - 1:45] The Problem
Right now, UK innovation procurement is fragmented across dozens of portals. Contracts Finder shows you legal notices. Innovate UK connects grant recipients. SBRI runs sector-specific challenges. Each serves its purpose, but none reveal the bigger picture.

The result? Buyers pay for the same innovation multiple times. SMEs miss adjacent opportunities. Policymakers can't see where innovation adoption is efficient or wasteful. Evidence proven in one sector stays trapped there, even when other sectors face identical challenges.

We're not just missing opportunities—we're systematically duplicating effort while leaving gaps unfilled.

[1:45 - 2:45] Our Solution
The Innovation Exchange Platform is the intelligence layer the UK has never had. We don't replace existing portals—we make sense of them.

Using AI-powered similarity detection, we map challenges across sectors, revealing patterns invisible to keyword search. Our interactive visualizations show buyers which sectors share their problems and which innovations could serve multiple markets.

For SMEs, it's like having a research team that spots every adjacent opportunity. For buyers, it's market intelligence that prevents reinventing the wheel. For policymakers, it's the first comprehensive view of how innovation flows—or fails to flow—across the UK economy.

[2:45 - 3:45] Why CPC
This isn't just a technical challenge—it's a trust challenge. Buyers need to believe cross-sector evidence is credible. SMEs need neutral ground where they're not competing with the platform owner.

Connected Places Catapult is uniquely positioned because we're the only organization with deep relationships across rail, energy, transport, local government, and built environment. We're trusted by both buyers and SMEs because we have no commercial agenda—our mission is accelerating innovation adoption.

Private companies lack neutrality. Government departments lack agility. Industry bodies lack technical capability. CPC has the unique combination of trust, reach, and expertise this requires.

[3:45 - 4:30] Impact & Future
Phase 1 proves the thesis with challenge intelligence. Phase 2 adds innovation matching. Phase 3 enables evidence transfer—the holy grail where validation in one sector reduces risk in another.

The long-term vision? A UK where innovation adoption is efficient, where good solutions spread quickly across sectors, where we stop solving the same problems in isolation.

This isn't just about better procurement. It's about accelerating the innovations we need for net-zero, leveling up, and economic growth.

[4:30 - 5:00] Call to Action
We've built the prototype. We've stress-tested the risks. We've defined clear success criteria for Phase 1.

The question isn't whether this is technically possible—we've proven that. The question is whether the UK is ready to make innovation adoption more intelligent.

We believe it is. The data is waiting. The patterns are there. All we need is the mandate to make them visible.

Thank you for considering our proposal. The future of UK innovation intelligence starts here.
  `;

  return (
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Hear the Vision in 5 Minutes
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Sometimes the best way to understand a vision is to hear it. This 5-minute audio explainer walks through the entire concept, from problem to solution to impact.
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
                  <h3 className="text-lg font-semibold text-white">Innovation Exchange Platform</h3>
                  <p className="text-gray-400">The Google Maps for UK Innovation</p>
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
                <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200">
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Download MP3</span>
                </button>
              </div>
            </div>

            {/* Hidden audio element - in production this would have the actual audio file */}
            <audio
              ref={audioRef}
              onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
              onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
              onEnded={() => setIsPlaying(false)}
            >
              {/* In production, add actual audio source */}
              {/* <source src="/audio/innovation-exchange-explainer.mp3" type="audio/mpeg" /> */}
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