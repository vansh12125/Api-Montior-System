import ApiError from "../../../error/ApiError.js";
import { hashPassword } from "../../bcryptService.js";
import { Roles } from "../../../enums/index.js";

export default class AuthService {
  constructor(userRepository) {
    if (!userRepository) {
      throw new Error("User repository is required");
    }
    this.userRepository = userRepository;
  }

  async registerClientAdmin(reqBody) {
    const {
      name,
      username,
      email,
      password,
      clientName,
      clientEmail,
      description,
      website,
    } = reqBody;

    const existingUser = await this.userRepository.findByEmailOrUsername(
      email,
      username,
    );

    if (existingUser) {
      if (existingUser.email === email) {
        throw ApiError.conflict("Email Already Exist", {
          field: "email",
          code: "EMAIL_ALREADY_EXISTS",
        });
      } else if (existingUser.username === username) {
        throw ApiError.conflict("Username Already Exist", {
          field: "username",
          code: "USERNAME_ALREADY_EXISTS",
        });
      }
    }

    const hashedPass = await hashPassword(password);

    return await this.userRepository.create({
      name,
      username,
      email,
      password: hashedPass,
      clientName,
      clientEmail,
      description,
      website,
      role: Roles.CLIENT_ADMIN,
    });
  }
}
