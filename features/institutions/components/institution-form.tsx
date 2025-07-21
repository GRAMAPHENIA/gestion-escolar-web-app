"use client";

import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Institution, InstitutionFormData } from '../types';
import { institutionSchema } from '../utils/institution-validation';

interface InstitutionFormProps {
  institution?: Institution;
  onSubmit: (data: InstitutionFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
}

export function InstitutionForm({
  institution,
  onSubmit,
  onCancel,
  loading = false,
  className,
}: InstitutionFormProps) {
  const form = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
    defaultValues: {
      name: institution?.name || '',
      address: institution?.address || '',
      phone: institution?.phone || '',
      email: institution?.email || '',
    },
    mode: 'onChange', // Enable real-time validation
  });

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const isEditMode = !!institution;

  // Auto-save functionality for drafts
  useEffect(() => {
    if (!isEditMode) return; // Only auto-save in edit mode

    const subscription = form.watch((data) => {
      // Clear previous timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout for auto-save
      autoSaveTimeoutRef.current = setTimeout(() => {
        const formData = form.getValues();
        const isValid = form.formState.isValid;
        const isDirty = form.formState.isDirty;

        if (isValid && isDirty) {
          // Save to localStorage as draft
          localStorage.setItem(
            `institution-draft-${institution.id}`,
            JSON.stringify(formData)
          );
        }
      }, 2000); // Auto-save after 2 seconds of inactivity
    });

    return () => {
      subscription.unsubscribe();
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [form, institution?.id, isEditMode]);

  // Load draft on mount for edit mode
  useEffect(() => {
    if (isEditMode && institution) {
      const draftKey = `institution-draft-${institution.id}`;
      const savedDraft = localStorage.getItem(draftKey);
      
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft);
          // Only load draft if it's different from current values
          const currentValues = form.getValues();
          const isDifferent = Object.keys(draftData).some(
            key => draftData[key] !== currentValues[key as keyof InstitutionFormData]
          );
          
          if (isDifferent) {
            form.reset(draftData);
          }
        } catch (error) {
          console.warn('Failed to load draft:', error);
          localStorage.removeItem(draftKey);
        }
      }
    }
  }, [form, institution, isEditMode]);

  const handleSubmit = async (data: InstitutionFormData) => {
    try {
      await onSubmit(data);
      
      // Clear draft after successful submission
      if (isEditMode && institution) {
        localStorage.removeItem(`institution-draft-${institution.id}`);
      }
      
      // Reset form if creating new institution
      if (!isEditMode) {
        form.reset();
      }
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    // Clear any pending auto-save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Ask for confirmation if form is dirty
    if (form.formState.isDirty) {
      const confirmDiscard = window.confirm(
        '¿Estás seguro de que quieres descartar los cambios?'
      );
      if (!confirmDiscard) return;
    }

    // Clear draft
    if (isEditMode && institution) {
      localStorage.removeItem(`institution-draft-${institution.id}`);
    }

    form.reset();
    onCancel?.();
  };

  const { isValid, isDirty, errors } = form.formState;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Institution Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nombre de la Institución *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingresa el nombre de la institución"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ingresa la dirección de la institución"
                    className="min-h-[80px]"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingresa el número de teléfono"
                    type="tel"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingresa el email de contacto"
                    type="email"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2">
              {/* Auto-save indicator */}
              {isEditMode && isDirty && (
                <span className="text-sm text-muted-foreground">
                  Guardado automático activado
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              )}

              <Button
                type="submit"
                disabled={loading || !isValid || (!isDirty && isEditMode)}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditMode ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditMode ? 'Actualizar' : 'Crear Institución'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Form Status */}
          {hasErrors && (
            <div className="text-sm text-destructive">
              Por favor, corrige los errores antes de continuar.
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}