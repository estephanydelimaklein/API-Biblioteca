import mongoose from "mongoose";


const BookSchema = new mongoose.Schema(
    {
        titulo: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        autor: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        categoria: {
            type: String,
            required: true,
            trim: true,
        },
        ano: {
            type: Number,
            required: true,
        },
        quantidadeTotal: {
            type: Number,
            required: true,
        },
        quantidadeDisponivel: {
            type: Number,
            required: true,
        },
        ativo: {
            type: Boolean,
            required: true,
            default: true,

        },
    }
)
export default mongoose.model("Book", BookSchema);