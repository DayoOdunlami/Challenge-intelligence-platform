'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, FileText, Shield, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getGuardrails, updateGuardrails, resetGuardrails, defaultGuardrails, AIGuardrails } from '@/config/ai-guardrails';
import { searchKnowledgeBase, getKnowledgeBaseByCategory } from '@/lib/knowledge-base-search';

export default function AIAdminPage() {
  const [guardrails, setGuardrails] = useState<AIGuardrails>(defaultGuardrails);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'guardrails' | 'knowledge'>('guardrails');

  useEffect(() => {
    const current = getGuardrails();
    setGuardrails(current);
    setSystemPrompt(current.systemPrompt);
  }, []);

  const handleSave = () => {
    const updated = updateGuardrails({
      ...guardrails,
      systemPrompt,
    });
    setGuardrails(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all guardrails to defaults? This cannot be undone.')) {
      const reset = resetGuardrails();
      setGuardrails(reset);
      setSystemPrompt(reset.systemPrompt);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleAddAllowedTopic = () => {
    const topic = prompt('Enter allowed topic:');
    if (topic) {
      setGuardrails({
        ...guardrails,
        allowedTopics: [...guardrails.allowedTopics, topic],
      });
    }
  };

  const handleRemoveAllowedTopic = (topic: string) => {
    setGuardrails({
      ...guardrails,
      allowedTopics: guardrails.allowedTopics.filter(t => t !== topic),
    });
  };

  const handleAddRestrictedTopic = () => {
    const topic = prompt('Enter restricted topic:');
    if (topic) {
      setGuardrails({
        ...guardrails,
        restrictedTopics: [...guardrails.restrictedTopics, topic],
      });
    }
  };

  const handleRemoveRestrictedTopic = (topic: string) => {
    setGuardrails({
      ...guardrails,
      restrictedTopics: guardrails.restrictedTopics.filter(t => t !== topic),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#006E51] mb-2">AI Configuration</h1>
          <p className="text-gray-600">
            Manage AI assistant guardrails, system prompts, and knowledge base settings
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('guardrails')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'guardrails'
                ? 'border-[#006E51] text-[#006E51]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Shield className="inline h-4 w-4 mr-2" />
            Guardrails & Prompts
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'knowledge'
                ? 'border-[#006E51] text-[#006E51]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="inline h-4 w-4 mr-2" />
            Knowledge Base
          </button>
        </div>

        {/* Guardrails Tab */}
        {activeTab === 'guardrails' && (
          <div className="space-y-6">
            {/* System Prompt */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">System Prompt</h2>
                <span className="text-xs text-gray-500">
                  {systemPrompt.length} characters
                </span>
              </div>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#006E51]"
                placeholder="Enter system prompt..."
              />
              <p className="mt-2 text-xs text-gray-500">
                This prompt defines the AI assistant's role, capabilities, and behavior. Update it to change how the AI responds.
              </p>
            </div>

            {/* Allowed Topics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Allowed Topics</h2>
                <Button
                  onClick={handleAddAllowedTopic}
                  size="sm"
                  className="bg-[#006E51] hover:bg-[#005A42] text-white"
                >
                  + Add Topic
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {guardrails.allowedTopics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {topic}
                    <button
                      onClick={() => handleRemoveAllowedTopic(topic)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Restricted Topics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Restricted Topics</h2>
                <Button
                  onClick={handleAddRestrictedTopic}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  + Add Topic
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {guardrails.restrictedTopics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                  >
                    {topic}
                    <button
                      onClick={() => handleRemoveRestrictedTopic(topic)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* OpenAI Configuration */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">OpenAI Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <select
                    value={guardrails.model}
                    onChange={(e) =>
                      setGuardrails({
                        ...guardrails,
                        model: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006E51]"
                  >
                    <option value="gpt-4o">GPT-4o (Recommended)</option>
                    <option value="gpt-4o-mini">GPT-4o Mini (Faster, Lower Cost)</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Legacy)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    GPT-4o is recommended for best quality. GPT-4o Mini is faster and cheaper for testing.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperature: {guardrails.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={guardrails.temperature}
                    onChange={(e) =>
                      setGuardrails({
                        ...guardrails,
                        temperature: parseFloat(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.0 (Focused)</span>
                    <span>1.0 (Balanced)</span>
                    <span>2.0 (Creative)</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Lower values (0.0-0.7) = more focused and consistent. Higher values (0.8-2.0) = more creative and varied.
                    Default: 0.7 (balanced).
                  </p>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tone
                  </label>
                  <select
                    value={guardrails.tone}
                    onChange={(e) =>
                      setGuardrails({
                        ...guardrails,
                        tone: e.target.value as AIGuardrails['tone'],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006E51]"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="technical">Technical</option>
                    <option value="conversational">Conversational</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Context Length (tokens)
                  </label>
                  <input
                    type="number"
                    value={guardrails.maxContextLength}
                    onChange={(e) =>
                      setGuardrails({
                        ...guardrails,
                        maxContextLength: parseInt(e.target.value) || 8000,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006E51]"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={guardrails.citationRequired}
                      onChange={(e) =>
                        setGuardrails({
                          ...guardrails,
                          citationRequired: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-[#006E51] border-gray-300 rounded focus:ring-[#006E51]"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Require Citations
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={handleSave}
                className="bg-[#006E51] hover:bg-[#005A42] text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {saved ? 'Saved!' : 'Save Changes'}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </div>
        )}

        {/* Knowledge Base Tab */}
        {activeTab === 'knowledge' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Knowledge Base Entries</h2>
              <p className="text-gray-600 mb-6">
                The knowledge base is currently stored in markdown files. To update content, edit the files in{' '}
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">src/data/knowledge-base/</code>
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Policy Documents</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {getKnowledgeBaseByCategory('policy').length} entries
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Stakeholder Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {getKnowledgeBaseByCategory('stakeholder').length} entries
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Technology Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {getKnowledgeBaseByCategory('technology').length} entries
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Statistics & Data</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {getKnowledgeBaseByCategory('statistics').length} entries
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> In a production environment, you would implement a database-backed
                  knowledge base with a full CRUD interface here. For now, knowledge base content is managed
                  through markdown files in the codebase.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

