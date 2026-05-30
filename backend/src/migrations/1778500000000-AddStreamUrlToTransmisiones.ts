import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStreamUrlToTransmisiones1778500000000 implements MigrationInterface {
    name = 'AddStreamUrlToTransmisiones1778500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("transmisiones");
        if (table && !table.findColumnByName("stream_url")) {
            await queryRunner.query(`ALTER TABLE "transmisiones" ADD "stream_url" text`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("transmisiones");
        if (table && table.findColumnByName("stream_url")) {
            await queryRunner.query(`ALTER TABLE "transmisiones" DROP COLUMN "stream_url"`);
        }
    }
}
