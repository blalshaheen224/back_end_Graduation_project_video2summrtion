const express = require("express");
const router = express.Router();


const upload = require("../../middlewares/uploadMedia")
const protect = require("../../middlewares/auth.middleware");
const allowedTo = require("../../middlewares/role.middleware");
const roles = require("../../utils/userRole");
const {
  uploadMedia,
  getJobStatus,
  getTranscriptionResult,
} = require("../Transcription/Transcription.controller");

 /**
  * @swagger
  * /api/Transcription/upload:
  *   post:
  *     summary: Upload media file and start transcription
  *     tags:
  *       - Transcription
  *     requestBody:
  *       required: true
  *       content:
  *         multipart/form-data:
  *           schema:
  *             type: object
  *             required:
  *               - media
  *             properties:
  *               media:
  *                 type: string
  *                 format: binary
  *     responses:
  *       200:
  *         description: File uploaded and transcription started
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/UploadResponse'
  *       400:
  *         description: No file uploaded
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/ErrorResponse'
  */

router.post("/upload", upload.single("media"), uploadMedia);

// متابعة حالة التحويل

 /**
 * @swagger
  * /api/Transcription/job/{jobId}/status:
  *   get:
  *     summary: Get transcription job status
 *     tags:
 *       - Transcription
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         example: c463714c-edf4-4590-b8e4-18fd4810e972
 *     responses:
 *       200:
 *         description: Job status fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobStatusResponse'
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

 router.get("/job/:jobId/status", getJobStatus);

// جلب النص النهائي

/**
 * @swagger
 * /transcription/{jobId}:
 *   get:
 *     summary: Get final transcription result
 *     tags:
 *       - Transcription
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         example: abc123
 *     responses:
 *       200:
 *         description: Transcription completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TranscriptionResult'
 *       202:
 *         description: Transcription still processing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: processing
 *       500:
 *         description: Transcription failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.get("/transcription/:jobId", getTranscriptionResult);

module.exports = router;