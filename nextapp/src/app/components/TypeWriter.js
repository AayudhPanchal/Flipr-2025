import React, { useState, useEffect, useCallback } from 'react';

const defaultStyles = {
  overview: "bg-blue-50 p-6 rounded-lg mb-6",
  points: "space-y-4 bg-gray-50 p-6 rounded-lg mb-6",
  conclusion: "bg-blue-50 p-6 rounded-lg",
  title: "text-xl font-bold text-blue-800 mb-4",
  point: "flex items-start space-x-3",
  number: "font-bold text-blue-600 min-w-[25px]",
  content: "text-gray-700 leading-relaxed"
};

export default function TypeWriter({ text, styles = {}, onProgress }) {
  const [displayedSections, setDisplayedSections] = useState([]);
  const [sectionProgress, setSectionProgress] = useState({});
  const mergedStyles = { ...defaultStyles, ...styles };

  const typeSection = useCallback((section, index, totalSections) => {
    if (!section.content) return;

    const content = typeof section.content === 'string' ? section.content : '';
    let charIndex = 0;
    const totalChars = content.length;

    return new Promise((resolve) => {
      const typing = setInterval(() => {
        if (charIndex < totalChars) {
          setDisplayedSections(prev => 
            prev.map(s => 
              s.id === section.id 
                ? { ...s, displayedContent: content.substring(0, charIndex + 1) }
                : s
            )
          );

          // Calculate progress for this section
          const sectionProgress = Math.round((charIndex / totalChars) * 100);
          setSectionProgress(prev => ({
            ...prev,
            [section.id]: sectionProgress
          }));

          // Calculate and report overall progress
          if (onProgress) {
            const totalProgress = Object.values(sectionProgress).reduce((a, b) => a + b, 0) / totalSections;
            onProgress(totalProgress);
          }

          charIndex++;
        } else {
          clearInterval(typing);
          resolve();
        }
      }, 20);
    });
  }, [onProgress]);

  useEffect(() => {
    if (!text?.sections?.length) return;

    // Initialize all sections
    const initialSections = text.sections.map((section, index) => ({
      ...section,
      id: `section-${index}`,
      displayedContent: section.type === 'points' ? section.content : ''
    }));

    setDisplayedSections(initialSections);

    // Start typing all sections in parallel
    const typeSections = async () => {
      const totalSections = initialSections.length;
      const typingPromises = initialSections.map((section, index) => {
        if (section.type === 'points') {
          setSectionProgress(prev => ({
            ...prev,
            [section.id]: 100
          }));
          return Promise.resolve();
        }
        return typeSection(section, index, totalSections);
      });

      await Promise.all(typingPromises);
    };

    typeSections();
  }, [text, typeSection]);

  const renderContent = (section) => {
    if (section.type === 'points' && Array.isArray(section.content)) {
      return (
        <div className="space-y-2 animate-fade-in">
          {section.content.map((point, index) => (
            <div key={index} className={mergedStyles.point}>
              <span className={mergedStyles.number}>•</span>
              <span className={mergedStyles.content}>{point}</span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <p className={mergedStyles.content}>
        {section.displayedContent || ''}
      </p>
    );
  };

  if (!text?.sections?.length) {
    return (
      <div className={mergedStyles.overview}>
        <h3 className={mergedStyles.title}>Summary</h3>
        <p className={mergedStyles.content}>Processing summary...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {displayedSections.map((section, idx) => (
        <div 
          key={section.id} 
          className={`${mergedStyles[section.type] || mergedStyles.overview} animate-fade-in`}
        >
          <h3 className={mergedStyles.title}>{section.title}</h3>
          {renderContent(section)}
        </div>
      ))}
    </div>
  );
}