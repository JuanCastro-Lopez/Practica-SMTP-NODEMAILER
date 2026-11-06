import { RolEntity } from "src/rol/entities/rol.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('usuarios')
export class UsuarioEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: 'varchar', length: 100, nullable: false})
    nombre!: string;

    @Column({type: 'varchar', length: 150, unique: true, nullable: false})
    email!: string;

    @Column({type: 'varchar', length: 255, nullable: false, select: false})
    password!: string;

    @Column({type: 'boolean', default: true})
    activo!: boolean;

    //Campos temporales para el inicio de sesion OTP
    @Column({type: 'varchar', length: 6, nullable: true})
    otpCode?: string | null;

    @Column({type: 'datetime', nullable: true})
    otpExpiresAt?: Date | null;

    @Column()
    rolId!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @ManyToOne(() => RolEntity, (rol) => rol.usuarios, {
        eager: true, // Cargar automáticamente la relación con RolEntity al obtener un UsuarioEntity
        onDelete: 'RESTRICT', // Evitar la eliminación de un rol si hay usuarios asociados
    })
    rol!: RolEntity;
}