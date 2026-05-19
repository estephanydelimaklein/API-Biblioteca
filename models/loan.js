import mongoose from "mongoose";
import { boolean } from "webidl-conversions";

const LoanSchema = new mongoose.Schema(
    {
        userId: {
            type: Number,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        bookId: {
            type: Number,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        dataEmprestimo: {
            type: Number,
            required: true,
        },
        dataPrevistaDevolucao: {
            type: Number,
            required: true,
        },
        dataDevolucao: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },enum: ["ativo", "devolvido", "atrasado"],
        multa: {
            type: Number,
            required: true,
        },
    }
)
export default mongoose.model("Loan", LoanSchema);