'use client';

interface AboutSectionProps {
  aboutText: string;
}

export default function AboutSection({ aboutText }: AboutSectionProps) {
  // Split the text by newlines and render each paragraph separately
  const paragraphs = aboutText.split('\n\n').filter(Boolean);

  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2 border-gray-200 dark:border-gray-700">
        About Me
      </h2>
      
      <div className="text-gray-700 dark:text-gray-300 space-y-3">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}