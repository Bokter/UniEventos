import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1777657385123 implements MigrationInterface {
    name = 'InitialSchema1777657385123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lugares" DROP COLUMN "latitud"`);
        await queryRunner.query(`ALTER TABLE "lugares" ADD "latitud" numeric(10,7)`);
        await queryRunner.query(`ALTER TABLE "lugares" DROP COLUMN "longitud"`);
        await queryRunner.query(`ALTER TABLE "lugares" ADD "longitud" numeric(10,7)`);
        await queryRunner.query(`ALTER TABLE "favoritos" ADD CONSTRAINT "UQ_3ab287b3697c4e81e95e6edbded" UNIQUE ("usuario_id", "evento_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favoritos" DROP CONSTRAINT "UQ_3ab287b3697c4e81e95e6edbded"`);
        await queryRunner.query(`ALTER TABLE "lugares" DROP COLUMN "longitud"`);
        await queryRunner.query(`ALTER TABLE "lugares" ADD "longitud" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "lugares" DROP COLUMN "latitud"`);
        await queryRunner.query(`ALTER TABLE "lugares" ADD "latitud" double precision NOT NULL`);
    }

}
