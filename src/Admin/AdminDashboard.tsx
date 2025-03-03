import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersHandler from "./UsersHandler";
import { GradeConfiguration } from "./GradeConfiguration";
import { FiliereManagement } from "./FiliereManagement";



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
