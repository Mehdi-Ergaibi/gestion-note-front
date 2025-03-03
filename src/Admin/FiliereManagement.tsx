import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { api } from "@/api";
import { Filiere } from "@/types/Filiere";
import { Semestre } from "@/types/Semestre";

export const FiliereManagement = () => {
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [name, setName] = useState("");
  const [selectedSemestre, setSelectedSemestre] = useState<Semestre>(
    Semestre.S1
  );
  const [editingFiliere, setEditingFiliere] = useState<Filiere | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFilieres();
  }, []);

  const fetchFilieres = async () => {
    try {
      const data = await api.getFilieres();
      setFilieres(data);
    } catch (error) {
      console.error("Error fetching filières:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingFiliere) {
        await api.updateFiliere(editingFiliere.id, {
          name,
          semestre: selectedSemestre,
        });
        toast({
          title: "Succès",
          description: "Filière modifiée avec succès",
          variant: "success",
        });
      } else {
        await api.createFiliere({ name, semestre: selectedSemestre });
        toast({
          title: "Succès",
          description: "Filière créée avec succès",
          variant: "success",
        });
      }
      fetchFilieres();
      resetForm();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteFiliere(id);
      toast({
        title: "Succès",
        description: "Filière supprimée avec succès",
        variant: "success",
      });
      fetchFilieres();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la suppression",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setName("");
    setSelectedSemestre(Semestre.S1);
    setEditingFiliere(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Gestion des Filières</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Ajouter Filière</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-medium">
                {editingFiliere ? "Modifier Filière" : "Nouvelle Filière"}
              </h3>
              <Input
                placeholder="Nom de la filière"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Select
                value={selectedSemestre}
                onValueChange={(value) =>
                  setSelectedSemestre(value as Semestre)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un semestre" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Semestre).map((sem) => (
                    <SelectItem key={sem} value={sem}>
                      {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingFiliere ? "Modifier" : "Créer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Semestre</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filieres.map((filiere) => (
              <TableRow key={filiere.id}>
                <TableCell>{filiere.name}</TableCell>
                <TableCell>{filiere.semestre}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingFiliere(filiere);
                      setName(filiere.name);
                      setSelectedSemestre(filiere.semestre);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(filiere.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
