
const swaggerJSDoc = require("swagger-jsdoc")



/**
 * @swagger
 * components:
 *   schemas:
 *     UploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         jobId:
 *           type: string
 *           example: "8c52ade1-80a0-4679-a811-16657a704fc1"
 *         fileName:
 *           type: string
 *           example: "test_sound.mp3"
 *         fileSize:
 *           type: number
 *           example:  55966
 *         status:
 *           type: string
 *           example: "processing"
 *
 *     JobStatusResponse:
 *       type: object
 *       properties:
 *         progress:
 *           type: number
 *           example: 45
 *         jobId:
 *           type: string
 *           example: "abc123"
 *         status:
 *           type: string
 *           example: "processing"
 *         estimatedTime:
 *           type: string
 *           example: "15s"
 *
 *     TranscriptionResult:
 *       type: object
 *       properties:
 *         text:
 *           type: string
 *           example: "Hello world transcription..."
 *
 *     CompletedTranscription:
 *       type: object
 *       properties:
 *         transcription:
 *           type: string
 *         summary:
 *           type: string
 *         keywords:
 *           type: string
 *         status:
 *           type: string
 *           example: "completed"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Something went wrong"
 */





/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "64f1a2b3c4"
 *         fullName:
 *           type: string
 *           example: "Ahmed Ali"
 *         email:
 *           type: string
 *           example: "ahmed@gmail.com"
 *         phoneNumber:
 *           type: string
 *           example: "01012345678"
 *         avatar:
 *           type: string
 *           example: "/uploads/avatar.png"
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - password
 *       properties:
 *         fullName:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         phoneNumber:
 *           type: string
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         sucess:
 *           type: boolean
 *         newSignToken:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/User'
 *
 *     RefreshResponse:
 *       type: object
 *       properties:
 *         sucess:
 *           type: boolean
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *
 *     PaginatedUsers:
 *       type: object
 *       properties:
 *         success:
 *           type: string
 *         page:
 *           type: number
 *         totalPage:
 *           type: number
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */




/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 */

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "video_to_summary_back_end",
      version: "1.0.0",
      description: "Simple API Documentation",
    },
    servers: [
      {
        url: "http://localhost:8080",
      },
    ],
  },
  apis: ["./src/modules/**/*.routes.js"], // الأماكن اللي فيها التوثيق
};
console.log(process.cwd());
const swaggerSpec = swaggerJSDoc(options);



module.exports = { swaggerSpec };
