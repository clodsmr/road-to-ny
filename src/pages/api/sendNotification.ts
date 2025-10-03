// pages/api/sendNotification.ts
import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS || "{}")
    ),
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { targetUid } = req.body;

    if (!targetUid) {
      return res.status(400).json({ error: "targetUid richiesto" });
    }

    const userDoc = await admin.firestore().doc(`users/${targetUid}`).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    const userData = userDoc.data();
    if (!userData?.fcmToken) {
      return res
        .status(404)
        .json({ error: "Token FCM non presente per questo utente" });
    }

    try {
      await admin.messaging().send({
        token: userData.fcmToken,
        notification: {
          title: "Risparmia!",
          body: "💸",
        },
      });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Errore invio notifica" });
    }
  }

  res.status(405).end();
}
