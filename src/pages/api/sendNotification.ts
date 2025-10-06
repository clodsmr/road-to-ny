// pages/api/sendNotification.ts
import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

if (!admin.apps.length) {
  const serviceAccount = require("../../../serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = getFirestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  try {
    const { targetUid } = req.body;
    if (!targetUid) return res.status(400).json({ error: "Missing targetUid" });

    // recupera il token FCM dell'utente target
    const userDoc = await db.collection("users").doc(targetUid).get();
    const fcmToken = userDoc.data()?.fcmToken;
    if (!fcmToken) return res.status(404).json({ error: "Token non trovato" });

    const message = {
      notification: {
        title: "Risparmia!!! 💰",
        body: "È ora di mettere da parte qualche soldino o niente chuckino 😉",
      },
      token: fcmToken,
    };

    await admin.messaging().send(message);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Errore invio notifica" });
  }
}
