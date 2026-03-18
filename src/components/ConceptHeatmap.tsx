'use client';

import React, { useMemo } from 'react';

interface ConceptHeatmapProps {
  topicId: string;
  currentStep: number;
  doubtHistory: string[];
}

type MasteryLevel = 'not_covered' | 'covered' | 'mastered' | 'needs_review';

interface ConceptStatus {
  name: string;
  level: MasteryLevel;
}

const CONCEPT_MAP: Record<string, string[]> = {
  newtons_laws_001: [
    'Free Body Diagram',
    "Newton's 2nd Law",
    'Tension',
    'Acceleration',
    'Constraint Relations'
  ],
  kinematics_001: [
    'Projectile Motion',
    'Components',
    'Quadratic Equations',
    'Range Formula',
    'Time of Flight'
  ],
  electrostatics_001: [
    "Gauss's Law",
    'Electric Field',
    'Symmetry',
    'Flux',
    'Shell Theorem'
  ],
  shm_001: [
    'Time Period',
    'Energy Conservation',
    'SHM Formula',
    'Restoring Force',
    'Mean Position'
  ],
  thermodynamics_001: [
    'Carnot Efficiency',
    'Heat Engine',
    'First Law',
    'Temperature Scale',
    'Reversibility'
  ],
  work_energy_001: [
    'Work-Energy Theorem',
    'Kinetic Energy',
    'Spring Potential',
    'Conservation of Energy',
    'Collision'
  ],
  ray_optics_001: [
    'Lens Formula',
    'Sign Convention',
    'Virtual Object',
    'Image Formation',
    'Power of Lens'
  ]
};

const TOPIC_NAMES: Record<string, string> = {
  newtons_laws_001: "Newton's Laws of Motion",
  kinematics_001: 'Kinematics',
  electrostatics_001: 'Electrostatics',
  shm_001: 'Simple Harmonic Motion',
  thermodynamics_001: 'Thermodynamics',
  work_energy_001: 'Work and Energy',
  ray_optics_001: 'Ray Optics'
};

const COLOR_MAP: Record<MasteryLevel, string> = {
  not_covered: '#2d3148',
  covered: '#fbbf24',
  mastered: '#00e676',
  needs_review: '#ff5252'
};

const LEGEND_CONFIG = [
  { emoji: '🟢', label: 'Got it', color: '#00e676' },
  { emoji: '🟡', label: 'Learning', color: '#fbbf24' },
  { emoji: '🔴', label: 'Needs Review', color: '#ff5252' },
  { emoji: '⚫', label: 'Not Yet', color: '#2d3148' }
];

export default function ConceptHeatmap({
  topicId,
  currentStep,
  doubtHistory
}: ConceptHeatmapProps) {
  const concepts = CONCEPT_MAP[topicId] || [
    'Concept 1',
    'Concept 2',
    'Concept 3',
    'Concept 4'
  ];

  const topicName = TOPIC_NAMES[topicId] || 'Current Topic';

  const conceptStatuses = useMemo<ConceptStatus[]>(() => {
    return concepts.map((concept, index) => {
      // Check if concept needs review based on doubt history
      const needsReview = doubtHistory.some(doubt =>
        concept.toLowerCase().split(' ').some(word =>
          doubt.toLowerCase().includes(word)
        )
      );

      if (needsReview) {
        return { name: concept, level: 'needs_review' };
      }

      // Determine mastery level based on current step
      if (currentStep >= concepts.length - 1) {
        return { name: concept, level: 'mastered' };
      }

      if (index < currentStep) {
        return { name: concept, level: 'covered' };
      }

      return { name: concept, level: 'not_covered' };
    });
  }, [concepts, currentStep, doubtHistory]);

  const masteredCount = conceptStatuses.filter(
    c => c.level === 'mastered'
  ).length;
  const coveredCount = conceptStatuses.filter(
    c => c.level === 'covered'
  ).length;

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      {/* Title and Progress */}
      <div>
        <h3
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text)',
            margin: '0 0 4px 0'
          }}
        >
          Concept Mastery
        </h3>
        <p
          style={{
            fontSize: '12px',
            color: 'var(--text-dim)',
            margin: '0 0 8px 0'
          }}
        >
          {topicName}
        </p>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          fontSize: '11px',
          color: 'var(--text-dim)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span>
          {masteredCount}/{concepts.length} concepts mastered
        </span>
        <div
          style={{
            width: '60px',
            height: '4px',
            background: 'var(--surface2)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${(masteredCount / concepts.length) * 100}%`,
              background: '#00e676',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '4px',
          fontSize: '10px',
          color: 'var(--text-dim)',
          paddingTop: '4px',
          borderTop: '1px solid var(--border)'
        }}
      >
        {LEGEND_CONFIG.map(item => (
          <div key={item.label} style={{ display: 'flex', gap: '4px' }}>
            <span>{item.emoji}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Concept Grid */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          paddingTop: '4px'
        }}
      >
        {conceptStatuses.map(concept => (
          <div
            key={concept.name}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 10px',
              borderRadius: '16px',
              background: COLOR_MAP[concept.level],
              fontSize: '11px',
              fontWeight: '500',
              color:
                concept.level === 'not_covered'
                  ? 'var(--text-dim)'
                  : concept.level === 'covered'
                    ? '#000'
                    : '#000',
              transition: 'all 0.3s ease',
              cursor: 'default',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '120px'
            }}
            title={concept.name}
          >
            {concept.name}
          </div>
        ))}
      </div>

      {/* Review Notice */}
      {conceptStatuses.some(c => c.level === 'needs_review') && (
        <div
          style={{
            fontSize: '11px',
            color: '#ff5252',
            padding: '8px',
            background: 'rgba(255, 82, 82, 0.1)',
            borderRadius: '6px',
            marginTop: '4px'
          }}
        >
          ⚠️ Some concepts need review based on your doubts
        </div>
      )}
    </div>
  );
}
