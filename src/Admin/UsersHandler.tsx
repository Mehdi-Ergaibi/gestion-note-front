import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User } from "@/types/User";
import { api } from "@/api";


interface BackendUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: Array<{ name: string }>;
  prof: {
    filieres?: string[];
    semestre?: string;
    isChef?: boolean;
    chefFiliere?: string;
  } | null;
}

const filieresOptions: string[] = [
  "Informatique",
  "Mathématiques",
  "Physique",
  "Chimie",
];
const semestreOptions = ["S1", "S2", "S3", "S4"];

export default function UsersHandler() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<User["role"]>("admin");
  const [open, setOpen] = useState(false);
  const [isChef, setIsChef] = useState(false);
  const [selectedFilieres, setSelectedFilieres] = useState<string[]>([]);
  const [selectedSemestre, setSelectedSemestre] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const backendUsers = await api.getUsers();
        
        const transformedUsers = backendUsers.map((user: BackendUser) => ({
          id: user.id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: mapRole(user.roles[0]?.name),
          filieres: user.prof?.filieres || [],
          semestre: user.prof?.semestre || "",
          isChef: user.prof?.isChef || false,
          chefFiliere: user.prof?.chefFiliere || "",
        }));
        
        setUsers(transformedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const mapRole = (backendRole: string): User["role"] => {
    switch (backendRole) {
      case "ADMIN_APP":
        return "admin";
      case "PROFESSEUR":
        return "prof";
      case "COORDONNATEUR":
        return "coordinateur";
      case "ETUDIANT":
        return "etudiant";
      default:
        return "admin";
    }
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = () => {
    const newUser: User = {
      id: Date.now().toString(),
      ...formData,
      role: selectedRole,
      ...(selectedRole === "prof" && {
        filieres: selectedFilieres,
        semestre: selectedSemestre,
        isChef,
        ...(isChef && { chefFiliere: selectedFilieres[0] }),
      }),
    };
    setUsers([...users, newUser]);
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ firstName: "", lastName: "", email: "", password: "" });
    setSelectedFilieres([]);
    setSelectedSemestre("");
    setIsChef(false);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId));
    setDeleteDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Gestion des Comptes</CardTitle>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Rechercher par nom"
            className="w-48"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            value={selectedRole}
            onValueChange={(value: User["role"]) => setSelectedRole(value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="prof">Prof</SelectItem>
              <SelectTrigger value="coordinateur">Chef de filiere</SelectTrigger>
              <SelectItem value="administrateur absence">
                Administrateur Absence
              </SelectItem>
              <SelectItem value="secretaire general">
                Secrétaire Général
              </SelectItem>
              <SelectItem value="chef service scolarite">
                Chef Service Scolarité
              </SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Crer Compte</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Créer un nouveau compte</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firstName" className="text-right">
                    Prénom
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="text-right">
                    Nom
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Mot de passe
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                {selectedRole === "prof" && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Filières</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="col-span-3 justify-start"
                          >
                            {selectedFilieres.length > 0
                              ? selectedFilieres.join(", ")
                              : "Sélectionner des filières"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput placeholder="Rechercher filière..." />
                            <CommandList>
                              <CommandEmpty>
                                Aucune filière trouvée.
                              </CommandEmpty>
                              <CommandGroup>
                                {filieresOptions.map((filiere) => (
                                  <CommandItem
                                    key={filiere}
                                    value={filiere}
                                    onSelect={() => {
                                      setSelectedFilieres((prev) =>
                                        prev.includes(filiere)
                                          ? prev.filter((f) => f !== filiere)
                                          : [...prev, filiere]
                                      );
                                    }}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        checked={selectedFilieres.includes(
                                          filiere
                                        )}
                                        className="mr-2"
                                      />
                                      <span>{filiere}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Semestre</Label>
                      <Select
                        value={selectedSemestre}
                        onValueChange={setSelectedSemestre}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Sélectionner semestre" />
                        </SelectTrigger>
                        <SelectContent>
                          {semestreOptions?.map((semestre) => (
                            <SelectItem key={semestre} value={semestre}>
                              {semestre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Chef de filière</Label>
                      <Checkbox
                        checked={isChef}
                        onCheckedChange={(checked) => setIsChef(!!checked)}
                        className="col-span-3"
                      />
                    </div>
                    {isChef && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Filière chef</Label>
                        <Select
                          value={selectedFilieres[0]}
                          onValueChange={(value) =>
                            setSelectedFilieres([value])
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Sélectionner filière" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedFilieres?.map((filiere) => (
                              <SelectItem key={filiere} value={filiere}>
                                {filiere}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleCreateUser}>Créer Compte</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setEditingUser(user)}>
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Êtes-vous sûr de vouloir supprimer cet utilisateur?
            </DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteUser(editingUser?.id || "")}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier l'utilisateur</DialogTitle>
            </DialogHeader>
            {/* Add edit form similar to create form with existing values */}
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
