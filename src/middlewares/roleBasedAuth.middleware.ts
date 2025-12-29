import { Request, Response, NextFunction } from "express";
interface AuthUser {
  role: string[];
  id: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
const roleBasedAuth = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userRoles = req.user?.role;
      if (!userRoles) {
        return res.status(401).json({ message: "No valid role found" });
      }
      if (allowedRoles.some((role) => userRoles.includes(role))) {
        return next();
      }
      return res.status(403).json({
        message: "User not authenticated to access this resource",
      });
    } catch (err: any) {
      return next(err);
    }
  };
};

export { roleBasedAuth };
