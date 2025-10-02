import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, password } = req.body;
  if (!name || !password) return res.status(400).json({ message: "Nome e password richiesti" });

  const user = await prisma.user.findUnique({ where: { name } });
  if (!user) return res.status(400).json({ message: "Utente non trovato" });
  if (user.password !== password) return res.status(400).json({ message: "Password errata" });

  res.json({ ok: true, user: { id: user.id, name: user.name } });
}
