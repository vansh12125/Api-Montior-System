import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import fs from "fs/promises";
import path from "path";
import { requiredEnv } from "../../../utils/index.js";
import { logger } from "../../../configs/index.js";

export default class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: requiredEnv("EMAIL_USER"),
        pass: requiredEnv("EMAIL_PASSWORD"),
      },
    });

    this.templatePath = path.join(
      process.cwd(),
      "src",
      "template",
      "client-viewer-register.html",
    );
  }

  async sendEmail(toEmail, serviceName, clientName, username, tempPassword) {
    try {
      let html = await fs.readFile(this.templatePath, "utf-8");
      const template = Handlebars.compile(html);
      html = template({
        clientName,
        serviceName,
        username,
        tempPassword,
        loginUrl: "http://localhost:5000/signin",
      });

      await this.transporter.sendMail({
        from: `API Monitor`,
        to: toEmail,
        subject: `You're invited to join ${serviceName}`,
        html,
      });
    } catch (error) {
      logger.error(`Error occurred in sendEmail service: ${error}`);

      throw error;
    }
  }
}
