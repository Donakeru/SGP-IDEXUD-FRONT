export type UpdateProposalStatusDto = {
  estadoDestino: 'En Revision por Direccion' | 'Aceptado' | 'Rechazado'
  idUsuario: number
  motivo: string
}
