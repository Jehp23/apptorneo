"use client";

interface RegulationSection {
  title: string;
  items: string[];
}

interface RegulationsProps {
  sections: RegulationSection[];
}

export function Regulations({ sections }: RegulationsProps) {
  return (
    <div className="space-y-8">
      {sections.map((section, index) => (
        <div key={index}>
          <h4 className="text-sm font-medium mb-4">{section.title}</h4>
          <ul className="space-y-2">
            {section.items.map((item, itemIndex) => (
              <li key={itemIndex} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="text-foreground mt-1.5 h-1 w-1 rounded-full bg-current flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
