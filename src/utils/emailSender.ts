import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { transporter } from "../config/nodemailer";

export const sendEmail = async (
  email: string,
  subject: string,
  templateFile: string,
  data?: any
) => {
  try {
    const templatePath = path.join(__dirname, "../template", templateFile);
    const templateSource = fs.readFileSync(templatePath, "utf-8");
    const compileTemplate = Handlebars.compile(templateSource);
    const html = compileTemplate(data);
    await transporter.sendMail({
      from: process.env.MAL_SENDER,
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
