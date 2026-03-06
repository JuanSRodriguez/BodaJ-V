const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { Resend } = require('resend');

admin.initializeApp();

// Configuración global para v2
setGlobalOptions({
  region: 'us-central1',
  memory: '256MiB'
});

const resend = new Resend('re_TZqvNsc7_MWRosfvsp3d4vbF91ekEAJy9');

/**
 * Lógica principal para enviar el resumen de tareas
 */
async function sendSummary() {
  console.log('--- Iniciando sendSummary (Branding: Juan&Vale) ---');
  try {
    const db = getFirestore('jvtemporal');

    const weddingDoc = await db.collection('weddings').doc('default-wedding').get();
    if (!weddingDoc.exists) {
      return { success: false, message: 'No wedding doc found' };
    }

    const weddingData = weddingDoc.data();
    const pendingTasks = (weddingData.tasks || []).filter(t => t.status !== 'DONE');

    if (pendingTasks.length === 0) {
      return { success: true, message: 'No pending tasks' };
    }

    const taskListHtml = pendingTasks.slice(0, 15).map(t => `
            <li style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 8px; list-style: none;">
                <strong style="color: #e11d48; font-family: serif;">💍 ${t.title || 'Tarea'}</strong><br/>
                <small style="color: #999;">${t.category || 'General'}</small>
            </li>
        `).join('');

    const recipient = 'sebastianrocu@gmail.com';

    const emailResponse = await resend.emails.send({
      from: 'Boda Juan & Vale <onboarding@resend.dev>',
      to: [recipient],
      subject: '📝 Resumen de Tareas: Boda Juan & Vale / ' + (new Date().toLocaleDateString()),
      html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #f0f0f0; border-radius: 20px;">
                    <h1 style="font-family: serif; font-style: italic; text-align: center; color: #000; border-bottom: 2px solid #e11d48; padding-bottom: 15px;">Boda Juan & Vale</h1>
                    <p style="text-align: center; text-transform: uppercase; font-size: 10px; letter-spacing: 2px; color: #999;">Planificador de Boda</p>
                    
                    <p style="margin-top: 25px;">Hola chicos, aquí tienen la lista actualizada de pendientes para hoy:</p>
                    
                    <ul style="padding: 0; margin-top: 20px;">
                        ${taskListHtml}
                    </ul>

                    <div style="margin-top: 30px; text-align: center; background: #fafafa; padding: 20px; border-radius: 15px;">
                        <p style="font-size: 13px; color: #666;">Tareas por resolver: <strong>${pendingTasks.length}</strong></p>
                        <a href="https://temporaljv-aa2e2.web.app/" style="display: inline-block; background: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 12px;">IR AL PLANIFICADOR</a>
                    </div>
                    
                    <p style="text-align: center; font-size: 10px; color: #ccc; margin-top: 30px;">Notificaciones automáticas de Boda J&V</p>
                </div>
            `
    });

    if (emailResponse.error) {
      console.error('Error Resend:', emailResponse.error);
      return { success: false, error: emailResponse.error };
    }

    return { success: true, id: emailResponse.data.id };

  } catch (err) {
    console.error('CRASH:', err);
    return { success: false, error: err.message };
  }
}

exports.sendPendingTasksSummary = onSchedule({
  schedule: '0 9 * * 1,5',
  timeZone: 'America/Bogota',
}, async (event) => {
  await sendSummary();
});

exports.testEmailTrigger = onRequest(async (req, res) => {
  const result = await sendSummary();
  res.status(result.success ? 200 : 500).json(result);
});


