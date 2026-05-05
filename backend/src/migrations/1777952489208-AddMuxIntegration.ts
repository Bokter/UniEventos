import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMuxIntegration1777952489208 implements MigrationInterface {
    name = 'AddMuxIntegration1777952489208'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transmisiones" DROP COLUMN "url_enlace"`);
        await queryRunner.query(`ALTER TABLE "transmisiones" ADD "stream_id" character varying`);
        await queryRunner.query(`ALTER TABLE "transmisiones" ADD "stream_key" character varying`);
        await queryRunner.query(`ALTER TABLE "transmisiones" ADD "playback_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transmisiones" DROP COLUMN "playback_id"`);
        await queryRunner.query(`ALTER TABLE "transmisiones" DROP COLUMN "stream_key"`);
        await queryRunner.query(`ALTER TABLE "transmisiones" DROP COLUMN "stream_id"`);
        await queryRunner.query(`ALTER TABLE "transmisiones" ADD "url_enlace" character varying NOT NULL`);
    }

}
