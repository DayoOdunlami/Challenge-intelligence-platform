"use client";

import { Target, CheckCircle, Clock, AlertTriangle, Users, PoundSterling } from "lucide-react";
import { StaggeredList, StaggeredItem } from "../animations/ReviewerAnimations";
import { phase1MetricsData, phase1ResourcesData, phase1DeliverablesData } from "@/data/reviewerData";

export function Phase1FeasibilitySection() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-50 border-green-200 text-green-800';
      case 'in-progress': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Phase 1 Success Criteria - How We Measure Viability
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Phase 1 is time-boxed (3 months) and scope-limited (challenge intelligence only). Here's exactly what we're building, what success looks like, and when we'd stop.
          </p>
        </div>

        {/* Primary Metric */}
        <StaggeredItem>
          <div className="mb-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8">
            <div className="flex items-center mb-4">
              <Target className="w-8 h-8 mr-3" />
              <h3 className="text-2xl font-bold">Primary Success Metric</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold mb-2">{phase1MetricsData.primary.metric}</h4>
                <p className="text-blue-100 mb-4">{phase1MetricsData.primary.target}</p>
                <div className="bg-blue-800/50 rounded p-3">
                  <div className="text-sm font-medium mb-1">Why This Matters</div>
                  <div className="text-sm text-blue-100">{phase1MetricsData.primary.why}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-blue-800/50 rounded p-3">
                  <div className="text-sm font-medium mb-1">Measurement Method</div>
                  <div className="text-sm text-blue-100">{phase1MetricsData.primary.measurement}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-yellow-600 rounded p-3 text-center">
                    <div className="text-lg font-bold">{phase1MetricsData.primary.passThreshold}</div>
                    <div className="text-xs">Pass Threshold</div>
                  </div>
                  <div className="bg-green-600 rounded p-3 text-center">
                    <div className="text-lg font-bold">{phase1MetricsData.primary.excellenceThreshold}</div>
                    <div className="text-xs">Excellence</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </StaggeredItem>

        {/* Secondary Metrics */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Secondary Success Metrics</h3>
          <StaggeredList className="grid md:grid-cols-2 gap-6">
            {phase1MetricsData.secondary.map((metric, idx) => (
              <StaggeredItem key={idx}>
                <div className="bg-white border border-gray-200 rounded-lg p-6 h-full">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{metric.metric}</h4>
                  <p className="text-gray-700 mb-3">{metric.target}</p>
                  <div className="space-y-2">
                    <div className="bg-green-50 border border-green-200 rounded p-2">
                      <div className="text-xs font-medium text-green-800 mb-1">CURRENT STATUS</div>
                      <div className="text-sm text-green-700">{metric.current}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-2">
                      <div className="text-xs font-medium text-blue-800 mb-1">WHY IT MATTERS</div>
                      <div className="text-sm text-blue-700">{metric.why}</div>
                    </div>
                  </div>
                </div>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </div>

        {/* Failure Threshold */}
        <StaggeredItem>
          <div className="mb-12 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-xl font-bold text-red-900">Clear Exit Criteria</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Failure Trigger</h4>
                <p className="text-sm text-red-700">{phase1MetricsData.failureThreshold.trigger}</p>
              </div>
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Our Action</h4>
                <p className="text-sm text-red-700">{phase1MetricsData.failureThreshold.action}</p>
              </div>
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Why This Matters</h4>
                <p className="text-sm text-red-700">{phase1MetricsData.failureThreshold.why}</p>
              </div>
            </div>
          </div>
        </StaggeredItem>

        {/* Resource Breakdown */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Resource Breakdown</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <StaggeredItem>
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Timeline</h4>
                <p className="text-2xl font-bold text-blue-600">{phase1ResourcesData.timeline}</p>
              </div>
            </StaggeredItem>
            <StaggeredItem>
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <PoundSterling className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Total Investment</h4>
                <p className="text-2xl font-bold text-green-600">{phase1ResourcesData.totalInvestment}</p>
              </div>
            </StaggeredItem>
            <StaggeredItem>
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Person Days</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {phase1ResourcesData.breakdown.cpcInternal.personDays + phase1ResourcesData.breakdown.external.personDays}
                </p>
              </div>
            </StaggeredItem>
          </div>

          {/* Detailed Breakdown */}
          <StaggeredList className="mt-8 grid md:grid-cols-2 gap-6">
            <StaggeredItem>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-4">CPC Internal ({phase1ResourcesData.breakdown.cpcInternal.cost})</h4>
                <div className="space-y-3">
                  {phase1ResourcesData.breakdown.cpcInternal.roles.map((role, idx) => (
                    <div key={idx} className="bg-white rounded p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-900">{role.role}</span>
                        <span className="text-sm text-blue-600 font-medium">{role.days} days</span>
                      </div>
                      <p className="text-sm text-gray-600">{role.activities}</p>
                    </div>
                  ))}
                </div>
              </div>
            </StaggeredItem>
            <StaggeredItem>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-green-900 mb-4">External Partners ({phase1ResourcesData.breakdown.external.cost})</h4>
                <div className="space-y-3">
                  {phase1ResourcesData.breakdown.external.components.map((component, idx) => (
                    <div key={idx} className="bg-white rounded p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-900">{component.component}</span>
                        <span className="text-sm text-green-600 font-medium">{component.cost}</span>
                      </div>
                      <p className="text-sm text-gray-600">{component.deliverable}</p>
                    </div>
                  ))}
                </div>
              </div>
            </StaggeredItem>
          </StaggeredList>
        </div>

        {/* Deliverables Checklist */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Phase 1 Deliverables</h3>
          <StaggeredList className="space-y-4">
            {phase1DeliverablesData.map((deliverable, idx) => (
              <StaggeredItem key={idx}>
                <div className={`border rounded-lg p-4 ${getStatusColor(deliverable.status)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(deliverable.status)}
                      <div>
                        <h4 className="font-semibold">{deliverable.deliverable}</h4>
                        <p className="text-sm mt-1">{deliverable.description}</p>
                        <p className="text-xs mt-2 opacity-75">{deliverable.evidence}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50">
                      {deliverable.status === 'complete' ? 'Complete' : 
                       deliverable.status === 'in-progress' ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                </div>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </div>

        {/* Summary */}
        <StaggeredItem>
          <div className="bg-gradient-to-r from-cpc-green-600 to-cpc-green-700 text-white rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Phase 1: Prove the Thesis, Then Scale</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">4/7</div>
                <div className="text-sm opacity-90">Deliverables Complete</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">£150-200k</div>
                <div className="text-sm opacity-90">Realistic Investment</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">3 months</div>
                <div className="text-sm opacity-90">Time-boxed Validation</div>
              </div>
            </div>
            <p className="mt-6 text-cpc-green-100 max-w-2xl mx-auto">
              We're not asking for faith—we're asking for a structured experiment with clear success criteria and exit conditions.
            </p>
          </div>
        </StaggeredItem>
      </div>
    </div>
  );
}