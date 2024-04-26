import { Request, Response } from "express";
import { CreateContact } from "../validations/contact.validations";
import prisma from "../utils/db";
import { getSocketIO } from "../socket";

export default class ContactController {
  async contact(req: Request<{}, {}, CreateContact["body"]>, res: Response) {
    const newContact = await prisma.contact.create({
      data: req.body,
    });
    const socket = getSocketIO();
    socket.emit("contact", newContact);
    return res.status(201).json({
      message: "Tạo contact thành công",
      contact: newContact,
    });
  }
}
