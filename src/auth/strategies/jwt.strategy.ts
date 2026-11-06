import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuarioEntity } from 'src/usuarios/entities/usuario.entity';
import { UsuariosService } from 'src/usuarios/usuarios.service';

interface JwtPayload {
    sub: number;
    email: string;
    rol?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        private readonly usuariosService: UsuariosService,
    ) {
        super({
            //Extraer el token del header de la petición
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload): Promise<UsuarioEntity> {
        const usuario = await this.usuariosService.findOne(payload.sub);

        if (!usuario || !usuario.activo) {
            throw new UnauthorizedException('Token no válido o cuenta inactiva');
        }

        return usuario;
    }
}