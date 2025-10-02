import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, password } = req.body;
  if (!name || !password) return res.status(400).json({ message: "Nome e password richiesti" });

  try {
    const user = await prisma.user.create({
      data: { name, password },
    });
    res.json({ ok: true, user: { id: user.id, name: user.name } });
  } catch (err: any) {
    if (err.code === "P2002") res.status(400).json({ message: "Nome già registrato" });
    else res.status(500).json({ message: "Errore server" });
  }
}
