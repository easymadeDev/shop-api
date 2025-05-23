import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { Student } from "src/student/entities/student.entity";
import { StudentService } from "src/student/student.service";
import { ExtractJwt, StrategyOptions } from 'passport-jwt';
import { Request } from 'express';

const cookieExtractor = (req: Request): string | null => {
  return req?.cookies?.['isAuthenticated'] || null;
};

const jwtFromRequest = (req: Request) => {
  const authHeaderToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  if (authHeaderToken) return authHeaderToken;
  return cookieExtractor(req);
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly studentService: StudentService) {
   super({
      jwtFromRequest: jwtFromRequest,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: any) {

      console.log('JWT payload:', payload);

  if (!payload.email) {
    throw new UnauthorizedException('Token payload missing email');
  }
  
    const user = await this.studentService.findEmail(payload.email);

    if (!user) {
      throw new UnauthorizedException('Login first to access this endpoints');
    }
   return { id: user.id, email: user.email };
  }


  
}
