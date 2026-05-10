import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCoorganizadoresRelation1778427253123 implements MigrationInterface {
    name = 'AddCoorganizadoresRelation1778427253123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "eventos" RENAME COLUMN "imagen_url" TO "imagen_portada"`);
        await queryRunner.query(`CREATE TABLE "eventos_coorganizadores" ("evento_id" integer NOT NULL, "usuario_id" integer NOT NULL, CONSTRAINT "PK_5803e1ae62b61cba9b7efc280f2" PRIMARY KEY ("evento_id", "usuario_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_83caf8aecb6d7963fe3234b502" ON "eventos_coorganizadores" ("evento_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_216c1cc5c7a2290119d9376ce6" ON "eventos_coorganizadores" ("usuario_id") `);
        await queryRunner.query(`ALTER TABLE "transmisiones" DROP COLUMN "stream_id"`);
        await queryRunner.query(`ALTER TABLE "transmisiones" DROP COLUMN "stream_key"`);
        await queryRunner.query(`ALTER TABLE "transmisiones" DROP COLUMN "playback_id"`);
        await queryRunner.query(`ALTER TABLE "transmisiones" ADD "stream_url" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transmisiones" ADD "usuario_id" integer`);
        await queryRunner.query(`ALTER TABLE "eventos" DROP COLUMN "imagen_portada"`);
        await queryRunner.query(`ALTER TABLE "eventos" ADD "imagen_portada" text`);
        await queryRunner.query(`ALTER TABLE "transmisiones" DROP CONSTRAINT "FK_6c9a926d762125515a06ed603e4"`);
        await queryRunner.query(`ALTER TABLE "transmisiones" DROP CONSTRAINT "REL_6c9a926d762125515a06ed603e"`);
        await queryRunner.query(`ALTER TABLE "transmisiones" ADD CONSTRAINT "FK_6c9a926d762125515a06ed603e4" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transmisiones" ADD CONSTRAINT "FK_9419b706b3d91ec0181658dc37d" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "eventos_coorganizadores" ADD CONSTRAINT "FK_83caf8aecb6d7963fe3234b5028" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "eventos_coorganizadores" ADD CONSTRAINT "FK_216c1cc5c7a2290119d9376ce6e" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "eventos_coorganizadores" DROP CONSTRAINT "FK_216c1cc5c7a2290119d9376ce6e"`);
        await queryRunner.query(`ALTER TABLE "eventos_coorganizadores" DROP CONSTRAINT "FK_83caf8aecb6d7963fe3234b5028"`);
        await queryRunner.query(`ALTER TABLE "transmisiones" DROP CONSTRAINT "FK_9419b706b3d91ec0181658dc37d"`);
        await queryRunner.query(`ALTER TABLE "transmisiones" DROP CONSTRAINT "FK_6c9a926d762125515a06ed603e4"`);
        await queryRunner.query(`ALTER TABLE "transmisiones" ADD CONSTRAINT "REL_6c9a926d762125515a06ed603e" UNIQUE ("evento_id")`);
        await queryRunner.query(`ALTER TABLE "transmisiones" ADD CONSTRAINT "FK_6c9a926d762125515a06ed603e4" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "eventos" DROP COLUMN "imagen_portada"`);
        await queryRunner.query(`ALTER TABLE "eventos" ADD "imagen_portada" character varying`);
        await queryRunner.query(`ALTER TABLE "transmisiones" DROP COLUMN "usuario_id"`);
        await queryRunner.query(`ALTER TABLE "transmisiones" DROP COLUMN "stream_url"`);
        await queryRunner.query(`ALTER TABLE "transmisiones" ADD "playback_id" character varying`);
        await queryRunner.query(`ALTER TABLE "transmisiones" ADD "stream_key" character varying`);
        await queryRunner.query(`ALTER TABLE "transmisiones" ADD "stream_id" character varying`);
        await queryRunner.query(`DROP INDEX "public"."IDX_216c1cc5c7a2290119d9376ce6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_83caf8aecb6d7963fe3234b502"`);
        await queryRunner.query(`DROP TABLE "eventos_coorganizadores"`);
        await queryRunner.query(`ALTER TABLE "eventos" RENAME COLUMN "imagen_portada" TO "imagen_url"`);
    }

}
