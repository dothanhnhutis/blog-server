import express from "express";
import { UserLocals } from "../validations/user.validations";
declare global {
  namespace Express {
    interface Locals {
      csrf?: string;
      user: UserLocals | null;
    }
  }
}
