import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCascadeDeleteToFavoritosAndTransmisiones1778432136828 implements MigrationInterface {
    name = 'AddCascadeDeleteToFavoritosAndTransmisiones1778432136828'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transmisiones" DROP CONSTRAINT "FK_6c9a926d762125515a06ed603e4"`);
        await queryRunner.query(`ALTER TABLE "favoritos" DROP CONSTRAINT "FK_abff59b27916b5f037d3ce01784"`);
        await queryRunner.query(`ALTER TABLE "transmisiones" ADD CONSTRAINT "FK_6c9a926d762125515a06ed603e4" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favoritos" ADD CONSTRAINT "FK_abff59b27916b5f037d3ce01784" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favoritos" DROP CONSTRAINT "FK_abff59b27916b5f037d3ce01784"`);
        await queryRunner.query(`ALTER TABLE "transmisiones" DROP CONSTRAINT "FK_6c9a926d762125515a06ed603e4"`);
        await queryRunner.query(`ALTER TABLE "favoritos" ADD CONSTRAINT "FK_abff59b27916b5f037d3ce01784" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transmisiones" ADD CONSTRAINT "FK_6c9a926d762125515a06ed603e4" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
