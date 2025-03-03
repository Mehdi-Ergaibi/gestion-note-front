import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { api } from "@/api";
import { useToast } from "@/hooks/use-toast";

export const GradeConfiguration = () => {
  const [gradeSettings, setGradeSettings] = useState({
    normalViewEnabled: false,
    rattrapageEnabled: false,
    studentViewEnabled: false,
  });
  
  const { toast } = useToast();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await api.getConfiguration();
        setGradeSettings({
          normalViewEnabled: data.normalExamGradeEntryEnabled,
          rattrapageEnabled: data.rattExamGradeEntryEnabled,
          studentViewEnabled: data.studentGradeDisplayEnabled,
        });
      } catch (error) {
        console.error("Error fetching configuration:", error);
      }
    };

    fetchConfig();
  }, []);

  const getSettingLabel = (field: string) => {
    const labels: { [key: string]: string } = {
      normalViewEnabled: "Session Normale",
      rattrapageEnabled: "Session Rattrapage",
      studentViewEnabled: "Visibilité des Notes"
    };
    return labels[field] || "Paramètre";
  };

  const handleToggle = async (field: string, value: boolean) => {
    const previousState = { ...gradeSettings };
    
    try {
      // Optimistic update
      setGradeSettings(prev => ({ ...prev, [field]: value }));

      // API call
      if (field === "normalViewEnabled") {
        await api.updateNormalExam(value);
      } else if (field === "rattrapageEnabled") {
        await api.updateRattExam(value);
      } else if (field === "studentViewEnabled") {
        await api.updateStudentNotesVisibility(value);
      }

      // Success toast
      toast({
        title: "Succès",
        description: `${getSettingLabel(field)} ${value ? 'activée' : 'désactivée'} avec succès`,
        variant: "success",
      });
    } catch (error) {
      // Revert on error
      setGradeSettings(previousState);
      console.error(`Error updating ${field}:`, error);
      
      // Error toast
      toast({
        title: "Erreur",
        description: `Échec de la mise à jour de ${getSettingLabel(field)}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration des Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing switch components */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Session Normale</h3>
            <p className="text-sm text-muted-foreground">
              Activer la saisie des notes pour les professeurs
            </p>
          </div>
          <Switch
            checked={gradeSettings.normalViewEnabled}
            onCheckedChange={(checked) =>
              handleToggle("normalViewEnabled", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Session Rattrapage</h3>
            <p className="text-sm text-muted-foreground">
              Activer la saisie des notes pour les professeurs
            </p>
          </div>
          <Switch
            checked={gradeSettings.rattrapageEnabled}
            onCheckedChange={(checked) =>
              handleToggle("rattrapageEnabled", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Visibilité des Notes</h3>
            <p className="text-sm text-muted-foreground">
              Activer l'affichage des notes pour les étudiants
            </p>
          </div>
          <Switch
            checked={gradeSettings.studentViewEnabled}
            onCheckedChange={(checked) =>
              handleToggle("studentViewEnabled", checked)
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};