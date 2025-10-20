"use client";

import { Download } from "lucide-react";
import { reviewerFeedbackData } from "@/data/reviewerData";

export function ReviewerResponsePDF() {
  const generatePDF = () => {
    // Create a simple HTML document for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Innovation Exchange Platform - Reviewer Response Document</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.4; 
              margin: 20px; 
              color: #333;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #007060; 
              padding-bottom: 10px; 
              margin-bottom: 20px;
            }
            .header h1 { 
              color: #007060; 
              margin: 0; 
              font-size: 24px;
            }
            .header p { 
              margin: 5px 0 0 0; 
              color: #666; 
            }
            .feedback-item { 
              margin-bottom: 15px; 
              border-left: 4px solid #007060; 
              padding-left: 15px;
            }
            .feedback { 
              font-weight: bold; 
              color: #333; 
              margin-bottom: 5px;
            }
            .response { 
              color: #555; 
              margin-bottom: 5px;
            }
            .evidence { 
              font-size: 12px; 
              color: #777; 
              font-style: italic;
            }
            .footer { 
              margin-top: 30px; 
              text-align: center; 
              border-top: 1px solid #ddd; 
              padding-top: 15px;
            }
            .prototype-link { 
              background: #007060; 
              color: white; 
              padding: 8px 16px; 
              text-decoration: none; 
              border-radius: 4px;
              display: inline-block;
              margin-top: 10px;
            }
            @media print {
              body { margin: 0; }
              .prototype-link { 
                background: #007060 !important; 
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Innovation Exchange Platform</h1>
            <p>Reviewer Response Document - October 2025</p>
            <p><strong>How We've Addressed Your Feedback</strong></p>
          </div>
          
          <div class="content">
            ${reviewerFeedbackData.map(item => `
              <div class="feedback-item">
                <div class="feedback">FEEDBACK: "${item.feedback}"</div>
                <div class="response"><strong>OUR RESPONSE:</strong> ${item.ourResponse}</div>
                <div class="evidence"><strong>EVIDENCE:</strong> ${item.evidence}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <p><strong>Full interactive prototype with all supporting analysis:</strong></p>
            <a href="${window.location.origin}/for-reviewers" class="prototype-link">
              View Interactive Prototype
            </a>
            <p style="margin-top: 15px; font-size: 12px; color: #666;">
              Connected Places Catapult • Innovation Exchange Platform • October 2025
            </p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <button
      onClick={generatePDF}
      className="flex items-center space-x-2 bg-transparent text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-200 border border-white/30"
    >
      <Download className="w-4 h-4" />
      <span>Download Summary PDF</span>
    </button>
  );
}