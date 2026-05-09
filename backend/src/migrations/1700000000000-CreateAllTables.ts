import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAllTables1700000000000 implements MigrationInterface {
  name = 'CreateAllTables1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── ENUMS ──────────────────────────────────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."usuarios_rol_enum" AS ENUM('miembro', 'organizador', 'admin');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."eventos_estado_enum" AS ENUM('borrador', 'pendiente', 'aprobado', 'rechazado', 'cancelado');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // ── TABLAS SIN DEPENDENCIAS ────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "usuarios" (
        "id"              SERIAL PRIMARY KEY,
        "nombre_completo" character varying NOT NULL,
        "email"           character varying NOT NULL UNIQUE,
        "password_hash"   character varying NOT NULL,
        "rol"             "public"."usuarios_rol_enum" NOT NULL DEFAULT 'miembro',
        "activo"          boolean NOT NULL DEFAULT true,
        "created_at"      TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "categorias" (
        "id"     SERIAL PRIMARY KEY,
        "nombre" character varying NOT NULL UNIQUE,
        "activa" boolean NOT NULL DEFAULT true
      )
    `);

    // lugares: latitud/longitud como double precision para que InitialSchema las migre a numeric(10,7)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "lugares" (
        "id"       SERIAL PRIMARY KEY,
        "nombre"   character varying NOT NULL,
        "latitud"  double precision,
        "longitud" double precision
      )
    `);

    // ── TABLAS CON DEPENDENCIAS ────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "eventos" (
        "id"               SERIAL PRIMARY KEY,
        "organizador_id"   integer,
        "categoria_id"     integer,
        "lugar_id"         integer,
        "titulo"           character varying NOT NULL,
        "descripcion"      text NOT NULL,
        "fecha"            date NOT NULL,
        "hora_inicio"      time NOT NULL,
        "hora_fin"         time NOT NULL,
        "estado"           "public"."eventos_estado_enum" NOT NULL DEFAULT 'borrador',
        "observacion_admin" text,
        "imagen_url"       character varying,
        "created_at"       TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"       TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_eventos_organizador" FOREIGN KEY ("organizador_id") REFERENCES "usuarios"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_eventos_categoria"   FOREIGN KEY ("categoria_id")   REFERENCES "categorias"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_eventos_lugar"       FOREIGN KEY ("lugar_id")       REFERENCES "lugares"("id") ON DELETE SET NULL
      )
    `);

    // favoritos: SIN el UNIQUE constraint — lo agrega InitialSchema1777657385123
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "favoritos" (
        "id"         SERIAL PRIMARY KEY,
        "usuario_id" integer,
        "evento_id"  integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_favoritos_usuario" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_favoritos_evento"  FOREIGN KEY ("evento_id")  REFERENCES "eventos"("id") ON DELETE CASCADE
      )
    `);

    // transmisiones: con url_enlace para que AddMuxIntegration la elimine y agregue campos Mux
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "transmisiones" (
        "id"         SERIAL PRIMARY KEY,
        "evento_id"  integer UNIQUE,
        "url_enlace" character varying NOT NULL DEFAULT '',
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_transmisiones_evento" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "transmisiones"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "favoritos"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "eventos"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "lugares"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categorias"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "usuarios"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."eventos_estado_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."usuarios_rol_enum"`);
  }
}
