'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Clock, Calendar, Target } from 'lucide-react';
import { phase1DeliverablesData, phaseData } from '@/data/reviewerData';

export const PhaseTimeline = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-50 border-green-200';
      case 'in-progress':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-1/2 transform -translate-x-0.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#006E51] via-purple-400 to-green-400"></div>
        


        {/* Phase 1 Individual Deliverables - Alternating sides */}
        <div className="space-y-12 relative before:absolute before:inset-0 before:left-1/2 before:ml-0 before:-translate-x-px before:border-l-2 before:border-[#006E51]/30 before:h-full before:z-0">
          {phase1DeliverablesData.map((item, index) => (
            <div
              key={index}
              className={`relative z-10 flex items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'}`}
            >
              <motion.div
                className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pl-10' : 'md:pr-10'}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`relative overflow-hidden rounded-xl border-2 ${getStatusColor(item.status)} p-6 transition-all duration-300 hover:shadow-lg`}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/10 rounded-xl blur opacity-0 hover:opacity-100 transition duration-300"></div>
                  
                  <div className="relative">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(item.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-[#2E2D2B]">{item.deliverable}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            item.status === 'complete' 
                              ? 'bg-green-100 text-green-800' 
                              : item.status === 'in-progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status === 'complete' ? 'Complete' : 
                             item.status === 'in-progress' ? 'In Progress' : 'Planned'}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{item.description}</p>
                        <p className="text-sm text-gray-600 italic">{item.evidence}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Timeline dot */}
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                <motion.div
                  className={`w-6 h-6 rounded-full z-10 flex items-center justify-center ${
                    item.status === 'complete' ? 'bg-green-500' : 
                    item.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </motion.div>
              </div>
            </div>
          ))}
        </div>

          {/* Phase 2 */}
          <div className="relative z-10 flex items-center md:flex-row">
            <motion.div
              className="w-full md:w-1/2 md:pr-10"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="relative overflow-hidden rounded-xl border-2 border-purple-200 bg-purple-50 p-6 transition-all duration-300 hover:shadow-lg">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-purple-300/10 rounded-xl blur opacity-0 hover:opacity-100 transition duration-300"></div>
                
                <div className="relative">
                  <h3 className="text-xl font-bold text-[#2E2D2B] mb-2">{phaseData.phase2.title}</h3>
                  <p className="text-gray-700 mb-2">{phaseData.phase2.timeline} • {phaseData.phase2.status}</p>
                  <p className="text-gray-600">{phaseData.phase2.description}</p>
                </div>
              </div>
            </motion.div>

            {/* Timeline dot */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
              <motion.div
                className="w-6 h-6 rounded-full bg-purple-600 z-10 flex items-center justify-center"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </motion.div>
            </div>
          </div>

          {/* Phase 3 */}
          <div className="relative z-10 flex items-center md:flex-row-reverse">
            <motion.div
              className="w-full md:w-1/2 md:pl-10"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="relative overflow-hidden rounded-xl border-2 border-indigo-200 bg-indigo-50 p-6 transition-all duration-300 hover:shadow-lg">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-indigo-300/10 rounded-xl blur opacity-0 hover:opacity-100 transition duration-300"></div>
                
                <div className="relative">
                  <h3 className="text-xl font-bold text-[#2E2D2B] mb-2">{phaseData.phase3.title}</h3>
                  <p className="text-gray-700 mb-2">{phaseData.phase3.timeline} • {phaseData.phase3.status}</p>
                  <p className="text-gray-600">{phaseData.phase3.description}</p>
                </div>
              </div>
            </motion.div>

            {/* Timeline dot */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
              <motion.div
                className="w-6 h-6 rounded-full bg-indigo-600 z-10 flex items-center justify-center"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </motion.div>
            </div>
          </div>
      </div>
    </div>
  );
};

