import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCoorganizadoresRelation1778427253123 implements MigrationInterface {
    name = 'AddCoorganizadoresRelation1778427253123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Rename imagen_url to imagen_portada only if imagen_url exists and imagen_portada doesn't
        const tableEventos = await queryRunner.getTable("eventos");
        if (tableEventos && tableEventos.findColumnByName("imagen_url") && !tableEventos.findColumnByName("imagen_portada")) {
            await queryRunner.query(`ALTER TABLE "eventos" RENAME COLUMN "imagen_url" TO "imagen_portada"`);
        }

        // 2. Create co-organizers table if it doesn't exist
        if (!(await queryRunner.hasTable("eventos_coorganizadores"))) {
            await queryRunner.query(`CREATE TABLE "eventos_coorganizadores" ("evento_id" integer NOT NULL, "usuario_id" integer NOT NULL, CONSTRAINT "PK_5803e1ae62b61cba9b7efc280f2" PRIMARY KEY ("evento_id", "usuario_id"))`);
            await queryRunner.query(`CREATE INDEX "IDX_83caf8aecb6d7963fe3234b502" ON "eventos_coorganizadores" ("evento_id") `);
            await queryRunner.query(`CREATE INDEX "IDX_216c1cc5c7a2290119d9376ce6" ON "eventos_coorganizadores" ("usuario_id") `);
        }

        // 3. Update transmisiones columns
        const tableTransmisiones = await queryRunner.getTable("transmisiones");
        if (tableTransmisiones) {
            if (tableTransmisiones.findColumnByName("stream_id")) await queryRunner.query(`ALTER TABLE "transmisiones" DROP COLUMN "stream_id"`);
            if (tableTransmisiones.findColumnByName("stream_key")) await queryRunner.query(`ALTER TABLE "transmisiones" DROP COLUMN "stream_key"`);
            if (tableTransmisiones.findColumnByName("playback_id")) await queryRunner.query(`ALTER TABLE "transmisiones" DROP COLUMN "playback_id"`);
            if (!tableTransmisiones.findColumnByName("stream_url")) await queryRunner.query(`ALTER TABLE "transmisiones" ADD "stream_url" text NOT NULL`);
            if (!tableTransmisiones.findColumnByName("usuario_id")) await queryRunner.query(`ALTER TABLE "transmisiones" ADD "usuario_id" integer`);
        }

        // 4. Ensure imagen_portada is 'text' type
        const updatedTableEventos = await queryRunner.getTable("eventos");
        if (updatedTableEventos && updatedTableEventos.findColumnByName("imagen_portada")) {
            const column = updatedTableEventos.findColumnByName("imagen_portada");
            if (column?.type !== 'text') {
                await queryRunner.query(`ALTER TABLE "eventos" DROP COLUMN "imagen_portada"`);
                await queryRunner.query(`ALTER TABLE "eventos" ADD "imagen_portada" text`);
            }
        }

        // 5. Constraints
        // We use DROP CONSTRAINT IF EXISTS pattern or just try-catch if needed, but let's be safe
        await queryRunner.query(`ALTER TABLE "transmisiones" DROP CONSTRAINT IF EXISTS "FK_6c9a926d762125515a06ed603e4"`);
        await queryRunner.query(`ALTER TABLE "transmisiones" DROP CONSTRAINT IF EXISTS "REL_6c9a926d762125515a06ed603e"`);
        
        await queryRunner.query(`ALTER TABLE "transmisiones" ADD CONSTRAINT "FK_6c9a926d762125515a06ed603e4" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        
        const hasFkUsuario = (await queryRunner.query(`SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_9419b706b3d91ec0181658dc37d'`)).length > 0;
        if (!hasFkUsuario) {
            await queryRunner.query(`ALTER TABLE "transmisiones" ADD CONSTRAINT "FK_9419b706b3d91ec0181658dc37d" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }

        const hasFkCoorgEvento = (await queryRunner.query(`SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_83caf8aecb6d7963fe3234b5028'`)).length > 0;
        if (!hasFkCoorgEvento) {
            await queryRunner.query(`ALTER TABLE "eventos_coorganizadores" ADD CONSTRAINT "FK_83caf8aecb6d7963fe3234b5028" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        }

        const hasFkCoorgUsuario = (await queryRunner.query(`SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_216c1cc5c7a2290119d9376ce6e'`)).length > 0;
        if (!hasFkCoorgUsuario) {
            await queryRunner.query(`ALTER TABLE "eventos_coorganizadores" ADD CONSTRAINT "FK_216c1cc5c7a2290119d9376ce6e" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Down logic is usually less critical but should also be safe if possible
        await queryRunner.query(`ALTER TABLE "eventos_coorganizadores" DROP CONSTRAINT IF EXISTS "FK_216c1cc5c7a2290119d9376ce6e"`);
        await queryRunner.query(`ALTER TABLE "eventos_coorganizadores" DROP CONSTRAINT IF EXISTS "FK_83caf8aecb6d7963fe3234b5028"`);
        await queryRunner.query(`ALTER TABLE "transmisiones" DROP CONSTRAINT IF EXISTS "FK_9419b706b3d91ec0181658dc37d"`);
        await queryRunner.query(`ALTER TABLE "transmisiones" DROP CONSTRAINT IF EXISTS "FK_6c9a926d762125515a06ed603e4"`);
        
        // Restore previous state if needed
        const tableTransmisiones = await queryRunner.getTable("transmisiones");
        if (tableTransmisiones && tableTransmisiones.findColumnByName("stream_url")) {
            await queryRunner.query(`ALTER TABLE "transmisiones" DROP COLUMN "stream_url"`);
            await queryRunner.query(`ALTER TABLE "transmisiones" ADD "playback_id" character varying`);
            await queryRunner.query(`ALTER TABLE "transmisiones" ADD "stream_key" character varying`);
            await queryRunner.query(`ALTER TABLE "transmisiones" ADD "stream_id" character varying`);
        }

        if (await queryRunner.hasTable("eventos_coorganizadores")) {
            await queryRunner.query(`DROP TABLE "eventos_coorganizadores"`);
        }
        
        const tableEventos = await queryRunner.getTable("eventos");
        if (tableEventos && tableEventos.findColumnByName("imagen_portada")) {
             await queryRunner.query(`ALTER TABLE "eventos" RENAME COLUMN "imagen_portada" TO "imagen_url"`);
        }
    }

}

