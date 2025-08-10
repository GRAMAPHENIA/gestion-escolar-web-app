"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, X, AlertCircle, CheckCircle2 } from 'lucide-react';

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
import { institutionSchema, validateField, validationMessages } from '../utils/institution-validation';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InstitutionFormProps {
  institution?: Institution;
  onSubmit: (data: InstitutionFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
  existingNames?: string[]; // Para validación de nombres duplicados
  serverError?: string | null; // Para mostrar errores del servidor
  onServerErrorClear?: () => void; // Para limpiar errores del servidor
}

export function InstitutionForm({
  institution,
  onSubmit,
  onCancel,
  loading = false,
  className,
  existingNames = [],
  serverError,
  onServerErrorClear,
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
  const [fieldValidationStates, setFieldValidationStates] = useState<Record<string, 'validating' | 'valid' | 'invalid' | null>>({});
  const [realTimeErrors, setRealTimeErrors] = useState<Record<string, string>>({});

  // Debounced validation for real-time feedback
  const validateFieldRealTime = useCallback((fieldName: keyof InstitutionFormData, value: string) => {
    setFieldValidationStates(prev => ({ ...prev, [fieldName]: 'validating' }));
    
    setTimeout(() => {
      const error = validateField[fieldName](value);
      
      // Check for duplicate name if it's the name field
      if (fieldName === 'name' && !error && value.trim()) {
        const isDuplicate = existingNames.some(name => 
          name.toLowerCase() === value.trim().toLowerCase() && 
          (!institution || name.toLowerCase() !== institution.name.toLowerCase())
        );
        
        if (isDuplicate) {
          setRealTimeErrors(prev => ({ ...prev, [fieldName]: validationMessages.duplicateName }));
          setFieldValidationStates(prev => ({ ...prev, [fieldName]: 'invalid' }));
          return;
        }
      }
      
      setRealTimeErrors(prev => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[fieldName] = error;
        } else {
          delete newErrors[fieldName];
        }
        return newErrors;
      });
      
      setFieldValidationStates(prev => ({ 
        ...prev, 
        [fieldName]: error ? 'invalid' : (value.trim() ? 'valid' : null)
      }));
    }, 300); // 300ms debounce
  }, [existingNames, institution]);

  // Clear server error when user starts typing
  const handleFieldChange = useCallback((fieldName: keyof InstitutionFormData, value: string) => {
    if (serverError && onServerErrorClear) {
      onServerErrorClear();
    }
    validateFieldRealTime(fieldName, value);
  }, [serverError, onServerErrorClear, validateFieldRealTime]);

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
      {/* Server Error Alert */}
      {serverError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {serverError}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Institution Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Nombre de la Institución *
                  {fieldValidationStates.name === 'validating' && (
                    <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                  )}
                  {fieldValidationStates.name === 'valid' && (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  )}
                  {fieldValidationStates.name === 'invalid' && (
                    <AlertCircle className="w-3 h-3 text-destructive" />
                  )}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingresa el nombre de la institución"
                    {...field}
                    disabled={loading}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange('name', e.target.value);
                    }}
                    className={
                      fieldValidationStates.name === 'invalid' ? 'border-destructive' :
                      fieldValidationStates.name === 'valid' ? 'border-green-500' : ''
                    }
                  />
                </FormControl>
                <FormMessage />
                {realTimeErrors.name && (
                  <p className="text-sm text-destructive mt-1">{realTimeErrors.name}</p>
                )}
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Dirección
                  {fieldValidationStates.address === 'validating' && (
                    <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                  )}
                  {fieldValidationStates.address === 'valid' && (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  )}
                  {fieldValidationStates.address === 'invalid' && (
                    <AlertCircle className="w-3 h-3 text-destructive" />
                  )}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ingresa la dirección de la institución (opcional)"
                    className={`min-h-[80px] ${
                      fieldValidationStates.address === 'invalid' ? 'border-destructive' :
                      fieldValidationStates.address === 'valid' ? 'border-green-500' : ''
                    }`}
                    {...field}
                    disabled={loading}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange('address', e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
                {realTimeErrors.address && (
                  <p className="text-sm text-destructive mt-1">{realTimeErrors.address}</p>
                )}
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Teléfono
                  {fieldValidationStates.phone === 'validating' && (
                    <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                  )}
                  {fieldValidationStates.phone === 'valid' && (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  )}
                  {fieldValidationStates.phone === 'invalid' && (
                    <AlertCircle className="w-3 h-3 text-destructive" />
                  )}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: +1234567890, (123) 456-7890"
                    type="tel"
                    {...field}
                    disabled={loading}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange('phone', e.target.value);
                    }}
                    className={
                      fieldValidationStates.phone === 'invalid' ? 'border-destructive' :
                      fieldValidationStates.phone === 'valid' ? 'border-green-500' : ''
                    }
                  />
                </FormControl>
                <FormMessage />
                {realTimeErrors.phone && (
                  <p className="text-sm text-destructive mt-1">{realTimeErrors.phone}</p>
                )}
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Email
                  {fieldValidationStates.email === 'validating' && (
                    <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                  )}
                  {fieldValidationStates.email === 'valid' && (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  )}
                  {fieldValidationStates.email === 'invalid' && (
                    <AlertCircle className="w-3 h-3 text-destructive" />
                  )}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="contacto@institucion.edu"
                    type="email"
                    {...field}
                    disabled={loading}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange('email', e.target.value);
                    }}
                    className={
                      fieldValidationStates.email === 'invalid' ? 'border-destructive' :
                      fieldValidationStates.email === 'valid' ? 'border-green-500' : ''
                    }
                  />
                </FormControl>
                <FormMessage />
                {realTimeErrors.email && (
                  <p className="text-sm text-destructive mt-1">{realTimeErrors.email}</p>
                )}
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
                disabled={
                  loading || 
                  !isValid || 
                  (!isDirty && isEditMode) || 
                  Object.keys(realTimeErrors).length > 0 ||
                  Object.values(fieldValidationStates).some(state => state === 'validating')
                }
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
          {(hasErrors || Object.keys(realTimeErrors).length > 0) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Por favor, corrige los errores antes de continuar.
                {Object.keys(realTimeErrors).length > 0 && (
                  <ul className="mt-2 list-disc list-inside">
                    {Object.entries(realTimeErrors).map(([field, error]) => (
                      <li key={field} className="text-sm">
                        <strong>{field === 'name' ? 'Nombre' : field === 'address' ? 'Dirección' : field === 'phone' ? 'Teléfono' : 'Email'}:</strong> {error}
                      </li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Success indicator for valid form */}
          {isValid && isDirty && Object.keys(realTimeErrors).length === 0 && !hasErrors && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Todos los campos son válidos. {isEditMode ? 'Puede guardar los cambios.' : 'Puede crear la institución.'}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </Form>
    </div>
  );
}