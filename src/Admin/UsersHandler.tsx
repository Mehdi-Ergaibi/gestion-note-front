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
  SelectGroup,
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
import { RegistrationRequest } from "@/types/RegistrationRequest";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Roles } from "@/types/Roles";
import { Semestre } from "@/types/Semestre";
import { useToast } from "@/hooks/use-toast";
import { UserUpdateRequest } from "@/types/UserUpdateRequest";
import { useAuth } from "@/contexts/AuthContext";

interface BackendUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: Array<{ name: Roles }>;
  prof?: {
    filieres?: string[];
    semestre?: Semestre;
    isChef?: boolean;
    chefFiliere?: string;
  };
}

interface FiliereOption {
  id: number;
  name: string;
}

const filieresOptions: FiliereOption[] = [
  { id: 1, name: "Informatique" },
  { id: 2, name: "Mathématiques" },
  { id: 3, name: "Physique" },
  { id: 4, name: "Chimie" },
];

const semestreOptions = [Semestre.S1, Semestre.S2, Semestre.S3, Semestre.S4];

export default function UsersHandler() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<Roles>(Roles.ADMIN_APP);
  const [open, setOpen] = useState(false);
  const [isChef, setIsChef] = useState(false);
  const [selectedFilieres, setSelectedFilieres] = useState<number[]>([]);
  const [selectedSemestre, setSelectedSemestre] = useState<Semestre>();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<RegistrationRequest>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: Roles.ADMIN_APP,
  });

  const { token, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (editingUser) {
      setFormData({
        firstName: editingUser.firstName || "",
        lastName: editingUser.lastName || "",
        email: editingUser.email || "",
        role: editingUser.role || "",
        password: "",
      });
      const userRole = mapDisplayToRole(editingUser.role);
      if (userRole === Roles.PROFESSEUR) {
        const filiereIds = editingUser.filieres
          ?.map(
            (filiereName) =>
              filieresOptions.find((opt) => opt.name === filiereName)?.id
          )
          .filter((id): id is number => id !== undefined);
        setSelectedFilieres(filiereIds || []);
        setSelectedSemestre(editingUser.semestre);
        setIsChef(editingUser.isChef || false);
      } else {
        setSelectedFilieres([]);
        setSelectedSemestre(undefined);
        setIsChef(false);
      }
    }
  }, [editingUser]);

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      setIsSubmitting(true);

      const userRole = mapDisplayToRole(editingUser.role);

      const updatedUser: Partial<UserUpdateRequest> = {
        id: editingUser.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        roles: [userRole, ...(isChef ? [Roles.COORDONNATEUR] : [])],
        ...(userRole === Roles.PROFESSEUR && {
          prof: {
            isChef: isChef,
            filiereIds: selectedFilieres,
          },
        }),
        password: formData.password || undefined,
      };

      await api.updateUser(updatedUser);
      toast({
        title: "Utilisateur modifié",
        description: `${updatedUser.firstName} ${updatedUser.lastName} a été modifié avec succès.`,
        variant: "success",
      });
      setEditingUser(null);
      // Update local state (adjust based on API response)
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser.id
            ? ({
                ...user,
                firstName: updatedUser.firstName ?? user.firstName, // Ensure it's always a string
                lastName: updatedUser.lastName ?? user.lastName,
                email: updatedUser.email ?? user.email,
                roles: updatedUser.roles as Roles[], // Ensure proper type casting
                filieres: filieresOptions
                  .filter((f) => selectedFilieres.includes(f.id))
                  .map((f) => f.name),
                semestre: selectedSemestre,
                isChef: isChef,
                chefFiliere: isChef
                  ? filieresOptions.find((f) => f.id === selectedFilieres[0])
                      ?.name
                  : undefined,
              } as User) // Explicitly cast to User
            : user
        )
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const mapRoleToDisplay = (role: Roles): string => {
    switch (role) {
      case Roles.ADMIN_APP:
        return "Admin";
      case Roles.PROFESSEUR:
        return "Prof";
      case Roles.COORDONNATEUR:
        return "Coordinateur";
      case Roles.ADMIN_ABSENCE:
        return "Admin Absence";
      case Roles.SECRETAIRE_GENERAL:
        return "Secrétaire Général";
      case Roles.CHEF_SCOLARITE:
        return "Chef Scolarité";
      default:
        return "Admin";
    }
  };

  const mapDisplayToRole = (displayRole: string): Roles => {
    switch (displayRole) {
      case "Admin":
        return Roles.ADMIN_APP;
      case "Prof":
        return Roles.PROFESSEUR;
      case "Coordinateur":
        return Roles.COORDONNATEUR;
      case "Admin Absence":
        return Roles.ADMIN_ABSENCE;
      case "Secrétaire Général":
        return Roles.SECRETAIRE_GENERAL;
      case "Chef Scolarité":
        return Roles.CHEF_SCOLARITE;
      default:
        return Roles.ADMIN_APP;
    }
  };

  const fetchUsersByRole = async (role: Roles) => {
    try {
      let response;
      switch (role) {
        case Roles.ADMIN_APP:
          response = await api.getAdmins();
          break;
        case Roles.PROFESSEUR:
          response = await api.getProfs();
          break;
        case Roles.COORDONNATEUR:
          response = await api.getChefsFilieres();
          break;
        case Roles.ADMIN_ABSENCE:
          response = await api.getAdminAbsence();
          break;
        case Roles.SECRETAIRE_GENERAL:
          response = await api.getSecretaires();
          break;
        case Roles.CHEF_SCOLARITE:
          response = await api.getChefScolarite();
          break;
        default:
          response = await api.getAdmins();
      }

      const transformedUsers = response.map((user: BackendUser) => ({
        id: user.id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: mapRoleToDisplay(user.roles[0]?.name),
        filieres: user.prof?.filieres || [],
        semestre: user.prof?.semestre,
        isChef: user.prof?.isChef || false,
        chefFiliere: user.prof?.chefFiliere || "",
      }));

      setUsers(transformedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (!loading && token) {
      fetchUsersByRole(selectedRole);
    }
  }, [selectedRole, token, loading]);

  const handleCreateUser = async () => {
    setIsSubmitting(true);

    try {
      const userData: RegistrationRequest = {
        ...formData,
        role: selectedRole,
      };

      if (selectedRole === Roles.PROFESSEUR) {
        userData.filiereIds = selectedFilieres;
        userData.isChef = isChef;
      }

      /* if (selectedRole === Roles.ETUDIANT) {
        userData.semestre = selectedSemestre;
      } */

      await api.registerUser(userData);

      const newUser: User = {
        id: `temp-${Date.now()}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: mapRoleToDisplay(formData.role) as Roles,
        filieres: filieresOptions
          .filter((f) => selectedFilieres.includes(f.id))
          .map((f) => f.name),
        semestre: selectedSemestre,
        isChef,
      };

      setUsers((prevUsers) => [...prevUsers, newUser]);
      setOpen(false);
      resetForm();

      toast({
        title: "Utilisateur ajouté",
        description: `${newUser.firstName} ${newUser.lastName} a été ajouté avec succès.`,
        variant: "success",
      });
    } catch (error) {
      setUsers((prev) => prev.filter((u) => !u.id.startsWith("temp-")));
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: Roles.ADMIN_APP,
    });
    setSelectedFilieres([]);
    setSelectedSemestre(undefined);
    setIsChef(false);
  };

  const handleDeleteUser = async (email: string) => {
    try {
      console.log(email);
      await api.deleteUser(email);
      toast({
        title: "Utilisateur supprimé avec succès",
        description: `${deletingUser?.firstName} ${deletingUser?.lastName} a été supprimé avec succès.`,
        variant: "success",
      });
      setDeleteDialogOpen(false);

      // Refresh users list after deletion
      setUsers(users.filter((user) => user.email !== email));
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
    }
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
            onValueChange={(value: Roles) => {
              setSelectedRole(value);
              fetchUsersByRole(value);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={Roles.ADMIN_APP}>Admin</SelectItem>
                <SelectItem value={Roles.PROFESSEUR}>Prof</SelectItem>
                <SelectItem value={Roles.COORDONNATEUR}>
                  Coordinateur
                </SelectItem>
                <SelectItem value={Roles.ADMIN_ABSENCE}>
                  Admin Absence
                </SelectItem>
                <SelectItem value={Roles.SECRETAIRE_GENERAL}>
                  Secrétaire Général
                </SelectItem>
                <SelectItem value={Roles.CHEF_SCOLARITE}>
                  Chef Scolarité
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Créer Compte</Button>
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
                      setFormData({
                        ...formData,
                        firstName: e.target.value,
                        role: selectedRole,
                      })
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
                {selectedRole === Roles.PROFESSEUR && (
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
                              ? selectedFilieres
                                  .map(
                                    (id) =>
                                      filieresOptions.find((f) => f.id === id)
                                        ?.name
                                  )
                                  .join(", ")
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
                                    key={filiere.id}
                                    value={filiere.id.toString()}
                                    onSelect={() => {
                                      setSelectedFilieres((prev) =>
                                        prev.includes(filiere.id)
                                          ? prev.filter((f) => f !== filiere.id)
                                          : [...prev, filiere.id]
                                      );
                                    }}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        checked={selectedFilieres.includes(
                                          filiere.id
                                        )}
                                        className="mr-2"
                                      />
                                      <span>{filiere.name}</span>
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
                        onValueChange={(value) =>
                          setSelectedSemestre(value as Semestre)
                        }
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
                          value={selectedFilieres[0]?.toString()}
                          onValueChange={(value) =>
                            setSelectedFilieres([Number(value)])
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Sélectionner filière" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedFilieres?.map((id) => {
                              const filiere = filieresOptions.find(
                                (f) => f.id === id
                              );
                              return (
                                <SelectItem key={id} value={id.toString()}>
                                  {filiere?.name}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleCreateUser} disabled={isSubmitting}>
                  {isSubmitting && (
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting ? "Création..." : "Créer Compte"}
                </Button>
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
                        onClick={() => {
                          setDeleteDialogOpen(true);
                          setDeletingUser(user);
                        }}
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
              onClick={() => handleDeleteUser(deletingUser?.email || "")}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingUser && (
        <Dialog
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier l'utilisateur</DialogTitle>
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
                  disabled
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Nouveau mot de passe
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
              {mapDisplayToRole(editingUser.role) === Roles.PROFESSEUR && (
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
                            ? selectedFilieres
                                .map(
                                  (id) =>
                                    filieresOptions.find((f) => f.id === id)
                                      ?.name
                                )
                                .join(", ")
                            : "Sélectionner des filières"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="Rechercher filière..." />
                          <CommandList>
                            <CommandEmpty>Aucune filière trouvée.</CommandEmpty>
                            <CommandGroup>
                              {filieresOptions.map((filiere) => (
                                <CommandItem
                                  key={filiere.id}
                                  value={filiere.id.toString()}
                                  onSelect={() => {
                                    setSelectedFilieres((prev) =>
                                      prev.includes(filiere.id)
                                        ? prev.filter((f) => f !== filiere.id)
                                        : [...prev, filiere.id]
                                    );
                                  }}
                                >
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={selectedFilieres.includes(
                                        filiere.id
                                      )}
                                      className="mr-2"
                                    />
                                    <span>{filiere.name}</span>
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
                      onValueChange={(value) =>
                        setSelectedSemestre(value as Semestre)
                      }
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
                        value={selectedFilieres[0]?.toString()}
                        onValueChange={(value) =>
                          setSelectedFilieres([Number(value)])
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Sélectionner filière" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedFilieres?.map((id) => {
                            const filiere = filieresOptions.find(
                              (f) => f.id === id
                            );
                            return (
                              <SelectItem key={id} value={id.toString()}>
                                {filiere?.name}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateUser} disabled={isSubmitting}>
                {isSubmitting && (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? "Modification..." : "Modifier"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
