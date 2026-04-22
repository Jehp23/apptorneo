"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RegulationSection {
  title: string;
  items: string[];
}

interface RegulationsProps {
  sections: RegulationSection[];
}

export function Regulations({ sections }: RegulationsProps) {
  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-2 text-sm">
                  <span className="text-primary font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
