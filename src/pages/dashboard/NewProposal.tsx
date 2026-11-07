import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  CheckIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import Alert from '../../components/Alert'
import { createProposal } from '../../services/proposalService'
import { getList } from '../../services/ListService'
import Field from '../../components/forms/Field'
import FileInput from '../../components/forms/FileInput'
import Input from '../../components/forms/Input'
import Modal from '../../components/Modal'
import SectionCard from '../../components/forms/SectionCard'
import Select from '../../components/forms/Select'
import TextArea from '../../components/forms/TextArea'
import type { ApplicantType } from '../../types/proposal/ApplicantType'
import type { FormErrors } from '../../types/proposal/FormErrors'
import type { FormValues } from '../../types/proposal/FormValues'
import type { CreateProposalDto } from '../../types/proposal/CreateProposalDto'


const initialValues: FormValues = {
  applicantType: '',
  organizationName: '',
  nit: '',
  contactName: '',
  role: '',
  email: '',
  phone: '',
  title: '',
  proposalType: '',
  description: '',
  justification: '',
  startDate: '',
}

function validateForm(
  values: FormValues,
  hasFacultyApproval: boolean,
  privacyAccepted: boolean,
): FormErrors {
  const errors: FormErrors = {}

  if (!values.applicantType) {
    errors.applicantType = 'Selecciona el tipo de postulante.'
  }
  if (!values.organizationName.trim()) {
    errors.organizationName = 'Ingresa el nombre de la entidad o dependencia.'
  }
  if (values.applicantType === 'Entidad externa' && !values.nit.trim()) {
    errors.nit = 'El NIT es obligatorio para entidades externas.'
  }
  if (!values.contactName.trim()) {
    errors.contactName = 'Ingresa el nombre del contacto responsable.'
  }
  if (!values.email.trim()) {
    errors.email = 'Ingresa un correo electrónico.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Ingresa un correo electrónico válido.'
  }
  if (!values.title.trim()) {
    errors.title = 'El título de la propuesta es obligatorio.'
  }
  if (!values.proposalType) {
    errors.proposalType = 'Selecciona el tipo de propuesta.'
  }
  if (!values.description.trim()) {
    errors.description = 'Describe el objeto de la propuesta.'
  } else if (values.description.trim().length < 20) {
    errors.description = 'La descripción debe tener al menos 20 caracteres.'
  }
  if (values.applicantType === 'Facultad' && !hasFacultyApproval) {
    errors.facultyApproval = 'Adjunta el aval firmado de la facultad.'
  }
  if (!privacyAccepted) {
    errors.privacy = 'Debes autorizar el tratamiento de tus datos personales.'
  }

  return errors
}

export default function NewProposal() {
  const navigate = useNavigate()
  const [values, setValues] = useState<FormValues>(initialValues)
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({})
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [proposalFiles, setProposalFiles] = useState<File[]>([])
  const [facultyFiles, setFacultyFiles] = useState<File[]>([])
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [notification, setNotification] = useState<'draft' | 'success' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadProposalLists = async () => {
      try {
        const [applicantTypes, proposalTypes] = await Promise.all([
          getList('tipo_postulante', controller.signal),
          getList('tipo_propuesta', controller.signal),
        ])

        console.log('Listas de propuesta recibidas:', {
          tipo_postulante: applicantTypes,
          tipo_propuesta: proposalTypes,
        })
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('No fue posible cargar las listas de propuesta:', error)
        }
      }
    }

    void loadProposalLists()

    return () => controller.abort()
  }, [])

  const isFaculty = values.applicantType === 'Facultad'
  
  const errors = useMemo(
    () => validateForm(values, facultyFiles.length > 0, privacyAccepted),
    [facultyFiles.length, privacyAccepted, values],
  )
  const visibleErrorCount = Object.keys(errors).length

  const updateField = <K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }))
    setTouched((current) => ({ ...current, [field]: true }))
    setNotification(null)
    setSubmissionError(null)
  }

  const shouldShowError = (field: keyof FormErrors) =>
    submitAttempted || Boolean(touched[field as keyof FormValues])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitAttempted(true)

    if (visibleErrorCount > 0) {
      return
    }

    setSubmissionError(null)
    setConfirmationOpen(true)
  }

  const confirmSubmission = async () => {
    if (isSubmitting) {
      return
    }

    const applicantType = values.applicantType

    if (!applicantType) {
      setSubmitAttempted(true)
      setConfirmationOpen(false)
      return
    }

    const proposalDto: CreateProposalDto = {
      ...values,
      applicantType,
      privacyAccepted,
      proposalFiles,
      facultyFiles,
    }

    setIsSubmitting(true)
    setSubmissionError(null)

    try {
      console.log(proposalDto)
      await createProposal(proposalDto)
      setConfirmationOpen(false)
      setNotification('success')
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : 'No fue posible enviar la propuesta.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1216px] px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10">
      <div className="mb-5 flex items-center gap-1.5 text-[10px] text-muted">
        <span>Mis propuestas</span>
        <ChevronRightIcon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
        <strong className="font-semibold text-primary-strong">Nueva propuesta</strong>
      </div>

      <div className="mb-6">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
          Registro de propuesta
        </span>
        <h1 className="mt-1 text-[25px] font-semibold leading-[33px] tracking-[-0.025em] text-ink">
          Registrar nueva propuesta
        </h1>
        <p className="mt-1 max-w-3xl text-xs leading-5 text-muted">
          Completa la información requerida. La Asistente de Dirección revisará la propuesta antes de continuar el proceso.
        </p>
      </div>

      {submitAttempted && visibleErrorCount > 0 && (
        <div
          className="mb-4 flex items-start gap-3 rounded-lg border border-danger-line bg-danger-subtle p-3.5 text-danger"
          role="alert"
        >
          <ExclamationTriangleIcon className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
          <div>
            <strong className="text-[10px] font-semibold">
              Revisa la información del formulario
            </strong>
            <p className="mt-1 text-[9px] leading-4">
              Hay {visibleErrorCount} campos pendientes. Corrígelos antes de enviar la propuesta.
            </p>
          </div>
        </div>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_250px]">
        <form className="flex min-w-0 flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <SectionCard
            number={1}
            title="Datos de la entidad o dependencia"
            description="Identifica la organización que presenta la propuesta."
          >
            <Field
              label="Tipo de postulante"
              required
              error={shouldShowError('applicantType') ? errors.applicantType : undefined}
            >
              <Select
                error={shouldShowError('applicantType') ? errors.applicantType : undefined}
                value={values.applicantType}
                onChange={(event) => updateField('applicantType', event.target.value as ApplicantType)}
              >
                <option value="">Selecciona una opción</option>
                <option value="Entidad externa">Entidad externa</option>
                <option value="Facultad">Facultad</option>
                <option value="Instituto">Instituto</option>
                <option value="Rectoría">Rectoría</option>
              </Select>
            </Field>
            <Field
              label="Nombre de la entidad o dependencia"
              required
              error={shouldShowError('organizationName') ? errors.organizationName : undefined}
            >
              <Input
                error={shouldShowError('organizationName') ? errors.organizationName : undefined}
                value={values.organizationName}
                onChange={(event) => updateField('organizationName', event.target.value)}
                placeholder="Ej. Facultad de Ingeniería"
              />
            </Field>
            <Field
              label="NIT o identificación"
              required={values.applicantType === 'Entidad externa'}
              optional={values.applicantType !== 'Entidad externa' ? 'Opcional' : undefined}
              error={shouldShowError('nit') ? errors.nit : undefined}
              help={values.applicantType !== 'Entidad externa' ? 'Obligatorio para entidades externas.' : undefined}
            >
              <Input
                error={shouldShowError('nit') ? errors.nit : undefined}
                value={values.nit}
                onChange={(event) => updateField('nit', event.target.value)}
                placeholder="Ej. 899.999.230-7"
              />
            </Field>
          </SectionCard>

          <SectionCard
            number={2}
            title="Datos de contacto"
            description="Información de la persona responsable del proceso."
          >
            <Field
              label="Nombre del contacto responsable"
              required
              error={shouldShowError('contactName') ? errors.contactName : undefined}
            >
              <Input
                error={shouldShowError('contactName') ? errors.contactName : undefined}
                value={values.contactName}
                onChange={(event) => updateField('contactName', event.target.value)}
                placeholder="Nombre y apellidos"
              />
            </Field>
            <Field label="Cargo" optional="Opcional">
              <Input
                value={values.role}
                onChange={(event) => updateField('role', event.target.value)}
                placeholder="Ej. Directora de proyectos"
              />
            </Field>
            <Field
              label="Correo electrónico"
              required
              error={shouldShowError('email') ? errors.email : undefined}
              help={!shouldShowError('email') ? 'Aquí recibirás las notificaciones del proceso.' : undefined}
            >
              <Input
                error={shouldShowError('email') ? errors.email : undefined}
                type="email"
                value={values.email}
                onChange={(event) => updateField('email', event.target.value)}
                placeholder="nombre@entidad.edu.co"
              />
            </Field>
            <Field label="Teléfono" optional="Opcional">
              <Input
                type="tel"
                value={values.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                placeholder="Ej. 601 323 9300"
              />
            </Field>
          </SectionCard>

          <SectionCard
            number={3}
            title="Datos de la propuesta"
            description="Describe el alcance y la necesidad que atenderá."
          >
            <Field
              label="Título de la propuesta"
              required
              error={shouldShowError('title') ? errors.title : undefined}
              wide
            >
              <Input
                error={shouldShowError('title') ? errors.title : undefined}
                value={values.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Escribe un título breve y descriptivo"
              />
            </Field>
            <Field
              label="Tipo de propuesta"
              required
              error={shouldShowError('proposalType') ? errors.proposalType : undefined}
            >
              <Select
                error={shouldShowError('proposalType') ? errors.proposalType : undefined}
                value={values.proposalType}
                onChange={(event) => updateField('proposalType', event.target.value)}
              >
                <option value="">Selecciona una opción</option>
                <option value="Educación continuada">Educación continuada</option>
                <option value="Servicios académicos">Servicios académicos</option>
                <option value="Consultoría">Consultoría</option>
                <option value="Proyecto especial">Proyecto especial</option>
              </Select>
            </Field>
            <Field label="Fecha estimada de inicio" optional="Opcional">
              <Input
                type="date"
                value={values.startDate}
                onChange={(event) => updateField('startDate', event.target.value)}
              />
            </Field>
            <Field
              label="Descripción u objeto"
              required
              error={shouldShowError('description') ? errors.description : undefined}
              help={!shouldShowError('description') ? 'Sé claro y específico sobre el alcance.' : undefined}
              wide
            >
              <TextArea
                error={shouldShowError('description') ? errors.description : undefined}
                maxLength={1000}
                value={values.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Describe el propósito, alcance y resultados esperados de la propuesta."
              />
              <span className="flex items-center justify-between gap-3 text-[8px] text-muted">
                <span>{shouldShowError('description') ? errors.description : ' '}</span>
                <span>{values.description.length} / 1000</span>
              </span>
            </Field>
            <Field label="Justificación o necesidad" optional="Recomendado" wide>
              <TextArea
                value={values.justification}
                onChange={(event) => updateField('justification', event.target.value)}
                placeholder="Explica la situación que motiva esta propuesta y su importancia."
              />
            </Field>
          </SectionCard>

          <SectionCard
            number={4}
            title="Documentos adjuntos"
            description="Agrega los soportes necesarios para la revisión inicial."
          >
            <div className="md:col-span-2">
              <FileInput
                onFilesChange={setProposalFiles}
                acceptedFormatsLabel="PDF, DOCX o XLSX"
                maxSizeMb={20}
                multiple
              />
              {proposalFiles.length > 0 && (
                <p className="mt-2 text-[8px] text-muted">
                  {proposalFiles.length} archivo{proposalFiles.length === 1 ? '' : 's'} válido{proposalFiles.length === 1 ? '' : 's'} seleccionado{proposalFiles.length === 1 ? '' : 's'}.
                </p>
              )}
            </div>
            {isFaculty && (
              <div className="border-t border-line-soft pt-3.5 md:col-span-2">
                <div className="mb-2.5 flex items-start justify-between gap-3">
                  <div>
                    <strong className="text-[10px] font-semibold text-ink">
                      Aval de la facultad <span className="text-danger">*</span>
                    </strong>
                    <p className="mt-0.5 text-[8px] leading-3 text-muted">
                      Las propuestas originadas en una facultad requieren su aval.
                    </p>
                  </div>
                  <span className="rounded-full bg-warning-soft px-1.5 py-1 text-[8px] font-semibold text-warning">
                    Obligatorio
                  </span>
                </div>
                <FileInput
                  accept=".pdf"
                  acceptedFormatsLabel="PDF"
                  maxSizeMb={10}
                  multiple={false}
                  onFilesChange={setFacultyFiles}
                />
                {shouldShowError('facultyApproval') && errors.facultyApproval && (
                  <p className="mt-1.5 text-[8px] text-danger">{errors.facultyApproval}</p>
                )}
              </div>
            )}
          </SectionCard>

          <label
            className={`flex items-start gap-2.5 rounded-lg border p-3.5 text-[9px] leading-[15px] text-body ${
              shouldShowError('privacy')
                ? 'border-danger bg-danger-subtle'
                : 'border-line bg-white'
            }`}
          >
            <input
              className="mt-px size-[15px] shrink-0 accent-primary"
              type="checkbox"
              checked={privacyAccepted}
              onChange={(event) => {
                setPrivacyAccepted(event.target.checked)
                setNotification(null)
                setSubmissionError(null)
              }}
            />
            <span>
              Autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012. Consulta la{' '}
              <button className="font-semibold text-primary-strong underline" type="button">
                política de tratamiento de datos
              </button>
              . <strong className="text-danger">*</strong>
              {shouldShowError('privacy') && errors.privacy && (
                <span className="mt-1 block text-[8px] text-danger">{errors.privacy}</span>
              )}
            </span>
          </label>

          <div className="sticky bottom-0 z-10 flex min-h-16 flex-col items-stretch justify-between gap-3 rounded-lg border border-line bg-white/95 p-3 shadow-[0_-6px_20px_rgba(38,38,38,0.07)] backdrop-blur sm:flex-row sm:items-center">
            <button
              className="border-0 bg-transparent px-2.5 py-2 text-left text-[10px] font-semibold text-muted hover:text-primary-strong"
              type="button"
              onClick={() => navigate('/dashboard')}
            >
              Cancelar
            </button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                className="h-[38px] rounded-md border border-line bg-white px-3.5 text-[10px] font-semibold text-body hover:bg-primary-soft"
                type="button"
                onClick={() => setNotification('draft')}
              >
                Guardar borrador
              </button>
              <button
                className="inline-flex h-[38px] items-center justify-center gap-2 rounded-md bg-primary px-3.5 text-[10px] font-semibold text-white shadow-[0_2px_4px_rgba(255,78,0,0.18)] hover:bg-primary-hover"
                type="submit"
              >
                <PlusIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />
                Enviar propuesta
              </button>
            </div>
          </div>
        </form>

        <aside className="sticky top-4 hidden overflow-hidden rounded-lg border border-line bg-white shadow-[0_4px_14px_rgba(38,38,38,0.05)] lg:block">
          <div className="flex items-center gap-2.5 border-b border-line-soft p-3.5">
            <span className="grid size-[34px] place-items-center rounded-lg bg-primary-soft text-primary-strong">
              <CheckIcon className="size-[19px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div>
              <strong className="text-[10px] font-semibold text-ink">
                Información del registro
              </strong>
              <p className="mt-px text-[8px] text-muted">Datos generados por el sistema</p>
            </div>
          </div>
          <dl className="px-3.5 py-1">
            <div className="border-b border-line-soft py-2.5">
              <dt className="text-[8px] text-muted">Radicado</dt>
              <dd className="mt-1 text-[9px] font-semibold text-ink">Se asignará al enviar</dd>
            </div>
            <div className="border-b border-line-soft py-2.5">
              <dt className="text-[8px] text-muted">Estado</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2 py-1 text-[8px] font-semibold text-primary-strong">
                  <span className="size-[5px] rounded-full bg-current" />
                  Registrada
                </span>
              </dd>
            </div>
            <div className="border-b border-line-soft py-2.5">
              <dt className="text-[8px] text-muted">Postulante</dt>
              <dd className="mt-1 text-[9px] font-semibold text-ink">Mariana López</dd>
            </div>
            <div className="py-2.5">
              <dt className="text-[8px] text-muted">Fecha de registro</dt>
              <dd className="mt-1 text-[9px] font-semibold text-ink">12 oct 2026</dd>
            </div>
          </dl>
          <div className="m-3 rounded-md bg-primary-soft p-2.5 text-[8px] leading-[13px] text-body">
            Podrás guardar la propuesta como borrador y continuar más adelante.
          </div>
        </aside>
      </div>

      <Modal
        open={confirmationOpen}
        title="¿Enviar propuesta?"
        description="Una vez enviada, la Asistente de Dirección la revisará. Podrás consultar el avance desde “Mis propuestas”."
        icon={<CheckIcon className="size-[19px]" strokeWidth={1.8} aria-hidden="true" />}
        onClose={() => {
          if (!isSubmitting) {
            setConfirmationOpen(false)
          }
        }}
        footer={
          <>
            <button
              className="h-[38px] rounded-md border border-line bg-white px-3.5 text-[10px] font-semibold text-body hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={isSubmitting}
              onClick={() => setConfirmationOpen(false)}
            >
              Volver al formulario
            </button>
            <button
              className="h-[38px] rounded-md bg-primary px-3.5 text-[10px] font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              disabled={isSubmitting}
              onClick={confirmSubmission}
            >
              {isSubmitting ? 'Enviando…' : 'Sí, enviar propuesta'}
            </button>
          </>
        }
      >
        {submissionError && (
          <p className="mx-auto mt-3 max-w-[340px] rounded-md border border-danger-line bg-danger-subtle px-3 py-2 text-left text-[9px] leading-4 text-danger" role="alert">
            {submissionError}
          </p>
        )}
      </Modal>

      <Alert
        open={notification !== null}
        variant="success"
        title={notification === 'success' ? 'Propuesta enviada correctamente' : 'Borrador guardado'}
        description={
          notification === 'success'
            ? 'La propuesta fue registrada correctamente.'
            : 'Podrás continuar editando la propuesta más adelante.'
        }
        icon={<CheckIcon className="size-[19px]" strokeWidth={1.8} aria-hidden="true" />}
        action={
          notification === 'success' ? (
            <button
              className="rounded-md border-0 bg-primary-soft px-2 py-1.5 text-[8px] font-semibold text-primary-strong"
              type="button"
              onClick={() => navigate('/dashboard/proposals')}
            >
              Ver estado
            </button>
          ) : undefined
        }
      />
    </div>
  )
}
