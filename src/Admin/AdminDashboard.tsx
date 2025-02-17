import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import UsersHandler from "./UsersHandler";

interface Module {
  id: number;
  name: string;
}

interface Filiere {
  id: number;
  name: string;
  modules: Module[];
}

// Gestion des Filières
const FiliereManagement = () => {
  const [filieres, setFilieres] = useState<Filiere[]>([]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Filières</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {filieres.map((filiere) => (
          <div key={filiere.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{filiere.name}</h3>
              <div className="space-x-2">
                <Button variant="outline">Modifier</Button>
                <Button variant="destructive">Supprimer</Button>
              </div>
            </div>

            {/* Modules et Éléments */}
            <div className="mt-4 pl-4 space-y-2">
              <h4 className="text-sm font-medium">Modules</h4>
              {filiere.modules.map((module) => (
                <div key={module.id} className="flex items-center space-x-2">
                  <span>{module.name}</span>
                  <Button variant="ghost" size="sm">
                    Éléments
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}

        <Dialog>
          <DialogTrigger asChild>
            <Button>Ajouter Filière</Button>
          </DialogTrigger>
          <DialogContent>{/* Formulaire d'ajout de filière */}</DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// Configuration des Notes
const GradeConfiguration = () => {
  const [gradeSettings, setGradeSettings] = useState({
    rattrapageEnabled: false,
    studentViewEnabled: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration des Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
              setGradeSettings((prev) => ({
                ...prev,
                rattrapageEnabled: checked,
              }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Visibilité des Notes</h3>
            <p className="text-sm text-muted-foreground">
              Activer l'affichage pour les étudiants
            </p>
          </div>
          <Switch
            checked={gradeSettings.studentViewEnabled}
            onCheckedChange={(checked) =>
              setGradeSettings((prev) => ({
                ...prev,
                studentViewEnabled: checked,
              }))
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Tableau de Bord Principal
export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="filieres">Filières</TabsTrigger>
            <TabsTrigger value="students">Étudiants</TabsTrigger>
            <TabsTrigger value="grades">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersHandler />
          </TabsContent>

          <TabsContent value="filieres">
            <FiliereManagement />
          </TabsContent>

          <TabsContent value="students">
            {/* Composant similaire pour étudiants */}
          </TabsContent>

          <TabsContent value="grades">
            <GradeConfiguration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
