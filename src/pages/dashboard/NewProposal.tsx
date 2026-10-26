import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import FileInput from '../../components/FileInput'

type ApplicantType = '' | 'Entidad externa' | 'Facultad' | 'Instituto' | 'Rectoría'

type FormValues = {
  applicantType: ApplicantType
  organizationName: string
  nit: string
  contactName: string
  role: string
  email: string
  phone: string
  title: string
  proposalType: string
  description: string
  justification: string
  startDate: string
}

type FormErrors = Partial<Record<keyof FormValues | 'facultyApproval' | 'privacy', string>>

type FieldProps = {
  label: string
  required?: boolean
  optional?: string
  error?: string
  help?: string
  children: ReactNode
  wide?: boolean
}

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

function Field({
  label,
  required,
  optional,
  error,
  help,
  children,
  wide = false,
}: FieldProps) {
  return (
    <label className={`flex flex-col gap-1.5 ${wide ? 'md:col-span-2' : ''}`}>
      <span className="flex items-center gap-2 text-[10px] font-semibold text-[#172033]">
        {label}
        {required && <strong className="text-[#a33a3a]">*</strong>}
        {optional && (
          <em className="font-normal not-italic text-[#8a94a6]">{optional}</em>
        )}
      </span>
      {children}
      {(error || help) && (
        <small className={`text-[8px] leading-3 ${error ? 'text-[#a33a3a]' : 'text-[#667085]'}`}>
          {error ?? help}
        </small>
      )}
    </label>
  )
}

function SectionCard({
  number,
  title,
  description,
  children,
}: {
  number: number
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#dde2ea] bg-white shadow-[0_4px_14px_rgba(23,32,51,0.05)]">
      <header className="flex min-h-[68px] items-center gap-3 border-b border-[#e9edf2] px-4 py-3.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#edf3f9] text-xs font-bold text-[#1f3a5f]">
          {number}
        </span>
        <div>
          <h2 className="text-[13px] font-semibold leading-[19px] text-[#172033]">
            {title}
          </h2>
          <p className="mt-px text-[9px] leading-[14px] text-[#667085]">
            {description}
          </p>
        </div>
      </header>
      <div className="grid gap-4 p-4 md:grid-cols-2">{children}</div>
    </section>
  )
}

function inputClass(error?: string) {
  return `min-h-[38px] w-full rounded-md border bg-white px-2.5 text-[10px] text-[#172033] outline-none transition-colors placeholder:text-[#8a94a6] focus:border-[#1f3a5f] focus:ring-4 focus:ring-[#1f3a5f]/10 ${
    error ? 'border-[#a33a3a] bg-[#fffafa]' : 'border-[#dde2ea]'
  }`
}

function textareaClass(error?: string) {
  return `${inputClass(error)} min-h-[88px] resize-y py-2 leading-4`
}

function ChevronIcon() {
  return (
    <svg
      className="size-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg
      className="size-[18px] shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 2 21h20z" />
      <path strokeLinecap="round" d="M12 9v5m0 3h.01" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      className="size-[19px] shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  )
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
  }

  const shouldShowError = (field: keyof FormErrors) =>
    submitAttempted || Boolean(touched[field as keyof FormValues])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitAttempted(true)

    if (visibleErrorCount > 0) {
      return
    }

    setConfirmationOpen(true)
  }

  const confirmSubmission = () => {
    setConfirmationOpen(false)
    setNotification('success')
  }

  return (
    <div className="mx-auto w-full max-w-[1216px] px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10">
      <div className="mb-5 flex items-center gap-1.5 text-[10px] text-[#667085]">
        <span>Mis propuestas</span>
        <ChevronIcon />
        <strong className="font-semibold text-[#1f3a5f]">Nueva propuesta</strong>
      </div>

      <div className="mb-6">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#667085]">
          Registro de propuesta
        </span>
        <h1 className="mt-1 text-[25px] font-semibold leading-[33px] tracking-[-0.025em] text-[#172033]">
          Registrar nueva propuesta
        </h1>
        <p className="mt-1 max-w-3xl text-xs leading-5 text-[#667085]">
          Completa la información requerida. La Asistente de Dirección revisará la propuesta antes de continuar el proceso.
        </p>
      </div>

      {submitAttempted && visibleErrorCount > 0 && (
        <div
          className="mb-4 flex items-start gap-3 rounded-lg border border-[#efcaca] bg-[#fffafa] p-3.5 text-[#a33a3a]"
          role="alert"
        >
          <WarningIcon />
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
              <select
                className={inputClass(shouldShowError('applicantType') ? errors.applicantType : undefined)}
                value={values.applicantType}
                onChange={(event) => updateField('applicantType', event.target.value as ApplicantType)}
              >
                <option value="">Selecciona una opción</option>
                <option value="Entidad externa">Entidad externa</option>
                <option value="Facultad">Facultad</option>
                <option value="Instituto">Instituto</option>
                <option value="Rectoría">Rectoría</option>
              </select>
            </Field>
            <Field
              label="Nombre de la entidad o dependencia"
              required
              error={shouldShowError('organizationName') ? errors.organizationName : undefined}
            >
              <input
                className={inputClass(shouldShowError('organizationName') ? errors.organizationName : undefined)}
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
              <input
                className={inputClass(shouldShowError('nit') ? errors.nit : undefined)}
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
              <input
                className={inputClass(shouldShowError('contactName') ? errors.contactName : undefined)}
                value={values.contactName}
                onChange={(event) => updateField('contactName', event.target.value)}
                placeholder="Nombre y apellidos"
              />
            </Field>
            <Field label="Cargo" optional="Opcional">
              <input
                className={inputClass()}
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
              <input
                className={inputClass(shouldShowError('email') ? errors.email : undefined)}
                type="email"
                value={values.email}
                onChange={(event) => updateField('email', event.target.value)}
                placeholder="nombre@entidad.edu.co"
              />
            </Field>
            <Field label="Teléfono" optional="Opcional">
              <input
                className={inputClass()}
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
              <input
                className={inputClass(shouldShowError('title') ? errors.title : undefined)}
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
              <select
                className={inputClass(shouldShowError('proposalType') ? errors.proposalType : undefined)}
                value={values.proposalType}
                onChange={(event) => updateField('proposalType', event.target.value)}
              >
                <option value="">Selecciona una opción</option>
                <option value="Educación continuada">Educación continuada</option>
                <option value="Servicios académicos">Servicios académicos</option>
                <option value="Consultoría">Consultoría</option>
                <option value="Proyecto especial">Proyecto especial</option>
              </select>
            </Field>
            <Field label="Fecha estimada de inicio" optional="Opcional">
              <input
                className={inputClass()}
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
              <textarea
                className={textareaClass(shouldShowError('description') ? errors.description : undefined)}
                maxLength={1000}
                value={values.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Describe el propósito, alcance y resultados esperados de la propuesta."
              />
              <span className="flex items-center justify-between gap-3 text-[8px] text-[#667085]">
                <span>{shouldShowError('description') ? errors.description : ' '}</span>
                <span>{values.description.length} / 1000</span>
              </span>
            </Field>
            <Field label="Justificación o necesidad" optional="Recomendado" wide>
              <textarea
                className={textareaClass()}
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
                <p className="mt-2 text-[8px] text-[#667085]">
                  {proposalFiles.length} archivo{proposalFiles.length === 1 ? '' : 's'} válido{proposalFiles.length === 1 ? '' : 's'} seleccionado{proposalFiles.length === 1 ? '' : 's'}.
                </p>
              )}
            </div>
            {isFaculty && (
              <div className="border-t border-[#e9edf2] pt-3.5 md:col-span-2">
                <div className="mb-2.5 flex items-start justify-between gap-3">
                  <div>
                    <strong className="text-[10px] font-semibold text-[#172033]">
                      Aval de la facultad <span className="text-[#a33a3a]">*</span>
                    </strong>
                    <p className="mt-0.5 text-[8px] leading-3 text-[#667085]">
                      Las propuestas originadas en una facultad requieren su aval.
                    </p>
                  </div>
                  <span className="rounded-full bg-[#fff4dc] px-1.5 py-1 text-[8px] font-semibold text-[#8a5800]">
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
                  <p className="mt-1.5 text-[8px] text-[#a33a3a]">{errors.facultyApproval}</p>
                )}
              </div>
            )}
          </SectionCard>

          <label
            className={`flex items-start gap-2.5 rounded-lg border p-3.5 text-[9px] leading-[15px] text-[#4e5a6d] ${
              shouldShowError('privacy')
                ? 'border-[#a33a3a] bg-[#fffafa]'
                : 'border-[#dde2ea] bg-white'
            }`}
          >
            <input
              className="mt-px size-[15px] shrink-0 accent-[#1f3a5f]"
              type="checkbox"
              checked={privacyAccepted}
              onChange={(event) => {
                setPrivacyAccepted(event.target.checked)
                setNotification(null)
              }}
            />
            <span>
              Autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012. Consulta la{' '}
              <button className="font-semibold text-[#1f3a5f] underline" type="button">
                política de tratamiento de datos
              </button>
              . <strong className="text-[#a33a3a]">*</strong>
              {shouldShowError('privacy') && errors.privacy && (
                <span className="mt-1 block text-[8px] text-[#a33a3a]">{errors.privacy}</span>
              )}
            </span>
          </label>

          <div className="sticky bottom-0 z-10 flex min-h-16 flex-col items-stretch justify-between gap-3 rounded-lg border border-[#dde2ea] bg-white/95 p-3 shadow-[0_-6px_20px_rgba(23,32,51,0.07)] backdrop-blur sm:flex-row sm:items-center">
            <button
              className="border-0 bg-transparent px-2.5 py-2 text-left text-[10px] font-semibold text-[#667085] hover:text-[#1f3a5f]"
              type="button"
              onClick={() => navigate('/dashboard')}
            >
              Cancelar
            </button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                className="h-[38px] rounded-md border border-[#dde2ea] bg-white px-3.5 text-[10px] font-semibold text-[#4f5d72] hover:bg-[#edf3f9]"
                type="button"
                onClick={() => setNotification('draft')}
              >
                Guardar borrador
              </button>
              <button
                className="inline-flex h-[38px] items-center justify-center gap-2 rounded-md bg-[#1f3a5f] px-3.5 text-[10px] font-semibold text-white shadow-[0_2px_4px_rgba(31,58,95,0.18)] hover:bg-[#172e4d]"
                type="submit"
              >
                <PlusIcon />
                Enviar propuesta
              </button>
            </div>
          </div>
        </form>

        <aside className="sticky top-4 hidden overflow-hidden rounded-lg border border-[#dde2ea] bg-white shadow-[0_4px_14px_rgba(23,32,51,0.05)] lg:block">
          <div className="flex items-center gap-2.5 border-b border-[#e9edf2] p-3.5">
            <span className="grid size-[34px] place-items-center rounded-lg bg-[#edf3f9] text-[#1f3a5f]">
              <CheckIcon />
            </span>
            <div>
              <strong className="text-[10px] font-semibold text-[#172033]">
                Información del registro
              </strong>
              <p className="mt-px text-[8px] text-[#667085]">Datos generados por el sistema</p>
            </div>
          </div>
          <dl className="px-3.5 py-1">
            <div className="border-b border-[#e9edf2] py-2.5">
              <dt className="text-[8px] text-[#667085]">Radicado</dt>
              <dd className="mt-1 text-[9px] font-semibold text-[#172033]">Se asignará al enviar</dd>
            </div>
            <div className="border-b border-[#e9edf2] py-2.5">
              <dt className="text-[8px] text-[#667085]">Estado</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf3f9] px-2 py-1 text-[8px] font-semibold text-[#1f3a5f]">
                  <span className="size-[5px] rounded-full bg-current" />
                  Registrada
                </span>
              </dd>
            </div>
            <div className="border-b border-[#e9edf2] py-2.5">
              <dt className="text-[8px] text-[#667085]">Postulante</dt>
              <dd className="mt-1 text-[9px] font-semibold text-[#172033]">Mariana López</dd>
            </div>
            <div className="py-2.5">
              <dt className="text-[8px] text-[#667085]">Fecha de registro</dt>
              <dd className="mt-1 text-[9px] font-semibold text-[#172033]">12 oct 2026</dd>
            </div>
          </dl>
          <div className="m-3 rounded-md bg-[#edf3f9] p-2.5 text-[8px] leading-[13px] text-[#4e5f74]">
            Podrás guardar la propuesta como borrador y continuar más adelante.
          </div>
        </aside>
      </div>

      {confirmationOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#172033]/50 p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmation-title"
        >
          <div className="w-full max-w-[420px] rounded-lg bg-white p-6 text-center shadow-[0_18px_48px_rgba(23,32,51,0.22)]">
            <span className="mx-auto mb-3.5 grid size-[46px] place-items-center rounded-full bg-[#edf3f9] text-[#1f3a5f]">
              <CheckIcon />
            </span>
            <h2 id="confirmation-title" className="text-[17px] font-semibold leading-6 text-[#172033]">
              ¿Enviar propuesta?
            </h2>
            <p className="mx-auto mt-2 max-w-[340px] text-[10px] leading-4 text-[#667085]">
              Una vez enviada, la Asistente de Dirección la revisará. Podrás consultar el avance desde “Mis propuestas”.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <button
                className="h-[38px] rounded-md border border-[#dde2ea] bg-white px-3.5 text-[10px] font-semibold text-[#4f5d72] hover:bg-[#edf3f9]"
                type="button"
                onClick={() => setConfirmationOpen(false)}
              >
                Volver al formulario
              </button>
              <button
                className="h-[38px] rounded-md bg-[#1f3a5f] px-3.5 text-[10px] font-semibold text-white hover:bg-[#172e4d]"
                type="button"
                onClick={confirmSubmission}
              >
                Sí, enviar propuesta
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div
          className="fixed bottom-5 right-5 z-40 flex w-[min(390px,calc(100vw-40px))] items-center gap-2.5 rounded-lg border border-[#b9dfcb] bg-white p-3 shadow-[0_12px_32px_rgba(23,32,51,0.16)]"
          role="status"
        >
          <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[#eaf7f0] text-[#176b47]">
            <CheckIcon />
          </span>
          <div className="min-w-0 flex-1">
            <strong className="text-[10px] font-semibold text-[#176b47]">
              {notification === 'success' ? 'Propuesta enviada correctamente' : 'Borrador guardado'}
            </strong>
            <p className="mt-0.5 text-[8px] text-[#667085]">
              {notification === 'success'
                ? 'Se asignó el radicado PROP-2026-015.'
                : 'Podrás continuar editando la propuesta más adelante.'}
            </p>
          </div>
          {notification === 'success' && (
            <button
              className="rounded-md border-0 bg-[#edf3f9] px-2 py-1.5 text-[8px] font-semibold text-[#1f3a5f]"
              type="button"
              onClick={() => navigate('/dashboard/proposals')}
            >
              Ver estado
            </button>
          )}
        </div>
      )}
    </div>
  )
}
