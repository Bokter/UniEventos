// Dominio puro — sin dependencias de TypeORM ni NestJS
export enum EstadoEvento {
  BORRADOR = 'borrador',
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
  CANCELADO = 'cancelado',
}
