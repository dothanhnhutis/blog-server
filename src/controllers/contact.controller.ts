import { Request, Response } from "express";
import {
  CreateContact,
  EditContact,
  QueryContact,
} from "../validations/contact.validations";
import prisma from "../utils/db";
import { getSocketIO } from "../socket";
import { NotFoundError } from "../error-handler";

export default class ContactController {
  async createContact(
    req: Request<{}, {}, CreateContact["body"]>,
    res: Response
  ) {
    const newContact = await prisma.contact.create({
      data: req.body,
    });
    const socket = getSocketIO();
    socket.emit("contact", newContact);
    return res.status(201).json({
      message:
        "Cảm ơn bạn đã liên hệ với chúng tôi. Bộ phẩn chăm sóc khách hàng đã nhận được thông tin và sẽ liên hệ lại với bạn trong vòng 24h.",
      contact: newContact,
    });
  }

  async getContact(
    req: Request<{}, {}, {}, QueryContact["query"]>,
    res: Response
  ) {
    const { isReaded, contactTag } = req.query;
    const contacts = await prisma.contact.findMany({
      where: {
        isReaded: { equals: isReaded ? isReaded == "true" : undefined },
        contactTag: {
          equals: contactTag
            ? (contactTag as EditContact["body"]["contactTag"])
            : undefined,
        },
      },
    });
    return res.status(200).json(contacts);
  }

  async editContact(
    req: Request<{ id: string }, {}, EditContact["body"]>,
    res: Response
  ) {
    const id = req.params.id;
    const contact = await prisma.contact.findUnique({
      where: {
        id,
      },
    });
    if (!contact) throw new NotFoundError();
    const newContact = await prisma.contact.update({
      where: { id },
      data: req.body,
    });

    return res.status(200).json({
      message: "Cập nhật contact thành công",
      contact: newContact,
    });
  }
}
