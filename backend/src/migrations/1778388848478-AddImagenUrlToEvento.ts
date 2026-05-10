import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImagenUrlToEvento1778388848478 implements MigrationInterface {
    name = 'AddImagenUrlToEvento1778388848478'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("eventos");
        if (table && !table.findColumnByName("imagen_url") && !table.findColumnByName("imagen_portada")) {
            await queryRunner.query(`ALTER TABLE "eventos" ADD "imagen_url" character varying`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("eventos");
        if (table && table.findColumnByName("imagen_url")) {
            await queryRunner.query(`ALTER TABLE "eventos" DROP COLUMN "imagen_url"`);
        }
    }

}
