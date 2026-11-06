import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import { UsuarioEntity } from "src/usuarios/entities/usuario.entity";

export const GetUser = createParamDecorator(
    (data: keyof UsuarioEntity | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as UsuarioEntity;

        if(!user) {
            throw new InternalServerErrorException(`No se pudo obtener el usuario de la solicitud o verifique la solicitud de autenticación`);
        }

        return data ? user[data] : user;
    }
)

