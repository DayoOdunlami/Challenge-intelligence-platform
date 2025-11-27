'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Play, 
  RotateCcw, 
  Settings,
  Network,
  TrendingUp,
  Database,
} from 'lucide-react';

/**
 * Funding Flows Admin Page
 * 
 * State Machine for Scenario Management:
 * 
 * ┌─────────────┐
 * │   BASELINE  │ ◄──┐
 * │  (Initial)  │    │
 * └──────┬──────┘    │
 *        │           │
 *        ▼           │
 * ┌─────────────┐    │
 * │  EDITING    │    │
 * │ (Modified)  │    │
 * └──────┬──────┘    │
 *        │           │
 *        ├──► Save ──┼──►┌─────────────┐
 *        │           │   │   SAVED     │
 *        │           │   │  SCENARIO   │
 *        │           │   └──────┬──────┘
 *        │           │          │
 *        │           │          ▼
 *        │           │   ┌─────────────┐
 *        └──► Reset ─┴──►│  SIMULATING │
 *                        │  (Running)  │
 *                        └──────┬──────┘
 *                               │
 *                               ▼
 *                        ┌─────────────┐
 *                        │  RESULTS    │
 *                        │  (Viewing)  │
 *                        └──────┬──────┘
 *                               │
 *                               └──► Back to BASELINE
 */

type ScenarioState = 'baseline' | 'editing' | 'saved' | 'simulating' | 'results';

interface Scenario {
  id: string;
  name: string;
  description: string;
  state: ScenarioState;
  adjustments: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export default function FundingFlowsAdminPage() {
  const [currentState, setCurrentState] = useState<ScenarioState>('baseline');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});

  // State machine transitions
  const transitionTo = (newState: ScenarioState) => {
    // Validate transitions
    const validTransitions: Record<ScenarioState, ScenarioState[]> = {
      baseline: ['editing'],
      editing: ['baseline', 'saved', 'simulating'],
      saved: ['editing', 'simulating'],
      simulating: ['results', 'baseline'],
      results: ['baseline', 'editing'],
    };

    if (validTransitions[currentState]?.includes(newState)) {
      setCurrentState(newState);
      if (newState === 'simulating') {
        // Simulate with a delay
        setTimeout(() => {
          setCurrentState('results');
        }, 2000);
      }
    } else {
      console.warn(`Invalid transition from ${currentState} to ${newState}`);
    }
  };

  const handleSave = () => {
    const newScenario: Scenario = {
      id: `scenario-${Date.now()}`,
      name: `Scenario ${scenarios.length + 1}`,
      description: 'Custom funding scenario',
      state: 'saved',
      adjustments: { ...adjustments },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setScenarios([...scenarios, newScenario]);
    setSelectedScenario(newScenario);
    transitionTo('saved');
  };

  const handleReset = () => {
    setAdjustments({});
    setCurrentState('baseline');
  };

  const handleSimulate = () => {
    transitionTo('simulating');
  };

  const getStateColor = (state: ScenarioState) => {
    const colors = {
      baseline: 'bg-gray-100 text-gray-700',
      editing: 'bg-yellow-100 text-yellow-700',
      saved: 'bg-blue-100 text-blue-700',
      simulating: 'bg-purple-100 text-purple-700',
      results: 'bg-green-100 text-green-700',
    };
    return colors[state];
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Funding Flows Administration</h1>
        <p className="text-gray-600">
          Manage funding flows, create scenarios, and simulate "what-if" analyses
        </p>
      </div>

      {/* State Machine Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Scenario State Machine
          </CardTitle>
          <CardDescription>
            Current state: <Badge className={getStateColor(currentState)}>{currentState}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* State Diagram (Visual Representation) */}
            <div className="grid grid-cols-5 gap-4 p-6 bg-gray-50 rounded-lg">
              {/* BASELINE */}
              <div className={`p-4 rounded-lg border-2 ${
                currentState === 'baseline' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}>
                <div className="text-center">
                  <div className="font-semibold mb-1">BASELINE</div>
                  <div className="text-xs text-gray-500">Initial State</div>
                </div>
              </div>

              {/* EDITING */}
              <div className={`p-4 rounded-lg border-2 ${
                currentState === 'editing' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'
              }`}>
                <div className="text-center">
                  <div className="font-semibold mb-1">EDITING</div>
                  <div className="text-xs text-gray-500">Modified</div>
                </div>
              </div>

              {/* SAVED */}
              <div className={`p-4 rounded-lg border-2 ${
                currentState === 'saved' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}>
                <div className="text-center">
                  <div className="font-semibold mb-1">SAVED</div>
                  <div className="text-xs text-gray-500">Scenario</div>
                </div>
              </div>

              {/* SIMULATING */}
              <div className={`p-4 rounded-lg border-2 ${
                currentState === 'simulating' ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
              }`}>
                <div className="text-center">
                  <div className="font-semibold mb-1">SIMULATING</div>
                  <div className="text-xs text-gray-500">Running</div>
                </div>
              </div>

              {/* RESULTS */}
              <div className={`p-4 rounded-lg border-2 ${
                currentState === 'results' ? 'border-green-500 bg-green-50' : 'border-gray-300'
              }`}>
                <div className="text-center">
                  <div className="font-semibold mb-1">RESULTS</div>
                  <div className="text-xs text-gray-500">Viewing</div>
                </div>
              </div>
            </div>

            {/* State Machine Rules */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Valid Transitions:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• BASELINE → EDITING (start editing)</li>
                <li>• EDITING → BASELINE (reset)</li>
                <li>• EDITING → SAVED (save scenario)</li>
                <li>• EDITING → SIMULATING (run simulation)</li>
                <li>• SAVED → EDITING (edit saved scenario)</li>
                <li>• SAVED → SIMULATING (run simulation)</li>
                <li>• SIMULATING → RESULTS (simulation complete)</li>
                <li>• SIMULATING → BASELINE (cancel simulation)</li>
                <li>• RESULTS → BASELINE (return to baseline)</li>
                <li>• RESULTS → EDITING (create new scenario)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Admin Interface */}
      <Tabs defaultValue="scenarios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scenarios" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Scenarios
          </TabsTrigger>
          <TabsTrigger value="entities" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Entities
          </TabsTrigger>
          <TabsTrigger value="flows" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Funding Flows
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => transitionTo('editing')}
                  disabled={currentState === 'editing' || currentState === 'simulating'}
                >
                  Start Editing
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={currentState !== 'editing'}
                  variant="outline"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Scenario
                </Button>
                <Button
                  onClick={handleSimulate}
                  disabled={currentState !== 'editing' && currentState !== 'saved'}
                  variant="outline"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Simulate
                </Button>
                <Button
                  onClick={handleReset}
                  disabled={currentState === 'baseline' || currentState === 'simulating'}
                  variant="outline"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>

              {/* Adjustments Editor (shown when editing) */}
              {(currentState === 'editing' || currentState === 'saved') && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Funding Adjustments</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">UKRI Allocation</label>
                      <input
                        type="range"
                        min={0}
                        max={200}
                        step={5}
                        value={adjustments['ukri'] || 100}
                        onChange={(e) => setAdjustments({ ...adjustments, ukri: parseInt(e.target.value) })}
                        className="w-full mt-1"
                      />
                      <div className="text-xs text-gray-500 text-right">
                        {adjustments['ukri'] || 100}%
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">ATI Programme</label>
                      <input
                        type="range"
                        min={0}
                        max={200}
                        step={5}
                        value={adjustments['ati'] || 100}
                        onChange={(e) => setAdjustments({ ...adjustments, ati: parseInt(e.target.value) })}
                        className="w-full mt-1"
                      />
                      <div className="text-xs text-gray-500 text-right">
                        {adjustments['ati'] || 100}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Saved Scenarios List */}
              {scenarios.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Saved Scenarios</h4>
                  <div className="space-y-2">
                    {scenarios.map((scenario) => (
                      <div
                        key={scenario.id}
                        className="border rounded-lg p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedScenario(scenario);
                          setAdjustments(scenario.adjustments);
                          transitionTo('saved');
                        }}
                      >
                        <div>
                          <div className="font-medium">{scenario.name}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(scenario.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge>{scenario.state}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Simulation Results */}
              {currentState === 'results' && (
                <div className="border rounded-lg p-4 bg-green-50">
                  <h4 className="font-semibold mb-2">Simulation Results</h4>
                  <p className="text-sm text-gray-600">
                    Simulation completed. Results would be displayed here with:
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• Updated funding flows</li>
                    <li>• Projected outcomes</li>
                    <li>• Impact metrics</li>
                    <li>• Comparison with baseline</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entities">
          <Card>
            <CardHeader>
              <CardTitle>Entity Management</CardTitle>
              <CardDescription>
                Manage harmonized entities shared between Stakeholder Dynamics and Innovation Tracker
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Entity management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flows">
          <Card>
            <CardHeader>
              <CardTitle>Funding Flows Management</CardTitle>
              <CardDescription>
                Edit funding flow data, add evidence sources, and update figures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Funding flows management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

