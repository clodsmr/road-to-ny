// pages/api/sendNotification.ts
import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

// ✅ Inizializza Firebase Admin usando la variabile d'ambiente
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  try {
    const { targetUid } = req.body;
    if (!targetUid) return res.status(400).json({ error: "Missing targetUid" });

    // 🔍 Recupera il token FCM dell'utente target da Firestore
    const userDoc = await db.collection("users").doc(targetUid).get();
    const fcmToken = userDoc.data()?.fcmToken;

    if (!fcmToken) {
      console.warn(`Nessun token FCM trovato per utente ${targetUid}`);
      return res.status(404).json({ error: "Token non trovato" });
    }

    // 💬 Componi il messaggio da inviare
    const message = {
      notification: {
        title: "Risparmia!!! 💰",
        body: "È ora di mettere da parte qualche soldino o niente chuckino 😉",
      },
      token: fcmToken,
    };

    // 🚀 Invia la notifica push
    await admin.messaging().send(message);

    console.log(`✅ Notifica inviata a ${targetUid}`);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Errore invio notifica:", err);
    return res.status(500).json({ error: "Errore invio notifica" });
  }
}
