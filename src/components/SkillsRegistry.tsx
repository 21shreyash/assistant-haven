
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getAllSkills } from "@/lib/skills/skillsManager";
import type { Skill } from "@/lib/skills/types";

const SkillsRegistry = () => {
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    setSkills(getAllSkills());
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Available Assistant Skills</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill) => (
          <Card key={skill.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle>{skill.name}</CardTitle>
                <Badge variant="outline">{skill.id}</Badge>
              </div>
              <CardDescription>{skill.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <h4 className="font-semibold mb-1">Trigger Patterns:</h4>
                <div className="flex flex-wrap gap-2">
                  {skill.patterns.map((pattern, index) => (
                    <Badge key={index} variant="secondary">
                      {pattern.toString().replace(/\//g, '')}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SkillsRegistry;
