"use client";

import { useId, useState } from "react";

interface RepairTypeSeoPocket {
  quickAnswer: string;
  workbenchHeadings?: {
    options: string;
    diagnostics: string;
    symptoms: string;
    outcomes: string;
  };
  repairOptions: Array<{
    name: string;
    shortDescription: string;
    bestFor: string;
    notes: string;
  }>;
  commonProblems: Array<{
    title: string;
    description: string;
  }>;
  diagnosticSteps: Array<{
    step: string;
    title: string;
    description: string;
  }>;
}

type WorkbenchPanel = "options" | "diagnostics" | "symptoms" | "outcomes";
type OpenWorkbenchPanel = WorkbenchPanel | null;

function WorkbenchBox({
  number,
  title,
  panel,
  isOpen,
  onToggle,
  children,
}: {
  number: string;
  title: string;
  panel: WorkbenchPanel;
  isOpen: boolean;
  onToggle: (panel: WorkbenchPanel) => void;
  children: React.ReactNode;
}) {
  const contentId = useId();

  return (
    <details className="repair-workbench-box" open={isOpen}>
      <summary
        aria-controls={contentId}
        aria-expanded={isOpen}
        onClick={(event) => {
          event.preventDefault();
          onToggle(panel);
        }}
      >
        <span className="repair-workbench-number">{number}</span>
        <h3>{title}</h3>
        <span className="repair-workbench-chevron" aria-hidden="true" />
      </summary>
      <div id={contentId} className="repair-workbench-box-content">
        {children}
      </div>
    </details>
  );
}

export default function TechnicianWorkbenchProcess({ pocket }: { pocket: RepairTypeSeoPocket }) {
  const [openPanel, setOpenPanel] = useState<OpenWorkbenchPanel>(null);
  const primaryProblems = pocket.commonProblems.slice(0, 4);
  const secondaryProblems = pocket.commonProblems.slice(4);
  const headings = pocket.workbenchHeadings || {
    options: "Which repair path fits this iPhone 13?",
    diagnostics: "What do we test before quoting?",
    symptoms: "Which symptoms matter most?",
    outcomes: "What can affect the final result?",
  };

  function togglePanel(panel: WorkbenchPanel) {
    setOpenPanel((currentPanel) => (currentPanel === panel ? null : panel));
  }

  return (
    <section className="repair-workbench-shell" aria-labelledby="technician-workbench-heading">
      <div className="repair-workbench-heading">
        <span>Repair clarity</span>
        <h2 id="technician-workbench-heading">Technician Workbench Process</h2>
        <p>{pocket.quickAnswer}</p>
      </div>

      <div className="repair-workbench-grid">
        <WorkbenchBox
          number="01"
          title={headings.options}
          panel="options"
          isOpen={openPanel === "options"}
          onToggle={togglePanel}
        >
          {pocket.repairOptions.map((option) => (
            <article key={option.name} className="repair-workbench-mini-card">
              <h3>{option.name}</h3>
              <p>{option.shortDescription}</p>
              <span>Best for</span>
              <p>{option.bestFor}</p>
              <small>{option.notes}</small>
            </article>
          ))}
        </WorkbenchBox>

        <WorkbenchBox
          number="02"
          title={headings.diagnostics}
          panel="diagnostics"
          isOpen={openPanel === "diagnostics"}
          onToggle={togglePanel}
        >
          {pocket.diagnosticSteps.map((step) => (
            <article key={step.step} className="repair-workbench-step-card">
              <span>{step.step}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </article>
          ))}
        </WorkbenchBox>

        <WorkbenchBox
          number="03"
          title={headings.symptoms}
          panel="symptoms"
          isOpen={openPanel === "symptoms"}
          onToggle={togglePanel}
        >
          {primaryProblems.map((problem) => (
            <article key={problem.title} className="repair-workbench-mini-card">
              <h3>{problem.title}</h3>
              <p>{problem.description}</p>
            </article>
          ))}
        </WorkbenchBox>

        <WorkbenchBox
          number="04"
          title={headings.outcomes}
          panel="outcomes"
          isOpen={openPanel === "outcomes"}
          onToggle={togglePanel}
        >
          {secondaryProblems.map((problem) => (
            <article key={problem.title} className="repair-workbench-mini-card">
              <h3>{problem.title}</h3>
              <p>{problem.description}</p>
            </article>
          ))}
        </WorkbenchBox>
      </div>
    </section>
  );
}
