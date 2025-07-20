"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  School,
  Users,
  BookOpen,
  MapPin,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-updated";
import { useUser } from "@clerk/nextjs";

interface Institution {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  type: string | null;
  created_at: string;
}

export function InstitutionsPage() {
  const { user } = useUser();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    if (user) {
      loadInstitutions();
      checkPermissions();
    }
  }, [user]);

  const loadInstitutions = async () => {
    try {
      const { data, error } = await supabase
        .from("institutions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInstitutions(data || []);
    } catch (error) {
      console.error("Error loading institutions:", error || "Unknown error");
      setInstitutions([]);
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    if (!user) return;

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("clerk_id", user.id)
      .single();

    setCanManage(userData?.role === "admin" || userData?.role === "director");
  };

  const filteredInstitutions = institutions.filter(
    (institution) =>
      institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (institution.address &&
        institution.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Instituciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona todas las instituciones educativas del sistema
          </p>
        </div>
        {canManage && (
          <Button asChild>
            <Link href="/dashboard/instituciones/nueva">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Institución
            </Link>
          </Button>
        )}
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder="Buscar instituciones..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Cargando instituciones...
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredInstitutions.map((institution) => (
            <Card
              key={institution.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <School className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {institution.name}
                      </CardTitle>
                      {institution.type && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full capitalize">
                          {institution.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {institution.address && (
                  <CardDescription className="flex items-center mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {institution.address}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      0
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Cursos
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      0
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Profesores
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      0
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Alumnos
                    </div>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/dashboard/instituciones/${institution.id}`}>
                    Ver Detalles
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredInstitutions.length === 0 && !loading && (
        <div className="text-center py-12">
          <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No se encontraron instituciones
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm
              ? "Intenta con otros términos de búsqueda"
              : "Comienza agregando tu primera institución"}
          </p>
          {canManage && (
            <Button asChild>
              <Link href="/dashboard/instituciones/nueva">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Institución
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
